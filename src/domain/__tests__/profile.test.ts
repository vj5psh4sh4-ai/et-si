import { describe, expect, it } from 'vitest';
import { BACHELOR_IDS, PM, PROGRAMMES } from '../data';
import { MIN_COVERAGE } from '../policy';
import {
  EXPRESS_FIXED, EXPRESS_LENGTH, ITEM_IDS, MISSION_INTERESTS, QUALITY_ITEM_IDS,
  computePanel, coverageOf, buildProfile, expressSequence, rankAll, type Answers,
} from '../profile';
import { MISSIONS } from '../../data/missions';
import type { ActivityFeedback, FeedbackValue } from '../../types';
import { fullAnswers, playExpress } from './personas';

const ids = (xs: { programmeId: string }[]) => xs.map((x) => x.programmeId.replace(/^ba_[a-z]+_/, ''));

const feedback = (choiceId: string, value: FeedbackValue): ActivityFeedback => {
  const m = MISSIONS.find((x) => x.scene.choices.some((c) => c.id === choiceId))!;
  const c = m.scene.choices.find((x) => x.id === choiceId)!;
  return { missionId: m.id, missionTitle: m.title, choiceId, activityLabel: c.activityLabel, tags: c.tags, trackId: c.trackId, feedback: value, consequenceShown: '', timestamp: '' };
};

describe('référentiel', () => {
  it('contient 10 Bachelors, 30 cartes et 25 cartes de forces', () => {
    expect(BACHELOR_IDS).toHaveLength(10);
    expect(ITEM_IDS).toHaveLength(30);
    expect(QUALITY_ITEM_IDS).toHaveLength(25);
  });
  it('relie chaque rôle de mission à des intérêts connus', () => {
    const known = new Set(PM.interests.map((i) => i.id));
    const choiceIds = MISSIONS.flatMap((m) => m.scene.choices.map((c) => c.id));
    expect(Object.keys(MISSION_INTERESTS).sort()).toEqual([...choiceIds].sort());
    for (const weights of Object.values(MISSION_INTERESTS)) for (const id of Object.keys(weights)) expect(known.has(id)).toBe(true);
  });
  it('utilise des cartes fixes qui existent', () => {
    for (const id of EXPRESS_FIXED) expect(ITEM_IDS).toContain(id);
  });
});

describe('parcours express', () => {
  it('pose 12 cartes dans le cas courant, 14 au maximum', () => {
    for (const p of ['lea', 'noah', 'ines', 'malik'] as const) {
      const a = playExpress(p);
      expect(Object.keys(a).length).toBeGreaterThanOrEqual(EXPRESS_LENGTH);
      expect(Object.keys(a).length).toBeLessThanOrEqual(EXPRESS_LENGTH + 2);
    }
  });
  it('garde la même suite quand on revient en arrière', () => {
    const a = playExpress('lea');
    const seq = expressSequence(a);
    const changed: Answers = { ...a, [seq[10]]: 0 };
    expect(expressSequence(changed).slice(0, 12)).toEqual(seq.slice(0, 12));
  });
  it('ne propose que les huit cartes fixes tant qu’elles ne sont pas toutes répondues', () => {
    expect(expressSequence({})).toEqual(EXPRESS_FIXED);
    expect(expressSequence({ q05: 2, q04: 0 })).toEqual(EXPRESS_FIXED);
  });
});

describe('panneau', () => {
  it('Léa : travail social, soins infirmiers et ostéopathie', () => {
    const panel = computePanel({ answers: playExpress('lea') });
    expect(panel.status).toBe('ready');
    expect(ids(panel.trio).sort()).toEqual(['osteo', 'si', 'ts']);
    // Aucune lame en pointillé sans raison tirée d'un « oui ».
    expect(panel.aside).toBeNull();
  });
  it('la lame en pointillé vient d’une école absente du trio et porte une raison', () => {
    const panel = computePanel({ answers: playExpress('noah') });
    expect(panel.aside).not.toBeNull();
    const schools = panel.trio.map((r) => PROGRAMMES[r.programmeId].school);
    expect(schools).not.toContain(PROGRAMMES[panel.aside!.programmeId].school);
    expect(panel.aside!.reasons.length).toBeGreaterThan(0);
  });
  it('Noah : génie mécanique et génie électrique en tête', () => {
    const panel = computePanel({ answers: playExpress('noah') });
    expect(ids(panel.trio)).toEqual(expect.arrayContaining(['gm', 'ge']));
  });
  it('Inès : économie d’entreprise en tête', () => {
    const panel = computePanel({ answers: playExpress('ines') });
    expect(ids(panel.trio)[0]).toBe('ee');
  });
  it('Malik : architecture sur le panneau', () => {
    const panel = computePanel({ answers: playExpress('malik') });
    expect(ids(panel.trio)).toContain('archi');
  });
  it('les 30 cartes donnent le même premier rang que le parcours express pour Léa et Inès', () => {
    expect(ids(computePanel({ answers: fullAnswers('lea') }).trio)).toContain('ts');
    expect(ids(computePanel({ answers: fullAnswers('ines') }).trio)[0]).toBe('ee');
  });
  it('garde les ex æquo du troisième rang, cinq lames au maximum', () => {
    const panel = computePanel({ answers: playExpress('lea') });
    expect(panel.trio.length).toBeGreaterThanOrEqual(3);
    expect(panel.trio.length).toBeLessThanOrEqual(5);
    const si = panel.all.find((r) => r.programmeId === 'ba_heds_si')!;
    const osteo = panel.all.find((r) => r.programmeId === 'ba_heds_osteo')!;
    expect(si.score).toBe(osteo.score);
  });
  it('reste vide sans réponse, et quand tout est refusé', () => {
    expect(computePanel({ answers: {} }).status).toBe('empty');
    const allNo: Answers = Object.fromEntries(ITEM_IDS.map((q) => [q, 0]));
    expect(computePanel({ answers: allNo }).status).toBe('empty');
  });
  it('n’affiche pas une filière dont moins de la moitié des intérêts est connue', () => {
    const panel = computePanel({ answers: { q12: 2 } });
    for (const r of panel.trio) expect(r.coverage).toBeGreaterThanOrEqual(MIN_COVERAGE);
    const user = buildProfile({ answers: { q30: 2 } });
    expect(coverageOf('ba_heia_gc', user)).toBeLessThan(MIN_COVERAGE);
    expect(computePanel({ answers: { q30: 2 } }).status).toBe('empty');
  });
  it('donne à chaque lame au moins une raison, tirée d’un « oui »', () => {
    const answers = playExpress('noah');
    for (const r of computePanel({ answers }).trio) {
      expect(r.reasons.length).toBeGreaterThan(0);
      for (const reason of r.reasons) if (reason.kind === 'card') expect(answers[reason.id]).toBe(2);
    }
  });
  it('les 10 Bachelors peuvent chacun arriver sur un panneau', () => {
    const reached = new Set<string>();
    for (const target of BACHELOR_IDS) {
      const wanted = PM.programmeProfiles.find((pp) => pp.programmeId === target)!.interests;
      const answers: Answers = Object.fromEntries(
        PM.questionnaire.items.map((it) => [it.id, Object.entries(it.interests).some(([k, w]) => w >= 0.5 && wanted[k]) ? 2 : 0]),
      );
      for (const r of computePanel({ answers }).trio) reached.add(r.programmeId);
    }
    expect([...reached].sort()).toEqual([...BACHELOR_IDS].sort());
  });
});

describe('missions', () => {
  it('une mission aimée suffit à faire apparaître des raisons', () => {
    const fb = [feedback('auto-soins', 'refaire'), feedback('lieu-ecouter', 'en_vrai'), feedback('auto-entourage', 'refaire')];
    const panel = computePanel({ answers: {}, feedbacks: fb });
    expect(panel.status).toBe('ready');
    expect(ids(panel.trio)).toEqual(expect.arrayContaining(['si', 'ts']));
    expect(panel.trio[0].reasons.some((r) => r.kind === 'mission')).toBe(true);
  });
  it('« je ne sais pas » ne compte pas, « autre chose » fait baisser', () => {
    expect(computePanel({ answers: {}, feedbacks: [feedback('auto-soins', 'ne_sais_pas')] }).status).toBe('empty');
    const liked = rankAll({ answers: {}, feedbacks: [feedback('campus-numerique', 'refaire')] }).find((r) => r.programmeId === 'ba_heia_isc')!;
    const disliked = rankAll({ answers: {}, feedbacks: [feedback('campus-numerique', 'autre_chose')] }).find((r) => r.programmeId === 'ba_heia_isc')!;
    expect(liked.score).toBeGreaterThan(disliked.score);
  });
  it('les missions et les cartes nourrissent le même profil', () => {
    const answers = playExpress('noah');
    const before = rankAll({ answers }).find((r) => r.programmeId === 'ba_hets_ts')!;
    const after = rankAll({ answers, feedbacks: [feedback('lieu-ecouter', 'refaire'), feedback('campus-inclusion', 'refaire')] }).find((r) => r.programmeId === 'ba_hets_ts')!;
    expect(after.score).toBeGreaterThan(before.score);
  });
});
