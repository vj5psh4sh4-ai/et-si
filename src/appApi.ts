import type { CardChoice, Choice, FeedbackValue, Mission, PlayerProfile, SavedNotebook } from './types';
import type { UserProfile } from './mapping/engine/types';
import type { PanelResult } from './domain/profile';
import type { Situation, SchoolYear } from './domain/situation';
import type { VariantChoice, VariantId } from './domain/routes';

export type Screen =
  | 'home'
  | 'situation'
  | 'cards'
  | 'panel'
  | 'doors'
  | 'sheet'
  | 'cfc'
  | 'share'
  | 'character'
  | 'start'
  | 'entry'
  | 'hub'
  | 'mission'
  | 'notebook'
  | 'about';

export type MissionStep = 'role' | 'activity' | 'debrief' | 'fork';
export type CardsMode = 'express' | 'more' | 'forces';
export type SheetOrigin = 'panel' | 'doors' | 'cfc' | 'notebook';

export interface AppApi {
  notebook: SavedNotebook;
  isDemo: boolean;
  /** Panneau ouvert par lien ou code QR, pas encore gardé dans ce navigateur. */
  isShared: boolean;
  /** Vrai si un carnet avec des réponses existe déjà dans ce navigateur. */
  storedHasExploration: boolean;
  /** Mode stand (?stand=1) : aucune sauvegarde, remise à zéro automatique. */
  isStand: boolean;
  /** Mode animateur (?animateur=1) : chiffres de travail visibles. */
  isStaff: boolean;
  /** Faux si le questionnaire (statut démo) est masqué par la politique d'affichage. */
  cardsEnabled: boolean;
  hasSavedData: boolean;
  screen: Screen;
  go: (s: Screen) => void;
  updateProfile: (patch: Partial<PlayerProfile>) => void;
  updateNotebook: (fn: (prev: SavedNotebook) => SavedNotebook) => void;

  // situation, profil et panneau (recalculés, jamais enregistrés)
  situation: Situation;
  user: UserProfile;
  panel: PanelResult;
  variant: VariantChoice;
  variantIds: VariantId[];
  setVariant: (v: VariantChoice) => void;
  openSituation: (returnTo: Screen) => void;
  /** Quitte « Tu es où ? » sans rien changer. */
  closeSituation: () => void;
  chooseSituation: (id: PlayerProfile['situation'], schoolYear?: SchoolYear | null) => void;

  // cartes
  cardsMode: CardsMode;
  startCards: (mode: CardsMode) => void;
  startExpress: () => void;
  restartCards: () => void;
  answerCard: (id: string, choice: CardChoice, quality: boolean) => void;

  // fiches, métiers, carnet
  sheetId: string;
  sheetFrom: SheetOrigin;
  openSheet: (programmeId: string, from: SheetOrigin) => void;
  toggleSaveProgramme: (programmeId: string) => void;
  toggleSaveCfc: (key: string) => void;
  addQuestions: (questions: string[]) => void;
  /** Métier CFC ouvert dans « Partir d'un métier » (gardé le temps de la visite). */
  cfcKey: string | null;
  setCfcKey: (key: string | null) => void;

  // missions
  orderedMissions: Mission[];
  currentMission: Mission;
  missionStep: MissionStep;
  activeChoice: Choice | null;
  consequenceText: string | null;
  feedbackGiven: FeedbackValue | null;
  openMission: (missionId: string) => void;
  pickRole: (choice: Choice) => void;
  backToRoles: () => void;
  completeActivity: (selectedIds: string[]) => void;
  giveFeedback: (v: FeedbackValue) => void;
  toFork: () => void;
  nextMission: () => void;
  openMissions: () => void;

  // session
  startDemo: () => void;
  exitDemo: () => void;
  keepShared: () => void;
  discardShared: () => void;
  standReset: () => void;
  restartExploration: () => void;
  deleteLocalData: () => void;
  launchFirstMission: () => void;
  surpriseMission: () => void;
}
