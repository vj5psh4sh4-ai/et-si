import { DISCOVERY_CARDS, IDEA_ANGLES, MISSIONS, OBJECTIVE_OPTIONS } from '../data/missions';
import { EXPLORATION_TRACKS } from '../data/tracks';
import {
  ActivityFeedback,
  ActivityTag,
  ExplorationTrack,
  Mission,
  PlayerProfile,
  SavedNotebook,
} from '../types';

export interface ProposedTrack {
  track: ExplorationTrack;
  reasons: string[];
  isManualSave: boolean;
}

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
 * Moteur déterministe et explicable :
 * seules les activités appréciées ("refaire" ou "en_vrai") ou sauvegardées manuellement
 * génèrent des pistes (maximum 3).
 */
export function computeProposedTracks(
  feedbacks: ActivityFeedback[],
  savedTrackIds: string[]
): ProposedTrack[] {
  const positiveFeedbacks = feedbacks.filter(
    (f) => f.feedback === 'refaire' || f.feedback === 'en_vrai'
  );

  const trackMap = new Map<string, { reasons: string[]; count: number; isManualSave: boolean }>();

  for (const fb of positiveFeedbacks) {
    const reason = `Tu retrouves cette piste parce que tu as aimé « ${fb.activityLabel} » dans « ${fb.missionTitle} ».`;
    const existing = trackMap.get(fb.trackId);
    if (existing) {
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
      existing.count += 1;
    } else {
      trackMap.set(fb.trackId, { reasons: [reason], count: 1, isManualSave: false });
    }
  }

  for (const trackId of savedTrackIds) {
    const existing = trackMap.get(trackId);
    if (existing) {
      existing.isManualSave = true;
    } else {
      trackMap.set(trackId, {
        reasons: ['Tu as choisi de sauvegarder cette piste manuellement dans ton exploration.'],
        count: 0,
        isManualSave: true,
      });
    }
  }

  const results: ProposedTrack[] = [];
  for (const [trackId, meta] of trackMap.entries()) {
    const track = EXPLORATION_TRACKS.find((t) => t.id === trackId);
    if (track) {
      results.push({ track, reasons: meta.reasons, isManualSave: meta.isManualSave });
    }
  }

  results.sort((a, b) => b.reasons.length - a.reasons.length);
  return results.slice(0, 3);
}

export function createDemoNotebook(): SavedNotebook {
  return {
    profile: {
      avatarId: 'boussole',
      color: '#2563eb',
      nickname: 'Alex (Démo)',
      situation: 'co',
      reflection: 'hesite',
      entryMode: 'decouvre',
      selectedDiscoveryCards: ['lieux', 'collectif'],
      selectedObjective: null,
      ideaText: '',
      ideaAngle: null,
    },
    feedbacks: [
      {
        missionId: 'lieu-se-retrouver',
        missionTitle: 'Un lieu pour se retrouver',
        choiceId: 'lieu-ecouter',
        activityLabel: 'Écouter les futurs usagers',
        tags: ['ecouter', 'accompagner'],
        trackId: 'hets',
        feedback: 'en_vrai',
        consequenceShown:
          'Tu as privilégié l’écoute des personnes qui utiliseront le lieu. Ton équipe comprend mieux leurs attentes.',
        timestamp: new Date().toISOString(),
      },
      {
        missionId: 'lieu-se-retrouver',
        missionTitle: 'Un lieu pour se retrouver',
        choiceId: 'lieu-espaces',
        activityLabel: 'Imaginer les espaces',
        tags: ['concevoir', 'construire'],
        trackId: 'heia',
        feedback: 'refaire',
        consequenceShown:
          'Ton classement met l’accent sur la polyvalence des usages.',
        timestamp: new Date().toISOString(),
      },
    ],
    savedTrackIds: ['hets', 'heia'],
    questionsToCheck: [
      'Quelles sont les conditions d’admission exactes selon mon parcours au secondaire II ?',
      'Quand ont lieu les prochaines séances d’information ou portes ouvertes ?',
    ],
    nextAction: 'Parler d’une piste avec un·e proche ou un·e enseignant·e',
    updatedAt: new Date().toISOString(),
  };
}
