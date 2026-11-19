import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MISSIONS } from './data/missions';
import { computeProposedTracks, createDemoNotebook, getOrderedMissions } from './engine/recommendation';
import type { ActivityFeedback, Choice, FeedbackValue, PlayerProfile, SavedNotebook } from './types';
import type { AppApi, MissionStep, Screen } from './appApi';
import { Header, BottomNav, DemoBanner } from './components/Chrome';
import { HomeScreen } from './screens/Home';
import { CharacterScreen, StartScreen, EntryScreen } from './screens/Onboarding';
import { MissionHub, MissionPlay } from './screens/Missions';
import { PathwaysScreen } from './screens/Pathways';
import { NotebookScreen } from './screens/Notebook';
import { AboutScreen } from './screens/About';

const STORAGE_KEY = 'et_si_v01_notebook';

const DEFAULT_PROFILE: PlayerProfile = {
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
};

const freshNotebook = (profile: PlayerProfile = DEFAULT_PROFILE): SavedNotebook => ({
  profile,
  feedbacks: [],
  savedTrackIds: [],
  questionsToCheck: [
    'Quelles sont les conditions d’admission exactes depuis ma situation ?',
    'Est-ce qu’une séance d’information ou une journée portes ouvertes est prévue ?',
  ],
  nextAction: '',
  updatedAt: new Date().toISOString(),
});

function readStored(): SavedNotebook | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedNotebook>;
    const base = freshNotebook();
    return {
      ...base,
      ...parsed,
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      feedbacks: parsed.feedbacks ?? [],
      savedTrackIds: parsed.savedTrackIds ?? [],
      questionsToCheck: parsed.questionsToCheck ?? base.questionsToCheck,
    };
  } catch {
    return null;
  }
}

export default function App() {
  const [notebook, setNotebook] = useState<SavedNotebook>(() => readStored() ?? freshNotebook());
  const [hasSavedData, setHasSavedData] = useState<boolean>(() => readStored() !== null);
  const [isDemo, setIsDemo] = useState(false);
  const dirty = useRef(false);

  const [screen, setScreen] = useState<Screen>('home');
  const [currentMissionId, setCurrentMissionId] = useState<string>(MISSIONS[0].id);
  const [missionStep, setMissionStep] = useState<MissionStep>('role');
  const [activeChoice, setActiveChoice] = useState<Choice | null>(null);
  const [consequenceText, setConsequenceText] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackValue | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Sauvegarde locale (jamais en mode démo, seulement après une première action).
  useEffect(() => {
    if (isDemo || !dirty.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...notebook, updatedAt: new Date().toISOString() }));
      setHasSavedData(true);
    } catch {
      // stockage indisponible : l’exploration continue sans sauvegarde
    }
  }, [notebook, isDemo]);

  const updateNotebook = useCallback((fn: (prev: SavedNotebook) => SavedNotebook) => {
    dirty.current = true;
    setNotebook(fn);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<PlayerProfile>) => updateNotebook((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } })),
    [updateNotebook]
  );

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }, []);

  const orderedMissions = useMemo(() => getOrderedMissions(notebook.profile), [notebook.profile]);
  const currentMission = useMemo(
    () => MISSIONS.find((m) => m.id === currentMissionId) ?? orderedMissions[0],
    [currentMissionId, orderedMissions]
  );
  const proposedTracks = useMemo(
    () => computeProposedTracks(notebook.feedbacks, notebook.savedTrackIds),
    [notebook.feedbacks, notebook.savedTrackIds]
  );

  const resetMission = (missionId: string) => {
    setCurrentMissionId(missionId);
    setActiveChoice(null);
    setConsequenceText(null);
    setFeedbackGiven(null);
    setMissionStep('role');
  };

  const openMission = (missionId: string) => {
    resetMission(missionId);
    go('mission');
  };

  const pickRole = (choice: Choice) => {
    setActiveChoice(choice);
    setConsequenceText(null);
    setFeedbackGiven(null);
    setMissionStep('activity');
  };

  const backToRoles = () => {
    setActiveChoice(null);
    setConsequenceText(null);
    setFeedbackGiven(null);
    setMissionStep('role');
  };

  const completeActivity = (selectedIds: string[]) => {
    if (!activeChoice) return;
    const isAlt = selectedIds.includes(activeChoice.consequences.altTriggerOptionId);
    setConsequenceText(isAlt ? activeChoice.consequences.alt : activeChoice.consequences.default);
    setMissionStep('debrief');
  };

  const giveFeedback = (value: FeedbackValue) => {
    if (!activeChoice || !consequenceText) return;
    setFeedbackGiven(value);
    const entry: ActivityFeedback = {
      missionId: currentMission.id,
      missionTitle: currentMission.title,
      choiceId: activeChoice.id,
      activityLabel: activeChoice.activityLabel,
      tags: activeChoice.tags,
      trackId: activeChoice.trackId,
      feedback: value,
      consequenceShown: consequenceText,
      timestamp: new Date().toISOString(),
    };
    updateNotebook((prev) => ({
      ...prev,
      feedbacks: [
        ...prev.feedbacks.filter((f) => !(f.missionId === entry.missionId && f.choiceId === entry.choiceId)),
        entry,
      ],
    }));
  };

  const nextMission = () => {
    // priorité aux missions encore jamais jouées, dans l’ordre suggéré
    const played = new Set(notebook.feedbacks.map((f) => f.missionId));
    const idx = orderedMissions.findIndex((m) => m.id === currentMission.id);
    const rotated = [...orderedMissions.slice(idx + 1), ...orderedMissions.slice(0, idx)];
    const next = rotated.find((m) => !played.has(m.id)) ?? rotated[0];
    openMission(next.id);
  };

  const toggleSaveTrack = (trackId: string) =>
    updateNotebook((prev) => ({
      ...prev,
      savedTrackIds: prev.savedTrackIds.includes(trackId)
        ? prev.savedTrackIds.filter((id) => id !== trackId)
        : [...prev.savedTrackIds, trackId],
    }));

  const startDemo = () => {
    setIsDemo(true);
    setNotebook(createDemoNotebook());
    go('pathways');
  };

  const exitDemo = () => {
    setIsDemo(false);
    dirty.current = false;
    setNotebook(readStored() ?? freshNotebook());
    resetMission(MISSIONS[0].id);
    go('home');
  };

  const restartExploration = () => {
    updateNotebook((prev) => ({
      ...freshNotebook({ ...prev.profile, entryMode: null, selectedDiscoveryCards: [], selectedObjective: null, ideaText: '', ideaAngle: null }),
    }));
    resetMission(MISSIONS[0].id);
    go('start');
  };

  const deleteLocalData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    dirty.current = false;
    setIsDemo(false);
    setHasSavedData(false);
    setNotebook(freshNotebook());
    resetMission(MISSIONS[0].id);
    go('home');
  };

  const launchFirstMission = () => {
    dirty.current = true;
    const first = getOrderedMissions(notebook.profile)[0];
    resetMission(first.id);
    go('hub');
  };

  const surpriseMission = () => {
    updateProfile({ selectedDiscoveryCards: [] });
    const random = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
    openMission(random.id);
  };

  const api: AppApi = {
    notebook,
    isDemo,
    hasSavedData,
    screen,
    go,
    updateProfile,
    updateNotebook,
    orderedMissions,
    proposedTracks,
    currentMission,
    missionStep,
    activeChoice,
    consequenceText,
    feedbackGiven,
    openMission,
    pickRole,
    backToRoles,
    completeActivity,
    giveFeedback,
    toFork: () => setMissionStep('fork'),
    nextMission,
    toggleSaveTrack,
    startDemo,
    exitDemo,
    restartExploration,
    deleteLocalData,
    launchFirstMission,
    surpriseMission,
  };

  return (
    <div className={`app-shell screen-${screen}`}>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Header app={api} />
      {isDemo && <DemoBanner onExit={exitDemo} />}
      <main id="main" className="main-content" ref={mainRef} tabIndex={-1}>
        {screen === 'home' && <HomeScreen app={api} />}
        {screen === 'character' && <CharacterScreen app={api} />}
        {screen === 'start' && <StartScreen app={api} />}
        {screen === 'entry' && <EntryScreen app={api} />}
        {screen === 'hub' && <MissionHub app={api} />}
        {screen === 'mission' && <MissionPlay app={api} />}
        {screen === 'pathways' && <PathwaysScreen app={api} />}
        {screen === 'notebook' && <NotebookScreen app={api} />}
        {screen === 'about' && <AboutScreen app={api} />}
      </main>
      <footer className="site-footer no-print">
        <p>
          « Et si… » v0.2 — prototype d’exploration autour des quatre hautes écoles de la HES-SO Fribourg. Ton
          exploration reste dans ce navigateur.
        </p>
      </footer>
      <BottomNav app={api} />
    </div>
  );
}
