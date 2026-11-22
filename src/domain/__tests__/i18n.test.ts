import { describe, expect, it } from 'vitest';
import { fr } from '../../i18n/fr';
import { de } from '../../i18n/de';
import { en } from '../../i18n/en';
import { detectLang, formatList, formatYears, translate } from '../../i18n';
import { LABEL_TABLES, cardShort, cardText, credentialLabel, programmeName, qualifierLabel, qualityText, requirementLabel, trainingLabel, variantChip } from '../../i18n/labels';
import { BACHELOR_IDS, M } from '../data';
import { ITEM_IDS, QUALITY_ITEM_IDS } from '../profile';
import { ALL_VARIANTS } from '../routes';

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('traductions', () => {
  it('ont les mêmes clés et les mêmes variables dans les trois langues', () => {
    const keys = Object.keys(fr).sort();
    expect(Object.keys(de).sort()).toEqual(keys);
    expect(Object.keys(en).sort()).toEqual(keys);
    for (const k of keys as (keyof typeof fr)[]) {
      expect(placeholders(de[k]), k).toBe(placeholders(fr[k]));
      expect(placeholders(en[k]), k).toBe(placeholders(fr[k]));
      expect(de[k].trim().length, k).toBeGreaterThan(0);
      expect(en[k].trim().length, k).toBeGreaterThan(0);
    }
  });
  it('ne contiennent ni tiret cadratin ni pourcentage affiché au visiteur', () => {
    for (const dict of [fr, de, en]) for (const [k, v] of Object.entries(dict)) {
      expect(v, k).not.toMatch(/—/);
      if (!k.startsWith('panel.staff')) expect(v, k).not.toMatch(/\d\s?%(?!\w)/);
    }
  });
  it('utilisent l’orthographe suisse en allemand', () => {
    for (const [k, v] of Object.entries(de)) expect(v, k).not.toMatch(/ß/);
  });
  it('couvrent toutes les données affichées', () => {
    for (const lang of ['fr', 'de', 'en'] as const) {
      for (const id of BACHELOR_IDS) expect(programmeName(id, lang)).not.toMatch(/^ba_/);
      for (const id of ITEM_IDS) { expect(cardText(id, lang).length).toBeGreaterThan(8); expect(cardShort(id, lang).length).toBeGreaterThan(4); }
      for (const id of QUALITY_ITEM_IDS) expect(qualityText(id, lang).length).toBeGreaterThan(8);
      for (const t of M.trainings) if (t.id !== 'tr_dubs') expect(LABEL_TABLES.TRAINING[t.id], t.id).toBeDefined();
      for (const c of M.credentials) if (c.id !== 'cr_dubs') expect(LABEL_TABLES.CREDENTIAL[c.id], c.id).toBeDefined();
      for (const r of M.requirements) expect(requirementLabel(r.id, lang)).not.toBe(r.id);
      for (const q of new Set(M.admissionRules.map((r) => r.qualifier).filter(Boolean) as string[])) expect(qualifierLabel(q, lang), q).not.toBe(q);
      for (const v of ['auto', ...ALL_VARIANTS]) expect(variantChip(v, lang)).not.toBe(v);
      expect(trainingLabel('tr_ms_sante', lang, true)).toBe(trainingLabel('tr_ms_ts', lang, true));
      expect(credentialLabel('cr_ms_sante', lang, true)).toBe(credentialLabel('cr_ms_ts', lang, true));
    }
    expect(ITEM_IDS.every((id) => LABEL_TABLES.CARD[id])).toBe(true);
    expect(QUALITY_ITEM_IDS.every((id) => LABEL_TABLES.QUALITY[id])).toBe(true);
  });
  it('formatent les durées et les listes', () => {
    expect(formatYears('fr', 3, 4)).toBe('3 à 4 ans');
    expect(formatYears('fr', 4)).toBe('4 ans');
    expect(formatYears('fr', 1)).toBe('1 an');
    expect(formatYears('fr', 4.5)).toBe('4,5 ans');
    expect(formatYears('de', 3, 4)).toBe('3 bis 4 Jahre');
    expect(formatYears('en', 0.5)).toBe('0.5 years');
    expect(formatList('fr', ['a', 'b', 'c'])).toBe('a, b et c');
    expect(formatList('en', ['a', 'b'], 'app.or')).toBe('a or b');
    expect(translate('fr', 'cards.progress', { n: 3, total: 12 })).toBe('Carte 3 sur 12');
  });
  it('choisissent la langue : adresse, puis choix enregistré, puis navigateur', () => {
    expect(detectLang('?lang=de', 'en', 'fr-CH')).toBe('de');
    expect(detectLang('', 'en', 'fr-CH')).toBe('en');
    expect(detectLang('', null, 'de-CH')).toBe('de');
    expect(detectLang('?lang=xx', null, 'it-CH')).toBe('fr');
  });
});
