import { describe, expect, it } from 'vitest';
import { BACHELOR_IDS, RULES, TRAININGS } from '../data';
import { alternativesFor, pickRoute, routesFor, variantsFor, type Route } from '../routes';
import { endOfCompulsorySchool, entryYears, stageFor, type Situation } from '../situation';

const co = (schoolYear: 9 | 10 | 11 | null = 10, classType: Situation['classType'] = null): Situation => ({ id: 'co', schoolYear, classType });
const sit = (id: Situation['id']): Situation => ({ id, schoolYear: null, classType: null });
const trainings = (r: Route) => r.steps.filter((s) => s.kind === 'training').map((s) => (s.kind === 'training' ? s.trainingId : ''));

describe('point de départ', () => {
  it('part de la classe G par défaut, de la Sekundarklasse en allemand', () => {
    expect(stageFor(co(), 'fr')).toBe('co_g');
    expect(stageFor(co(), 'en')).toBe('co_g');
    expect(stageFor(co(), 'de')).toBe('os_sek');
    expect(stageFor(co(10, 'pg'), 'fr')).toBe('co_pg');
    expect(stageFor(co(10, 'eb'), 'de')).toBe('os_real');
  });
  it('calcule la fin du CO avec une année scolaire qui commence en août', () => {
    expect(endOfCompulsorySchool(10, new Date('2027-02-24'))).toBe(2028);
    expect(endOfCompulsorySchool(11, new Date('2027-02-24'))).toBe(2027);
    expect(endOfCompulsorySchool(9, new Date('2026-09-01'))).toBe(2029);
    expect(endOfCompulsorySchool(11, new Date('2026-07-31'))).toBe(2026);
  });
  it('donne une rentrée au plus tôt, seulement de la 9H à la 11H', () => {
    expect(entryYears(co(10), 3, 4, new Date('2027-02-24'))).toEqual([2031, 2032]);
    expect(entryYears(co(11), 4.5, 4.5, new Date('2027-02-24'))).toEqual([2032, 2032]);
    expect(entryYears(co(null), 3, 4)).toBeNull();
    expect(entryYears(sit('college'), 0, 1)).toBeNull();
  });
});

describe('chemins', () => {
  it('ouvre les 10 Bachelors depuis chaque situation et chaque type de classe', () => {
    const situations: Situation[] = [co(10), co(10, 'eb'), co(10, 'pg'), sit('non_precise'), sit('apprentissage'), sit('college'), sit('ecg'), sit('autre')];
    for (const s of situations) for (const lang of ['fr', 'de'] as const) for (const pid of BACHELOR_IDS) {
      expect(routesFor(pid, s, lang).best, `${s.id} ${s.classType} ${lang} ${pid}`).not.toBeNull();
    }
  });
  it('propose quatre voies au CO, sans école de métiers quand aucune ne mène à la filière', () => {
    expect(variantsFor(co(), 'fr').map((v) => v.id)).toEqual(['apprentissage', 'ecole_metiers', 'ecg', 'college']);
    expect(routesFor('ba_heia_archi', co(), 'fr').byVariant.ecole_metiers).toBeUndefined();
    expect(trainings(routesFor('ba_heg_ee', co(), 'fr').byVariant.ecole_metiers!)).toEqual(['tr_ec']);
    expect(trainings(routesFor('ba_heds_si', co(), 'fr').byVariant.ecole_metiers!)).toEqual(['tr_essg']);
  });
  it('reproduit les bascules de la proposition pour Léa', () => {
    const ts = routesFor('ba_hets_ts', co(), 'fr');
    expect([ts.byVariant.apprentissage!.yearsMin, ts.byVariant.apprentissage!.yearsMax]).toEqual([3, 4]);
    expect(ts.byVariant.apprentissage!.admission.assumption).toBe('cfc_ase');
    expect(trainings(ts.byVariant.ecg!)).toEqual(['tr_ecg', 'tr_ms_ts']);
    expect(ts.byVariant.ecg!.yearsMin).toBe(4);
    expect(ts.byVariant.college!.yearsMin).toBe(5);
    expect(ts.byVariant.college!.admission.requirementIds).toContain('EXP_40_DONT_20');
    const osteo = routesFor('ba_heds_osteo', co(), 'fr');
    expect(trainings(osteo.byVariant.apprentissage!)).toEqual(['tr_cfc_mp1', 'tr_mc_sante']);
    expect([osteo.byVariant.apprentissage!.yearsMin, osteo.byVariant.apprentissage!.yearsMax]).toEqual([4, 5]);
    expect(osteo.byVariant.apprentissage!.access).toBe('conditionnel');
  });
  it('donne une fourchette cohérente avec les durées des formations', () => {
    for (const pid of BACHELOR_IDS) for (const r of Object.values(routesFor(pid, co(), 'fr').byVariant)) {
      expect(r!.yearsMax).toBeGreaterThanOrEqual(r!.yearsMin);
      const min = r!.steps.reduce((n, s) => n + (s.kind === 'training' ? TRAININGS[s.trainingId].durationYears.min : 0), 0);
      expect(r!.yearsMin).toBeGreaterThanOrEqual(min);
    }
  });
  it('ne montre jamais un chemin « non admis », ni la passerelle Dubs, ni un détour par une ES', () => {
    for (const pid of BACHELOR_IDS) for (const s of [co(), sit('apprentissage'), sit('college'), sit('ecg')]) {
      const pr = routesFor(pid, s, 'fr');
      for (const r of Object.values(pr.byVariant)) {
        expect(r!.access).not.toBe('non_admis');
        expect(RULES[r!.admission.ruleId].access).not.toBe('non_admis');
        expect(trainings(r!)).not.toContain('tr_dubs');
        expect(trainings(r!)).not.toContain('tr_es');
      }
    }
  });
  it('regroupe les maturités spécialisées équivalentes sous une étape sans domaine', () => {
    const r = routesFor('ba_heia_archi', co(), 'fr').byVariant.ecg!;
    const ms = r.steps.find((s) => s.kind === 'training' && s.trainingId.startsWith('tr_ms_'));
    expect(ms && ms.kind === 'training' && ms.anyMs).toBe(true);
    const ts = routesFor('ba_hets_ts', co(), 'fr').byVariant.ecg!;
    const msTs = ts.steps.find((s) => s.kind === 'training' && s.trainingId === 'tr_ms_ts');
    expect(msTs && msTs.kind === 'training' && !msTs.anyMs).toBe(true);
  });
  it('suit la bascule choisie, et retombe sur le plus court en mode automatique', () => {
    const pr = routesFor('ba_heia_gm', co(), 'fr');
    expect(pickRoute(pr, 'auto')).toBe(pr.best);
    expect(pickRoute(pr, 'college')!.variant).toBe('college');
    expect(pickRoute(routesFor('ba_heia_archi', co(), 'fr'), 'ecole_metiers')).toBeNull();
  });
  it('liste d’autres chemins de la même voie sans répéter la même règle', () => {
    const alts = alternativesFor('ba_heia_gm', co(), 'fr', 'college');
    expect(alts.length).toBeGreaterThan(0);
    expect(alts.some((r) => r.admission.requirementIds.includes('EMT_1AN'))).toBe(true);
  });
  it('depuis un apprentissage, distingue CFC avec maturité et maturité après le CFC', () => {
    const pr = routesFor('ba_heia_isc', sit('apprentissage'), 'fr');
    expect(pr.byVariant.cfc_mp!.yearsMin).toBe(0);
    expect(pr.byVariant.cfc_mp!.admission.assumption).toBe('cfc_liste_filiere');
    expect([pr.byVariant.cfc_mp2!.yearsMin, pr.byVariant.cfc_mp2!.yearsMax]).toEqual([1, 2]);
  });
});
