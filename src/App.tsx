import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MISSIONS } from './data/missions';
import { createDemoNotebook, getOrderedMissions } from './engine/recommendation';
import type { ActivityFeedback, CardChoice, Choice, FeedbackValue, PlayerProfile, SavedNotebook } from './types';
import type { AppApi, CardsMode, MissionStep, Screen, SheetOrigin } from './appApi';
import { BACHELOR_IDS, PM } from './domain/data';
import { LANG_KEY, STORAGE_KEY, freshNotebook, hasExploration, migrateNotebook } from './domain/notebook';
import { STAND_IDLE_SECONDS, STAND_WARNING_SECONDS, isVisible } from './domain/policy';
import { buildProfile, computePanel } from './domain/profile';
import { variantsFor, type VariantChoice } from './domain/routes';
import { decodeShare, readShareHash } from './domain/share';
import type { Situation, SchoolYear } from './domain/situation';
import { I18nProvider, detectLang, translate, type Lang } from './i18n';
import { Header, BottomNav, DemoBanner, SharedBanner, StandIdleDialog } from './components/Chrome';
import { HomeScreen } from './screens/Home';
import { SituationScreen } from './screens/Situation';
import { CardsScreen } from './screens/Cards';
import { PanelScreen } from './screens/Panel';
import { DoorsScreen } from './screens/Doors';
import { SheetScreen } from './screens/Sheet';
import { CfcScreen } from './screens/Cfc';
import { ShareScreen } from './screens/Share';
import { CharacterScreen, StartScreen, EntryScreen } from './screens/Onboarding';
import { MissionHub, MissionPlay } from './screens/Missions';
import { NotebookScreen } from './screens/Notebook';
import { AboutScreen } from './screens/About';

const APP_VERSION = '0.3.1';

const QUERY = new URLSearchParams(window.location.search);
const IS_STAND = QUERY.get('stand') === '1';
const IS_STAFF = QUERY.get('animateur') === '1';
/** Délai d'inactivité du mode stand, réglable par ?idle=NN (en secondes, 5 au minimum). */
const IDLE_SECONDS = Math.max(5, Number(QUERY.get('idle')) || STAND_IDLE_SECONDS);
const CARDS_ENABLED = isVisible(PM.questionnaire.validationStatus);

const defaultQuestions = (lang: Lang): string[] => [translate(lang, 'q.default.1'), translate(lang, 'q.default.2')];

function readStoredLang(): string | null {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

function readStored(lang: Lang): SavedNotebook | null {
  if (IS_STAND) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrateNotebook(JSON.parse(raw), defaultQuestions(lang));
  } catch {
    return null;
  }
}

function clearShareHash() {
  if (!window.location.hash) return;
  try {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch {
    // l'adresse garde le code : sans conséquence
  }
}

interface Boot {
  lang: Lang;
  notebook: SavedNotebook;
  hasSavedData: boolean;
  storedHasExploration: boolean;
  isShared: boolean;
  sharedInvalid: boolean;
  screen: Screen;
}

function boot(): Boot {
  // Sur la tablette du stand, la langue de départ ne dépend ni du navigateur ni d'un choix précédent.
  let lang = IS_STAND ? detectLang(window.location.search, null, undefined) : detectLang(window.location.search, readStoredLang(), navigator.language);
  const stored = readStored(lang);
  const base: Boot = {
    lang,
    notebook: stored ?? freshNotebook(undefined, defaultQuestions(lang)),
    hasSavedData: stored !== null,
    storedHasExploration: stored !== null && hasExploration(stored),
    isShared: false,
    sharedInvalid: false,
    screen: 'home',
  };
  const code = readShareHash(window.location.hash);
  if (!code) return base;
  const payload = decodeShare(code);
  if (!payload) {
    clearShareHash();
    return { ...base, sharedInvalid: true };
  }
  if (!QUERY.get('lang')) lang = payload.lang;
  return {
    ...base,
    lang,
    notebook: { ...payload.notebook, questionsToCheck: defaultQuestions(lang) },
    isShared: !IS_STAND,
    screen: 'panel',
  };
}

// Lu une seule fois au chargement : boot() nettoie l'adresse, il ne doit pas être rejoué par un second rendu.
let bootCache: Boot | null = null;
function bootOnce(): Boot {
  if (!bootCache) bootCache = boot();
  return bootCache;
}

export default function App() {
  const initial = bootOnce();
  const [lang, setLangState] = useState<Lang>(initial.lang);
  const [notebook, setNotebook] = useState<SavedNotebook>(initial.notebook);
  const [hasSavedData, setHasSavedData] = useState(initial.hasSavedData);
  const [storedHasExploration, setStoredHasExploration] = useState(initial.storedHasExploration);
  const [isDemo, setIsDemo] = useState(false);
  const [isShared, setIsShared] = useState(initial.isShared);
  const [sharedInvalid, setSharedInvalid] = useState(initial.sharedInvalid);
  const dirty = useRef(false);

  const [screen, setScreen] = useState<Screen>(initial.screen);
  const [cardsMode, setCardsMode] = useState<CardsMode>('express');
  const [cardsRun, setCardsRun] = useState(0);
  const [sheetId, setSheetId] = useState<string>(BACHELOR_IDS[0]);
  const [sheetFrom, setSheetFrom] = useState<SheetOrigin>('doors');
  const [cfcKey, setCfcKey] = useState<string | null>(null);
  const situationReturn = useRef<Screen>('cards');
  const [currentMissionId, setCurrentMissionId] = useState<string>(MISSIONS[0].id);
  const [missionStep, setMissionStep] = useState<MissionStep>('role');
  const [activeChoice, setActiveChoice] = useState<Choice | null>(null);
  const [consequenceText, setConsequenceText] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackValue | null>(null);
  const [idleLeft, setIdleLeft] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (IS_STAND) return;
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // stockage indisponible : le choix vaut pour cette visite
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'fr' ? 'fr-CH' : lang === 'de' ? 'de-CH' : 'en';
  }, [lang]);

  // Sauvegarde locale : jamais en démo, jamais sur un panneau reçu non gardé, jamais au stand.
  useEffect(() => {
    if (isDemo || isShared || IS_STAND || !dirty.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...notebook, updatedAt: new Date().toISOString() }));
      setHasSavedData(true);
      setStoredHasExploration(hasExploration(notebook));
    } catch {
      // stockage indisponible : l'exploration continue sans sauvegarde
    }
  }, [notebook, isDemo, isShared]);

  const updateNotebook = useCallback(
    (fn: (prev: SavedNotebook) => SavedNotebook) => {
      dirty.current = true;
      // Un panneau reçu devient le carnet de ce navigateur dès la première action, s'il n'écrase rien.
      if (isShared && !storedHasExploration) {
        setIsShared(false);
        clearShareHash();
      }
      setNotebook(fn);
    },
    [isShared, storedHasExploration],
  );

  const updateProfile = useCallback(
    (patch: Partial<PlayerProfile>) =>
      updateNotebook((prev) => {
        const profile = { ...prev.profile, ...patch };
        const moved = patch.situation !== undefined && patch.situation !== prev.profile.situation;
        if (profile.situation !== 'co') profile.schoolYear = null;
        if (profile.situation !== 'co' && profile.situation !== 'non_precise') profile.classType = null;
        // Les voies proposées dépendent du point de départ : on revient au chemin le plus court.
        return { ...prev, profile, variant: moved ? 'auto' : prev.variant };
      }),
    [updateNotebook],
  );

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }, []);

  // --- Situation, profil et panneau : recalculés à chaque changement, jamais enregistrés.
  const { profile } = notebook;
  const situation = useMemo<Situation>(
    () => ({ id: profile.situation, schoolYear: profile.schoolYear, classType: profile.classType }),
    [profile.situation, profile.schoolYear, profile.classType],
  );
  const profileInput = useMemo(
    () => ({ answers: CARDS_ENABLED ? notebook.answers : {}, qualityAnswers: CARDS_ENABLED ? notebook.qualityAnswers : {}, feedbacks: notebook.feedbacks }),
    [notebook.answers, notebook.qualityAnswers, notebook.feedbacks],
  );
  const user = useMemo(() => buildProfile(profileInput), [profileInput]);
  const panel = useMemo(() => computePanel(profileInput), [profileInput]);
  const variantIds = useMemo(() => variantsFor(situation, lang).map((v) => v.id), [situation, lang]);
  const variant: VariantChoice = (variantIds as string[]).includes(notebook.variant) ? (notebook.variant as VariantChoice) : 'auto';

  const setVariant = (v: VariantChoice) => updateNotebook((prev) => ({ ...prev, variant: v }));

  const openSituation = (returnTo: Screen) => {
    situationReturn.current = returnTo;
    go('situation');
  };

  const closeSituation = () => go(situationReturn.current === 'cards' ? 'home' : situationReturn.current);

  const chooseSituation = (id: PlayerProfile['situation'], schoolYear: SchoolYear | null = null) => {
    updateProfile({ situation: id, schoolYear: id === 'co' ? schoolYear : null });
    go(situationReturn.current);
  };

  // --- Cartes
  const startCards = (mode: CardsMode) => {
    setCardsMode(mode);
    setCardsRun((n) => n + 1);
    go('cards');
  };

  const startExpress = () => {
    if (!CARDS_ENABLED) {
      go('doors');
      return;
    }
    setCardsMode('express');
    setCardsRun((n) => n + 1);
    openSituation('cards');
  };

  const restartCards = () => {
    updateNotebook((prev) => ({ ...prev, answers: {}, qualityAnswers: {}, variant: 'auto' }));
    setCardsMode('express');
    setCardsRun((n) => n + 1);
    openSituation('cards');
  };

  const answerCard = (id: string, choice: CardChoice, quality: boolean) =>
    updateNotebook((prev) =>
      quality ? { ...prev, qualityAnswers: { ...prev.qualityAnswers, [id]: choice } } : { ...prev, answers: { ...prev.answers, [id]: choice } },
    );

  // --- Fiches, métiers, questions
  const openSheet = (programmeId: string, from: SheetOrigin) => {
    setSheetId(programmeId);
    setSheetFrom(from);
    go('sheet');
  };

  const toggleSaveProgramme = (programmeId: string) =>
    updateNotebook((prev) => ({
      ...prev,
      savedProgrammeIds: prev.savedProgrammeIds.includes(programmeId)
        ? prev.savedProgrammeIds.filter((id) => id !== programmeId)
        : [...prev.savedProgrammeIds, programmeId],
    }));

  const toggleSaveCfc = (key: string) =>
    updateNotebook((prev) => ({
      ...prev,
      savedCfc: prev.savedCfc.includes(key) ? prev.savedCfc.filter((k) => k !== key) : [...prev.savedCfc, key],
    }));

  const addQuestions = (questions: string[]) =>
    updateNotebook((prev) => ({
      ...prev,
      questionsToCheck: [...prev.questionsToCheck, ...questions.filter((q) => !prev.questionsToCheck.includes(q))],
    }));

  // --- Missions
  const orderedMissions = useMemo(() => getOrderedMissions(notebook.profile), [notebook.profile]);
  const currentMission = useMemo(
    () => MISSIONS.find((m) => m.id === currentMissionId) ?? orderedMissions[0],
    [currentMissionId, orderedMissions],
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
      feedbacks: [...prev.feedbacks.filter((f) => !(f.missionId === entry.missionId && f.choiceId === entry.choiceId)), entry],
    }));
  };

  const nextMission = () => {
    // priorité aux missions encore jamais jouées, dans l'ordre suggéré
    const played = new Set(notebook.feedbacks.map((f) => f.missionId));
    const idx = orderedMissions.findIndex((m) => m.id === currentMission.id);
    const rotated = [...orderedMissions.slice(idx + 1), ...orderedMissions.slice(0, idx)];
    const next = rotated.find((m) => !played.has(m.id)) ?? rotated[0];
    openMission(next.id);
  };

  /** Entrée dans les missions : par le personnage la première fois, sinon directement la carte des missions. */
  const openMissions = () => {
    const started = notebook.feedbacks.length > 0 || notebook.profile.nickname.trim() !== '' || notebook.profile.entryMode !== null;
    go(started || isDemo ? 'hub' : 'character');
  };

  // --- Session
  const startDemo = () => {
    setIsDemo(true);
    setNotebook(createDemoNotebook(defaultQuestions(lang), translate(lang, 'nb.next.1')));
    go('panel');
  };

  const exitDemo = () => {
    setIsDemo(false);
    dirty.current = false;
    setNotebook(readStored(lang) ?? freshNotebook(undefined, defaultQuestions(lang)));
    resetMission(MISSIONS[0].id);
    go('home');
  };

  const keepShared = () => {
    dirty.current = true;
    setIsShared(false);
    clearShareHash();
  };

  const discardShared = () => {
    dirty.current = false;
    setIsShared(false);
    clearShareHash();
    setNotebook(readStored(lang) ?? freshNotebook(undefined, defaultQuestions(lang)));
    go('home');
  };

  const standReset = useCallback(() => {
    dirty.current = false;
    clearShareHash();
    setIdleLeft(null);
    setIsDemo(false);
    setLangState(initial.lang);
    setCfcKey(null);
    setNotebook(freshNotebook(undefined, defaultQuestions(initial.lang)));
    setCurrentMissionId(MISSIONS[0].id);
    setActiveChoice(null);
    setConsequenceText(null);
    setFeedbackGiven(null);
    setMissionStep('role');
    go('home');
  }, [go, initial.lang]);

  // Mode stand : après un temps sans geste, un avertissement, puis la remise à zéro.
  useEffect(() => {
    if (!IS_STAND || screen === 'home') {
      setIdleLeft(null);
      return;
    }
    let last = Date.now();
    const touch = () => {
      last = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true, capture: true }));
    const timer = window.setInterval(() => {
      const idle = (Date.now() - last) / 1000;
      if (idle >= IDLE_SECONDS + STAND_WARNING_SECONDS) standReset();
      else if (idle >= IDLE_SECONDS) setIdleLeft(Math.ceil(IDLE_SECONDS + STAND_WARNING_SECONDS - idle));
      else setIdleLeft(null);
    }, 250);
    return () => {
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch, { capture: true }));
    };
  }, [screen, standReset]);

  const restartExploration = () => {
    updateNotebook((prev) => ({
      ...freshNotebook(
        { ...prev.profile, entryMode: null, selectedDiscoveryCards: [], selectedObjective: null, ideaText: '', ideaAngle: null },
        defaultQuestions(lang),
      ),
    }));
    resetMission(MISSIONS[0].id);
    go('home');
  };

  const deleteLocalData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    dirty.current = false;
    setIsDemo(false);
    setIsShared(false);
    setHasSavedData(false);
    setStoredHasExploration(false);
    setNotebook(freshNotebook(undefined, defaultQuestions(lang)));
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
    isShared,
    storedHasExploration,
    isStand: IS_STAND,
    isStaff: IS_STAFF,
    cardsEnabled: CARDS_ENABLED,
    hasSavedData,
    screen,
    go,
    updateProfile,
    updateNotebook,
    situation,
    user,
    panel,
    variant,
    variantIds,
    setVariant,
    openSituation,
    closeSituation,
    chooseSituation,
    cardsMode,
    startCards,
    startExpress,
    restartCards,
    answerCard,
    sheetId,
    sheetFrom,
    openSheet,
    toggleSaveProgramme,
    toggleSaveCfc,
    addQuestions,
    cfcKey,
    setCfcKey,
    orderedMissions,
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
    openMissions,
    startDemo,
    exitDemo,
    keepShared,
    discardShared,
    standReset,
    restartExploration,
    deleteLocalData,
    launchFirstMission,
    surpriseMission,
  };

  const t = (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => translate(lang, key, vars);
  const attract = IS_STAND && screen === 'home';

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <div className={`app-shell screen-${screen}${IS_STAND ? ' is-stand' : ''}${attract ? ' is-attract' : ''}`}>
        <a className="skip-link" href="#main">
          {t('app.skip')}
        </a>
        <Header app={api} />
        {isDemo && <DemoBanner onExit={exitDemo} />}
        {isShared && !isDemo && <SharedBanner app={api} />}
        {sharedInvalid && (
          <div className="demo-banner shared-banner no-print" role="alert">
            <span>{t('shared.invalid')}</span>
            <button type="button" className="btn btn-small btn-ink" onClick={() => setSharedInvalid(false)}>
              {t('app.close')}
            </button>
          </div>
        )}
        <main id="main" className="main-content" ref={mainRef} tabIndex={-1}>
          {screen === 'home' && <HomeScreen app={api} />}
          {screen === 'situation' && <SituationScreen app={api} />}
          {screen === 'cards' && <CardsScreen key={`${cardsMode}-${cardsRun}`} app={api} />}
          {screen === 'panel' && <PanelScreen app={api} />}
          {screen === 'doors' && <DoorsScreen app={api} />}
          {screen === 'sheet' && <SheetScreen key={sheetId} app={api} />}
          {screen === 'cfc' && <CfcScreen app={api} />}
          {screen === 'share' && <ShareScreen app={api} />}
          {screen === 'character' && <CharacterScreen app={api} />}
          {screen === 'start' && <StartScreen app={api} />}
          {screen === 'entry' && <EntryScreen app={api} />}
          {screen === 'hub' && <MissionHub app={api} />}
          {screen === 'mission' && <MissionPlay app={api} />}
          {screen === 'notebook' && <NotebookScreen app={api} />}
          {screen === 'about' && <AboutScreen app={api} version={APP_VERSION} />}
        </main>
        {!attract && (
          <footer className="site-footer no-print">
            <p>
              {t(IS_STAND ? 'app.footer.stand' : 'app.footer', { version: APP_VERSION })}{' '}
              <button type="button" className="btn-link footer-link" onClick={() => go('about')}>
                {t('app.footer.about')}
              </button>
            </p>
          </footer>
        )}
        <BottomNav app={api} />
        {idleLeft !== null && <StandIdleDialog seconds={idleLeft} />}
      </div>
    </I18nProvider>
  );
}
