import { DISCOVERY_CARDS, IDEA_ANGLES, MISSIONS, OBJECTIVE_OPTIONS } from '../data/missions';
import type { ActivityTag, Mission, PlayerProfile, SavedNotebook } from '../types';
import { DEFAULT_PROFILE, freshNotebook } from '../domain/notebook';

export function getInitialPreferredTags(profile: PlayerProfile): ActivityTag[] {
  const tags: ActivityTag[] = [];
  if (profile.entryMode === 'decouvre') {
    for (const id of profile.selectedDiscoveryCards) {
      const card = DISCOVERY_CARDS.find((c) => c.id === id);
      if (card) tags.push(...card.tags);
    }
  } else if (profile.entryMode === 'objectif' && profile.selectedObjective) {
    const obj = OBJECTIVE_OPTIONS.find((o) => o.id === profile.selectedObjective);
    if (obj) tags.push(...obj.tags);
  } else if (profile.entryMode === 'idee' && profile.ideaAngle) {
    const angle = IDEA_ANGLES.find((a) => a.id === profile.ideaAngle);
    if (angle) tags.push(...angle.tags);
  }
  return tags;
}

/**
 * Les préférences initiales servent uniquement à ordonner les missions.
 */
export function getOrderedMissions(profile: PlayerProfile): Mission[] {
  const preferredTags = getInitialPreferredTags(profile);
  if (preferredTags.length === 0) return MISSIONS;

  return [...MISSIONS].sort((a, b) => {
    const scoreA = a.tags.filter((t) => preferredTags.includes(t)).length;
    const scoreB = b.tags.filter((t) => preferredTags.includes(t)).length;
    return scoreB - scoreA;
  });
}

/**
 * Carnet fictif d'« Alex », élève de 10H : douze cartes répondues et deux rôles essayés en mission.
 * Le panneau de la démo est calculé comme pour un vrai visiteur, à partir de ces réponses.
 */
export function createDemoNotebook(questions: string[] = [], nextAction = ''): SavedNotebook {
  const now = new Date().toISOString();
  return {
    ...freshNotebook(
      {
        ...DEFAULT_PROFILE,
        nickname: 'Alex',
        situation: 'co',
        schoolYear: 10,
        reflection: 'hesite',
        entryMode: 'decouvre',
        selectedDiscoveryCards: ['lieux', 'collectif'],
      },
      questions,
    ),
    answers: { q05: 2, q04: 2, q03: 1, q07: 2, q16: 0, q02: 2, q12: 1, q15: 1, q08: 1, q10: 0, q01: 2, q06: 1 },
    feedbacks: [
      {
        missionId: 'lieu-se-retrouver',
        missionTitle: 'Un lieu pour se retrouver',
        choiceId: 'lieu-ecouter',
        activityLabel: 'Écouter les futurs usagers',
        tags: ['ecouter', 'accompagner'],
        trackId: 'hets',
        feedback: 'en_vrai',
        consequenceShown: 'Tu as privilégié l’écoute des personnes qui utiliseront le lieu. Ton équipe comprend mieux leurs attentes.',
        timestamp: now,
      },
      {
        missionId: 'lieu-se-retrouver',
        missionTitle: 'Un lieu pour se retrouver',
        choiceId: 'lieu-espaces',
        activityLabel: 'Imaginer les espaces',
        tags: ['concevoir', 'construire'],
        trackId: 'heia',
        feedback: 'refaire',
        consequenceShown: 'Ton classement met l’accent sur la polyvalence des usages.',
        timestamp: now,
      },
    ],
    nextAction,
  };
}
