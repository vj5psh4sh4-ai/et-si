import { describe, expect, it } from 'vitest';
import { CFC_INDEX, RAW_CFC_COUNT, cfcExamplesFor, cfcKey, cfcListFor, cleanCfcLabel, doorsForCfc, searchCfc } from '../cfc';
import { buildProfile } from '../profile';
import { playExpress } from './personas';

const door = (q: string, programmeId: string) => doorsForCfc(searchCfc(q)[0]).find((d) => d.programmeId === programmeId)!;

describe('métiers CFC', () => {
  it('regroupe les graphies d’un même métier', () => {
    expect(cfcKey('Laborantin / Laborantine')).toBe(cfcKey('Laborantin·e'));
    expect(cfcKey('Laborantin·e CFC')).toBe(cfcKey('Laborantin·e'));
    expect(cfcKey('Géomaticien / Géomaticienne')).toBe(cfcKey('Géomaticien·ne CFC'));
    expect(cfcKey('Monteur / Monteuse automaticien')).toBe('monteur automaticien');
    expect(cfcKey('Dessinateur-constructeur industriel / Dessinatrice-constructrice industrielle')).toBe(cfcKey('Dessinateur·trice-constructeur·trice industriel·le CFC'));
    expect(cfcKey('Dessinateur / Dessinatrice en construction microtechnique (à partir de la rentrée académique 2020-2021)')).toBe('dessinateur en construction microtechnique');
    expect(cfcKey('Laborantin·e en physique')).not.toBe(cfcKey('Laborantin·e'));
    expect(cleanCfcLabel('Polymécanicien·ne CFC')).toBe('Polymécanicien·ne');
  });
  it('n’a pas de doublon dans l’index', () => {
    const keys = CFC_INDEX.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(CFC_INDEX.length).toBeLessThan(RAW_CFC_COUNT);
    expect(CFC_INDEX.length).toBeGreaterThan(120);
    expect(CFC_INDEX.filter((e) => e.key.startsWith('laborantin')).map((e) => e.key)).toEqual(['laborantin', 'laborantin en physique']);
  });
  it('trouve un métier sans accent ni majuscule', () => {
    expect(searchCfc('polymeca')[0].label).toBe('Polymécanicien·ne');
    expect(searchCfc('EMPLOYE de commerce')[0].label).toBe('Employé·e de commerce');
    expect(searchCfc('')).toEqual([]);
    expect(searchCfc('zzzz')).toEqual([]);
  });
  it('reproduit les exemples de la proposition', () => {
    expect(searchCfc('polymecanicien')[0].directProgrammeIds).toEqual(expect.arrayContaining(['ba_heia_gm', 'ba_heia_ge', 'ba_heia_isc']));
    expect(searchCfc('employe de commerce')[0].directProgrammeIds).toEqual(['ba_heg_ee']);
    expect(searchCfc('assistant socio')[0].directProgrammeIds).toEqual(['ba_hets_ts']);
  });
  it('sépare l’accès direct de l’accès avec complément', () => {
    expect(door('polymecanicien', 'ba_heia_gm').kind).toBe('direct');
    const ee = door('polymecanicien', 'ba_heg_ee');
    expect(ee.kind).toBe('complement');
    expect(ee.requirementIds).toContain('PRATIQUE_ECO_1AN');
    const si = door('polymecanicien', 'ba_heds_si');
    expect(si.kind).toBe('complement');
    expect(si.trainingIds).toEqual(['tr_mc_sante']);
    expect(door('assistant socio', 'ba_hets_ts').kind).toBe('direct');
    expect(door('cuisinier', 'ba_hets_ts').requirementIds).toContain('EXP_SOCIAL_20');
  });
  it('ouvre les 10 filières depuis n’importe quel CFC, directement ou avec complément', () => {
    for (const e of [searchCfc('cuisinier')[0], searchCfc('polymecanicien')[0], searchCfc('vitrier')[0]]) expect(doorsForCfc(e)).toHaveLength(10);
  });
  it('nomme des CFC sur le sentier, sans doublon', () => {
    const user = buildProfile({ answers: playExpress('noah') });
    const ex = cfcExamplesFor('ba_heia_gm', user);
    expect(ex).toHaveLength(3);
    expect(new Set(ex.map(cfcKey)).size).toBe(3);
    expect(cfcExamplesFor('ba_hets_ts', user)).toEqual(['Assistant·e socio-éducatif·ve']);
    expect(cfcExamplesFor('ba_heds_osteo', user)).toEqual([]);
    expect(cfcListFor('ba_heia_gm').labels.length).toBeGreaterThan(60);
  });
});
