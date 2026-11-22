// Carnet schéma 2 : création, lecture et migration depuis la v0.2 (règle 8).
import type { ActivityFeedback, CardChoice, PlayerProfile, SavedNotebook } from '../types';
import { BACHELOR_IDS, MAPPING_VERSION } from './data';
import { ITEM_IDS, MISSION_ACTIVITY_IDS, QUALITY_ITEM_IDS } from './profile';
import { ALL_VARIANTS } from './routes';

export const STORAGE_KEY = 'et_si_v01_notebook';
export const LANG_KEY = 'et_si_lang';

export const DEFAULT_PROFILE: PlayerProfile = {
  avatarId: 'boussole',
  color: '#2563eb',
  nickname: '',
  situation: 'non_precise',
  reflection: 'decouvre',
  entryMode: null,
  selectedDiscoveryCards: [],
  selectedObjective: null,
  ideaText: '',
  ideaAngle: null,
  schoolYear: null,
  classType: null,
};

export const freshNotebook = (profile: PlayerProfile = DEFAULT_PROFILE, questions: string[] = []): SavedNotebook => ({
  schema: 2,
  profile,
  feedbacks: [],
  answers: {},
  qualityAnswers: {},
  savedProgrammeIds: [],
  savedCfc: [],
  variant: 'auto',
  questionsToCheck: questions,
  nextAction: '',
  mappingVersion: MAPPING_VERSION,
  updatedAt: new Date().toISOString(),
});

const SITUATIONS = ['co', 'apprentissage', 'college', 'ecg', 'autre', 'non_precise'];

function cleanAnswers(raw: unknown, ids: string[]): Record<string, CardChoice> {
  const out: Record<string, CardChoice> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const id of ids) {
    const v = (raw as Record<string, unknown>)[id];
    if (v === 0 || v === 1 || v === 2) out[id] = v;
  }
  return out;
}

const strings = (raw: unknown): string[] => (Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);

/**
 * Remet un carnet enregistré au schéma courant. Tolère un carnet v0.2 (sans champ « schema ») :
 * profil, retours de mission, questions et prochaine action sont repris ; les anciennes pistes par école
 * (savedTrackIds) ne sont pas converties, car elles ne désignaient pas une filière.
 * Les identifiants inconnus du référentiel courant sont écartés.
 */
export function migrateNotebook(raw: unknown, defaultQuestions: string[] = []): SavedNotebook | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const base = freshNotebook(DEFAULT_PROFILE, defaultQuestions);
  const p = (r.profile && typeof r.profile === 'object' ? r.profile : {}) as Partial<PlayerProfile>;
  const profile: PlayerProfile = { ...DEFAULT_PROFILE, ...p };
  if (!SITUATIONS.includes(profile.situation)) profile.situation = 'non_precise';
  if (![9, 10, 11].includes(profile.schoolYear as number)) profile.schoolYear = null;
  if (!['eb', 'g', 'pg'].includes(profile.classType as string)) profile.classType = null;
  const feedbacks = (Array.isArray(r.feedbacks) ? r.feedbacks : []).filter(
    (f): f is ActivityFeedback => !!f && typeof f === 'object' && typeof (f as ActivityFeedback).choiceId === 'string',
  );
  const variant = typeof r.variant === 'string' && (ALL_VARIANTS as string[]).includes(r.variant) ? r.variant : 'auto';
  return {
    ...base,
    profile,
    feedbacks,
    answers: cleanAnswers(r.answers, ITEM_IDS),
    qualityAnswers: cleanAnswers(r.qualityAnswers, QUALITY_ITEM_IDS),
    savedProgrammeIds: strings(r.savedProgrammeIds).filter((id) => BACHELOR_IDS.includes(id)),
    savedCfc: strings(r.savedCfc),
    variant,
    questionsToCheck: Array.isArray(r.questionsToCheck) ? strings(r.questionsToCheck) : base.questionsToCheck,
    nextAction: typeof r.nextAction === 'string' ? r.nextAction : '',
    mappingVersion: MAPPING_VERSION,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : base.updatedAt,
  };
}

/** Vrai si le carnet contient de quoi calculer un panneau ou reprendre une exploration. */
export const hasExploration = (nb: SavedNotebook): boolean =>
  Object.keys(nb.answers).length > 0 || nb.feedbacks.some((f) => MISSION_ACTIVITY_IDS.includes(f.choiceId));
