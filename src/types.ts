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
  /** Année du CO (9H à 11H), demandée pour afficher une date de rentrée au plus tôt. */
  schoolYear: 9 | 10 | 11 | null;
  /** Type de classe, facultatif, demandé seulement dans « Toutes les portes ». */
  classType: 'eb' | 'g' | 'pg' | null;
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

/** Réponse à une carte : 0 = non, 1 = peut-être, 2 = oui. */
export type CardChoice = 0 | 1 | 2;

/**
 * Carnet, schéma 2 (v0.3.1). Il garde des réponses et des choix, jamais des résultats :
 * le panneau est recalculé à chaque ouverture avec le référentiel du moment.
 */
export interface SavedNotebook {
  schema: 2;
  profile: PlayerProfile;
  feedbacks: ActivityFeedback[];
  /** Réponses aux cartes « Est-ce que tu aimerais… » (identifiant de carte -> réponse). */
  answers: Record<string, CardChoice>;
  /** Réponses aux cartes « Mes forces ». */
  qualityAnswers: Record<string, CardChoice>;
  /** Filières gardées par la personne. */
  savedProgrammeIds: string[];
  /** Métiers CFC gardés (clé de regroupement). */
  savedCfc: string[];
  /** Voie choisie avec la bascule « Et si » ('auto' : le chemin le plus court). */
  variant: string;
  questionsToCheck: string[];
  nextAction: string;
  /** Version du référentiel utilisée lors de la dernière sauvegarde. */
  mappingVersion: string;
  updatedAt: string;
}
