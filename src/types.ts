export type SituationId =
  | 'co'
  | 'apprentissage'
  | 'college'
  | 'ecg'
  | 'autre'
  | 'non_precise';

export type ReflectionState =
  | 'decouvre'
  | 'hesite'
  | 'objectif'
  | 'idee';

export type EntryMode = 'decouvre' | 'objectif' | 'idee';

export type ActivityTag =
  | 'ecouter'
  | 'accompagner'
  | 'concevoir'
  | 'analyser'
  | 'organiser'
  | 'soigner'
  | 'construire'
  | 'coordonner';

export type FeedbackValue = 'refaire' | 'en_vrai' | 'autre_chose' | 'ne_sais_pas';

export type ValidationStatus = 'demo' | 'to_review' | 'validated';

export interface PlayerProfile {
  avatarId: string;
  color: string;
  nickname: string;
  situation: SituationId;
  reflection: ReflectionState;
  entryMode: EntryMode | null;
  selectedDiscoveryCards: string[];
  selectedObjective: string | null;
  ideaText: string;
  ideaAngle: string | null;
}

export type MicroActivityType =
  | 'pick_questions'
  | 'rank_priorities'
  | 'allocate_tokens'
  | 'select_constraints';

export interface MicroActivityOption {
  id: string;
  label: string;
  hint?: string;
}

export interface MicroActivity {
  type: MicroActivityType;
  prompt: string;
  options: MicroActivityOption[];
  targetCount?: number;
  totalTokens?: number;
}

export interface Choice {
  id: string;
  label: string;
  description: string;
  activityLabel: string;
  tags: ActivityTag[];
  trackId: string;
  microActivity: MicroActivity;
  consequences: {
    default: string;
    alt: string;
    altTriggerOptionId: string;
  };
}

export interface Scene {
  id: string;
  prompt: string;
  choices: Choice[];
}

export interface Mission {
  id: string;
  title: string;
  intro: string;
  illustrationId: 'lieu' | 'autonomie' | 'campus' | 'evenement';
  tags: ActivityTag[];
  scene: Scene;
}

export interface ActivityFeedback {
  missionId: string;
  missionTitle: string;
  choiceId: string;
  activityLabel: string;
  tags: ActivityTag[];
  trackId: string;
  feedback: FeedbackValue;
  consequenceShown: string;
  timestamp: string;
}

export interface PathwayNode {
  id: string;
  stepLabel: string;
  title: string;
  detail: string;
  validationStatus: ValidationStatus;
  sourceUrl: string | null;
  reviewedAt: string | null;
}

export interface ExplorationTrack {
  id: string;
  title: string;
  school: 'HEIA-FR' | 'HEG-FR' | 'HEdS-FR' | 'HETS-FR';
  summary: string;
  skills: string[];
  tags: ActivityTag[];
  nextExperience: string;
  validationStatus: ValidationStatus;
  sourceUrl: string | null;
  reviewedAt: string | null;
}

export interface SavedNotebook {
  profile: PlayerProfile;
  feedbacks: ActivityFeedback[];
  savedTrackIds: string[];
  questionsToCheck: string[];
  nextAction: string;
  updatedAt: string;
}
