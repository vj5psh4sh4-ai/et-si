import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE, freshNotebook, hasExploration, migrateNotebook } from '../notebook';
import { computePanel } from '../profile';
import { decodeShare, encodeShare, readShareHash, shareUrl } from '../share';
import { isVisible } from '../policy';
import { PM } from '../data';
import { MISSIONS } from '../../data/missions';
import type { ActivityFeedback } from '../../types';
import { fullAnswers, playExpress } from './personas';

const feedback = (choiceId: string, value: ActivityFeedback['feedback']): ActivityFeedback => {
  const m = MISSIONS.find((x) => x.scene.choices.some((c) => c.id === choiceId))!;
  const c = m.scene.choices.find((x) => x.id === choiceId)!;
  return { missionId: m.id, missionTitle: m.title, choiceId, activityLabel: c.activityLabel, tags: c.tags, trackId: c.trackId, feedback: value, consequenceShown: 'x', timestamp: 't' };
};

describe('lien à emporter', () => {
  it('rouvre exactement le même panneau', () => {
    const nb = {
      ...freshNotebook({ ...DEFAULT_PROFILE, nickname: 'Léa', situation: 'co', schoolYear: 10, classType: 'pg' }),
      answers: playExpress('lea'),
      qualityAnswers: { s05: 2 as const, s18: 1 as const, s14: 0 as const },
      feedbacks: [feedback('auto-soins', 'refaire'), feedback('evt-liens', 'ne_sais_pas')],
      savedProgrammeIds: ['ba_hets_ts', 'ba_heds_osteo'],
      variant: 'ecg',
    };
    const code = encodeShare(nb, 'de');
    const back = decodeShare(code)!;
    expect(back.lang).toBe('de');
    expect(back.notebook.answers).toEqual(nb.answers);
    expect(back.notebook.qualityAnswers).toEqual(nb.qualityAnswers);
    expect(back.notebook.profile.nickname).toBe('Léa');
    expect(back.notebook.profile.situation).toBe('co');
    expect(back.notebook.profile.schoolYear).toBe(10);
    expect(back.notebook.profile.classType).toBe('pg');
    expect(back.notebook.variant).toBe('ecg');
    expect([...back.notebook.savedProgrammeIds].sort()).toEqual([...nb.savedProgrammeIds].sort());
    expect(back.notebook.feedbacks.map((f) => [f.choiceId, f.feedback])).toEqual([['auto-soins', 'refaire'], ['evt-liens', 'ne_sais_pas']]);
    const a = computePanel(nb);
    const b = computePanel(back.notebook);
    expect(b.trio.map((r) => [r.programmeId, r.score])).toEqual(a.trio.map((r) => [r.programmeId, r.score]));
  });
  it('tient dans un code QR court, même avec les 30 cartes et un pseudonyme', () => {
    const nb = { ...freshNotebook({ ...DEFAULT_PROFILE, nickname: 'Maximilien-Alexandre' }), answers: fullAnswers('ines') };
    const url = shareUrl('https://et-si-bkmt.onrender.com/', encodeShare(nb, 'fr'));
    expect(url.length).toBeLessThan(130);
    expect(readShareHash(new URL(url).hash)).toBe(encodeShare(nb, 'fr'));
  });
  it('peut partir sans pseudonyme', () => {
    const nb = { ...freshNotebook({ ...DEFAULT_PROFILE, nickname: 'Léa' }), answers: playExpress('lea') };
    expect(decodeShare(encodeShare(nb, 'fr', false))!.notebook.profile.nickname).toBe('');
  });
  it('refuse un lien illisible sans planter', () => {
    expect(decodeShare('')).toBeNull();
    expect(decodeShare('!!!')).toBeNull();
    expect(decodeShare('AAAA')).toBeNull();
    expect(decodeShare('EA')).toBeNull();
    expect(readShareHash('#autre')).toBeNull();
  });
});

describe('carnet schéma 2', () => {
  const v02 = {
    profile: { avatarId: 'fusee', color: '#0f8f7c', nickname: 'Sam', situation: 'college', reflection: 'hesite', entryMode: 'decouvre', selectedDiscoveryCards: ['aider'], selectedObjective: null, ideaText: 'Un club', ideaAngle: null },
    feedbacks: [feedback('lieu-ecouter', 'refaire')],
    savedTrackIds: ['hets'],
    questionsToCheck: ['Ma question'],
    nextAction: 'Parler',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };
  it('reprend un carnet v0.2 sans rien perdre d’utile', () => {
    const nb = migrateNotebook(v02)!;
    expect(nb.schema).toBe(2);
    expect(nb.profile.nickname).toBe('Sam');
    expect(nb.profile.avatarId).toBe('fusee');
    expect(nb.profile.situation).toBe('college');
    expect(nb.profile.schoolYear).toBeNull();
    expect(nb.profile.ideaText).toBe('Un club');
    expect(nb.feedbacks).toHaveLength(1);
    expect(nb.questionsToCheck).toEqual(['Ma question']);
    expect(nb.nextAction).toBe('Parler');
    expect(nb.answers).toEqual({});
    expect(nb.variant).toBe('auto');
    expect('savedTrackIds' in nb).toBe(false);
    expect(hasExploration(nb)).toBe(true);
  });
  it('écarte les valeurs inconnues', () => {
    const nb = migrateNotebook({ schema: 2, profile: { situation: 'xx', schoolYear: 7, classType: 'z' }, answers: { q01: 2, q99: 2, q02: 5 }, savedProgrammeIds: ['ba_heia_gm', 'nope'], variant: 'fusée' })!;
    expect(nb.profile.situation).toBe('non_precise');
    expect(nb.profile.schoolYear).toBeNull();
    expect(nb.profile.classType).toBeNull();
    expect(nb.answers).toEqual({ q01: 2 });
    expect(nb.savedProgrammeIds).toEqual(['ba_heia_gm']);
    expect(nb.variant).toBe('auto');
    expect(migrateNotebook(null)).toBeNull();
    expect(migrateNotebook('texte')).toBeNull();
  });
  it('ne garde aucun résultat calculé', () => {
    const nb = { ...freshNotebook(), answers: playExpress('lea') };
    const json = JSON.stringify(nb);
    expect(json).not.toMatch(/score|trio|coverage/);
    expect(hasExploration(freshNotebook())).toBe(false);
  });
});

describe('politique d’affichage', () => {
  it('le questionnaire porte le statut démo et suit le drapeau', () => {
    expect(PM.questionnaire.validationStatus).toBe('demo');
    expect(isVisible('validated')).toBe(true);
    expect(isVisible('to_review')).toBe(true);
  });
});
