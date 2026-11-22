// Petites fonctions d'affichage partagées par les écrans de la v0.3.1.
import type { Lang } from '../i18n/lang';
import { formatList, formatYears, type TFn } from '../i18n';
import { classLabel, credentialLabel, programmeName } from '../i18n/labels';
import { PROGRAMMES } from '../domain/data';
import type { Route } from '../domain/routes';
import type { Situation } from '../domain/situation';

/** Libellé du point de départ d'un sentier : « CO, 10H », « Maturité gymnasiale »… */
export function startLabel(s: Situation, startId: string, lang: Lang, t: TFn): string {
  if (startId.startsWith('co_') || startId.startsWith('os_')) {
    const parts = [t('sit.short.co')];
    if (s.id === 'co' && s.schoolYear) parts.push(`${s.schoolYear}H`);
    if (s.classType) parts.push(classLabel(s.classType, lang));
    return parts.join(', ');
  }
  if (startId === 'adulte_25') return t('sit.start.adulte');
  return credentialLabel(startId, lang);
}

/** Libellé court de la situation, pour les en-têtes : « CO, 10H », « Apprentissage »… */
export function situationLabel(s: Situation, lang: Lang, t: TFn): string {
  if (s.id === 'co') return startLabel(s, 'co_g', lang, t);
  if (s.id === 'non_precise') return t('sit.short.non_precise');
  return t(`sit.short.${s.id}` as const);
}

/** Temps de marche d'un sentier. Jamais un pourcentage. */
export function walkTime(route: Route, lang: Lang, t: TFn): string {
  if (route.yearsMax === 0) return t('panel.walk.direct');
  return formatYears(lang, route.yearsMin, route.yearsMax);
}

const EXPERIENCE = new Set(['EMT_1AN', 'STAGE_ARCHI', 'PRATIQUE_ECO_1AN', 'EXP_SOCIAL_20', 'EXP_40_DONT_20', 'STAGE_8_SEM']);

/** Questions à poser au stand, tirées de ce que le sentier affiché suppose ou demande. */
export function questionsFor(programmeId: string, route: Route | null, lang: Lang, t: TFn, max = 3): string[] {
  const p = PROGRAMMES[programmeId];
  if (!p) return [];
  const name = programmeName(programmeId, lang);
  const out: string[] = [];
  const add = (q: string) => {
    if (!out.includes(q)) out.push(q);
  };
  if (route) {
    const adm = route.admission;
    const trainings = route.steps.flatMap((st) => (st.kind === 'training' ? [st] : []));
    if (adm.assumption === 'cfc_liste_filiere') add(t('q.cfcList', { name }));
    if (adm.requirementIds.includes('REGULATION') || p.regulated) add(t('q.regulation', { name }));
    if (trainings.some((st) => st.trainingId === 'tr_mc_sante')) add(t('q.modules'));
    if (adm.requirementIds.includes('PIBS')) add(t('q.pibs'));
    if (adm.requirementIds.some((id) => EXPERIENCE.has(id))) add(t('q.experience', { name }));
    if (trainings.some((st) => st.trainingId.startsWith('tr_ms'))) add(t('q.ms', { name }));
    if (adm.access === 'sur_dossier') add(t('q.dossier', { name }));
  } else if (p.regulated) add(t('q.regulation', { name }));
  if (p.orientations.length >= 2) add(t('q.orientations', { list: formatList(lang, p.orientations.slice(0, 3), 'app.and') }));
  if (p.modes.includes('temps_partiel') || p.modes.includes('en_emploi')) add(t('q.modes', { name }));
  if (p.languages.includes('fr-de')) add(t('q.bilingual', { name }));
  add(t('q.week', { name }));
  return out.slice(0, max);
}
