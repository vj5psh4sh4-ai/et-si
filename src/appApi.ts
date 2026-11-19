import type { Choice, FeedbackValue, PlayerProfile, SavedNotebook } from './types';
import type { ProposedTrack } from './engine/recommendation';
import type { Mission } from './types';

export type Screen =
  | 'home'
  | 'character'
  | 'start'
  | 'entry'
  | 'hub'
  | 'mission'
  | 'pathways'
  | 'notebook'
  | 'about';

export type MissionStep = 'role' | 'activity' | 'debrief' | 'fork';

export interface AppApi {
  notebook: SavedNotebook;
  isDemo: boolean;
  hasSavedData: boolean;
  screen: Screen;
  go: (s: Screen) => void;
  updateProfile: (patch: Partial<PlayerProfile>) => void;
  updateNotebook: (fn: (prev: SavedNotebook) => SavedNotebook) => void;
  orderedMissions: Mission[];
  proposedTracks: ProposedTrack[];
  // mission play
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
  // pistes
  toggleSaveTrack: (trackId: string) => void;
  // session
  startDemo: () => void;
  exitDemo: () => void;
  restartExploration: () => void;
  deleteLocalData: () => void;
  launchFirstMission: () => void;
  surpriseMission: () => void;
}

export const NEXT_ACTIONS = [
  'Parler d’une piste avec un·e proche ou un·e enseignant·e',
  'Consulter une séance d’information ou une journée portes ouvertes',
  'Préparer 2 questions pour un·e conseiller·ère d’orientation',
  'Rejouer une autre mission pour tester un rôle différent',
];
