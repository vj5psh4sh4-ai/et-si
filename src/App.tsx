import React, { useEffect, useMemo, useState } from 'react';
import {
  AVATAR_OPTIONS,
  AvatarIcon,
  COLOR_OPTIONS,
  MissionIllustration,
} from './components/Avatars';
import { MicroActivityWidget } from './components/MicroActivityWidget';
import { DISCOVERY_CARDS, IDEA_ANGLES, MISSIONS, OBJECTIVE_OPTIONS } from './data/missions';
import {
  EXPLORATION_TRACKS,
  REFLECTION_LABELS,
  SITUATION_LABELS,
  buildPathwayForSituation,
} from './data/tracks';
import {
  computeProposedTracks,
  createDemoNotebook,
  getOrderedMissions,
} from './engine/recommendation';
import {
  ActivityFeedback,
  Choice,
  EntryMode,
  FeedbackValue,
  PlayerProfile,
  ReflectionState,
  SavedNotebook,
  SituationId,
} from './types';

const STORAGE_KEY = 'et_si_v01_notebook';

type Screen =
  | 'home'
  | 'character'
  | 'start'
  | 'entry'
  | 'mission'
  | 'pathways'
  | 'notebook'
  | 'about';

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

const DEFAULT_NOTEBOOK: SavedNotebook = {
  profile: DEFAULT_PROFILE,
  feedbacks: [],
  savedTrackIds: [],
  questionsToCheck: [
    'Quelles sont les conditions d’admission exactes depuis ma situation ?',
    'Est-ce qu’une séance d’information ou une journée portes ouvertes est prévue ?',
  ],
  nextAction: '',
  updatedAt: new Date().toISOString(),
};

const NEXT_ACTIONS = [
  'Parler d’une piste avec un·e proche ou un·e enseignant·e',
  'Consulter une séance d’information ou une journée portes ouvertes',
  'Préparer 2 questions pour un·e conseiller·ère d’orientation',
  'Rejouer une autre mission pour tester un rôle différent',
];

export default function App() {
  const [notebook, setNotebook] = useState<SavedNotebook>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SavedNotebook;
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_NOTEBOOK;
  });

  const [hasSavedData, setHasSavedData] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const [screen, setScreen] = useState<Screen>('home');
  const [currentMissionId, setCurrentMissionId] = useState<string>(MISSIONS[0].id);
  const [activeChoice, setActiveChoice] = useState<Choice | null>(null);
  const [consequenceText, setConsequenceText] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackValue | null>(null);
  const [compareTrackIds, setCompareTrackIds] = useState<[string, string]>(['heia', 'hets']);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');

  useEffect(() => {
    if (screen === 'home' && !hasSavedData) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...notebook, updatedAt: new Date().toISOString() })
      );
      setHasSavedData(true);
    } catch {
      // Ignore quota errors
    }
  }, [notebook, screen, hasSavedData]);

  const orderedMissions = useMemo(
    () => getOrderedMissions(notebook.profile),
    [notebook.profile]
  );

  const currentMission = useMemo(
    () => MISSIONS.find((m) => m.id === currentMissionId) ?? orderedMissions[0],
    [currentMissionId, orderedMissions]
  );

  const proposedTracks = useMemo(
    () => computeProposedTracks(notebook.feedbacks, notebook.savedTrackIds),
    [notebook.feedbacks, notebook.savedTrackIds]
  );

  const updateProfile = (patch: Partial<PlayerProfile>) => {
    setNotebook((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  };

  const resetMissionState = (missionId: string) => {
    setCurrentMissionId(missionId);
    setActiveChoice(null);
    setConsequenceText(null);
    setFeedbackGiven(null);
  };

  const startDemo = () => {
    const demo = createDemoNotebook();
    setNotebook(demo);
    setCompareTrackIds(['hets', 'heia']);
    setScreen('pathways');
  };

  const handleDeleteLocalData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setHasSavedData(false);
    setNotebook(DEFAULT_NOTEBOOK);
    resetMissionState(MISSIONS[0].id);
    setScreen('home');
  };

  const handleMicroActivityComplete = (selectedIds: string[]) => {
    if (!activeChoice) return;
    const isAlt = selectedIds.includes(activeChoice.consequences.altTriggerOptionId);
    setConsequenceText(isAlt ? activeChoice.consequences.alt : activeChoice.consequences.default);
  };

  const handleFeedback = (value: FeedbackValue) => {
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
    setNotebook((prev) => ({
      ...prev,
      feedbacks: [
        ...prev.feedbacks.filter(
          (f) => !(f.missionId === entry.missionId && f.choiceId === entry.choiceId)
        ),
        entry,
      ],
    }));
  };

  const toggleSaveTrack = (trackId: string) => {
    setNotebook((prev) => {
      const exists = prev.savedTrackIds.includes(trackId);
      return {
        ...prev,
        savedTrackIds: exists
          ? prev.savedTrackIds.filter((id) => id !== trackId)
          : [...prev.savedTrackIds, trackId],
      };
    });
  };

  const buildPlainTextSummary = () => {
    const { profile, feedbacks, questionsToCheck, nextAction } = notebook;
    const liked = feedbacks.filter((f) => f.feedback === 'refaire' || f.feedback === 'en_vrai');
    const lines = [
      '=== MON CARNET « ET SI… » (v0.1) ===',
      `Explorateur : ${profile.nickname || 'Anonyme'}`,
      `Situation déclarée : ${SITUATION_LABELS[profile.situation]}`,
      `Réflexion : ${REFLECTION_LABELS[profile.reflection]}`,
      profile.ideaText ? `Mon idée (texte saisi) : ${profile.ideaText}` : '',
      '',
      'Activités appréciées ou à découvrir en vrai :',
      liked.length
        ? liked.map((f) => `- ${f.activityLabel} (${f.missionTitle})`).join('\n')
        : '- Aucune activité retenue pour le moment',
      '',
      'Pistes de formation explorées (associations illustratives à valider) :',
      proposedTracks.length
        ? proposedTracks
            .map((p) => `- ${p.track.title} (${p.track.school})`)
            .join('\n')
        : '- Aucune piste retenue pour le moment',
      '',
      'Questions à vérifier :',
      ...questionsToCheck.map((q) => `- ${q}`),
      '',
      `Prochaine action choisie : ${nextAction || 'Non définie'}`,
    ];
    return lines.filter((l) => l !== '').join('\n');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextSummary());
      setCopyStatus('Résumé copié dans le presse-papiers.');
      setTimeout(() => setCopyStatus(''), 3000);
    } catch {
      setCopyStatus('Copie impossible automatiquement. Tu peux utiliser Imprimer / PDF.');
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    setNotebook((prev) => ({
      ...prev,
      questionsToCheck: [...prev.questionsToCheck, trimmed],
    }));
    setNewQuestion('');
  };

  const toggleDiscoveryCard = (cardId: string) => {
    const current = notebook.profile.selectedDiscoveryCards;
    if (current.includes(cardId)) {
      updateProfile({ selectedDiscoveryCards: current.filter((c) => c !== cardId) });
    } else if (current.length < 3) {
      updateProfile({ selectedDiscoveryCards: [...current, cardId] });
    }
  };

  const launchFirstMission = () => {
    const first = getOrderedMissions(notebook.profile)[0];
    resetMissionState(first.id);
    setScreen('mission');
  };

  const nextMission = () => {
    const idx = orderedMissions.findIndex((m) => m.id === currentMission.id);
    const next = orderedMissions[(idx + 1) % orderedMissions.length];
    resetMissionState(next.id);
  };

  return (
    <div className="app-shell">
      <header className="top-bar no-print">
        <button type="button" className="brand-btn" onClick={() => setScreen('home')}>
          Et si…
        </button>
        <nav aria-label="Navigation principale" className="top-nav">
          <button type="button" onClick={() => setScreen('mission')}>
            Missions
          </button>
          <button type="button" onClick={() => setScreen('pathways')}>
            Mes chemins
          </button>
          <button type="button" onClick={() => setScreen('notebook')}>
            Mon carnet
          </button>
          <button type="button" onClick={() => setScreen('about')}>
            À propos
          </button>
        </nav>
        <div className="player-pill" title="Ton personnage">
          <AvatarIcon
            avatarId={notebook.profile.avatarId}
            color={notebook.profile.color}
            size={32}
          />
          <span>{notebook.profile.nickname || 'Explorateur'}</span>
        </div>
      </header>

      <main className="main-content">
        {/* 1. ACCUEIL */}
        {screen === 'home' && (
          <section className="card hero-card">
            <p className="eyebrow">Essaie des idées. Explore plusieurs chemins. Découvre ta prochaine étape.</p>
            <h1>Et si…</h1>
            <p className="lead">Plusieurs futurs sont possibles. Commence par en essayer un.</p>
            <p className="editorial-note">
              Tu n’as pas besoin de savoir aujourd’hui ce que tu feras toute ta vie.
            </p>
            <div className="action-row">
              <button type="button" className="btn-primary" onClick={() => setScreen('character')}>
                Commencer
              </button>
              {hasSavedData && (
                <button type="button" className="btn-secondary" onClick={() => setScreen('mission')}>
                  Reprendre mon exploration
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={startDemo}>
                Voir une démo
              </button>
            </div>
            <p className="disclaimer-text">
              Prototype d’exploration autour des quatre hautes écoles de la HES-SO Fribourg (HEIA-FR,
              HEG-FR, HEdS-FR, HETS-FR). Ton exploration reste dans ce navigateur. Aucun compte n’est
              nécessaire.
            </p>
          </section>
        )}

        {/* 2. PERSONNAGE */}
        {screen === 'character' && (
          <section className="card">
            <h2>1. Ton personnage</h2>
            <p className="muted">
              Choisis un repère visuel pour ton voyage. Ton apparence ne modifie jamais les pistes
              proposées.
            </p>

            <div className="avatar-preview">
              <AvatarIcon
                avatarId={notebook.profile.avatarId}
                color={notebook.profile.color}
                size={72}
              />
              <div>
                <strong>{notebook.profile.nickname || 'Sans pseudonyme'}</strong>
                <div className="muted">Prêt·e à explorer</div>
              </div>
            </div>

            <fieldset className="fieldset">
              <legend>Choisis un avatar</legend>
              <div className="grid-6">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    className={`tile-btn ${notebook.profile.avatarId === av.id ? 'selected' : ''}`}
                    aria-pressed={notebook.profile.avatarId === av.id}
                    onClick={() => updateProfile({ avatarId: av.id })}
                  >
                    <AvatarIcon avatarId={av.id} color={notebook.profile.color} size={42} />
                    <span>{av.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>Choisis une couleur</legend>
              <div className="color-row">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`color-dot ${notebook.profile.color === c.id ? 'selected' : ''}`}
                    style={{ backgroundColor: c.id }}
                    aria-label={c.label}
                    aria-pressed={notebook.profile.color === c.id}
                    onClick={() => updateProfile({ color: c.id })}
                  />
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="nickname">Prénom ou pseudonyme (facultatif)</label>
              <input
                id="nickname"
                type="text"
                maxLength={30}
                value={notebook.profile.nickname}
                placeholder="Ex. Camille, Sam…"
                onChange={(e) => updateProfile({ nickname: e.target.value })}
              />
            </div>

            <div className="action-row">
              <button type="button" className="btn-primary" onClick={() => setScreen('start')}>
                Continuer
              </button>
              <button type="button" className="btn-ghost" onClick={() => setScreen('start')}>
                Passer cette étape
              </button>
            </div>
          </section>
        )}

        {/* 3. POINT DE DÉPART */}
        {screen === 'start' && (
          <section className="card">
            <h2>2. Ton point de départ</h2>
            <p className="muted">Tu pourras modifier ces réponses à tout moment.</p>

            <fieldset className="fieldset">
              <legend>Où en es-tu dans ta formation ?</legend>
              <div className="grid-2">
                {(Object.keys(SITUATION_LABELS) as SituationId[]).map((sit) => (
                  <button
                    key={sit}
                    type="button"
                    className={`choice-btn ${notebook.profile.situation === sit ? 'selected' : ''}`}
                    aria-pressed={notebook.profile.situation === sit}
                    onClick={() => updateProfile({ situation: sit })}
                  >
                    {SITUATION_LABELS[sit]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>Et dans ta réflexion ?</legend>
              <div className="grid-2">
                {(Object.keys(REFLECTION_LABELS) as ReflectionState[]).map((ref) => (
                  <button
                    key={ref}
                    type="button"
                    className={`choice-btn ${notebook.profile.reflection === ref ? 'selected' : ''}`}
                    aria-pressed={notebook.profile.reflection === ref}
                    onClick={() => updateProfile({ reflection: ref })}
                  >
                    {REFLECTION_LABELS[ref]}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="action-row">
              <button type="button" className="btn-primary" onClick={() => setScreen('entry')}>
                Choisir ma porte d’entrée
              </button>
            </div>
          </section>
        )}

        {/* 4. PORTE D'ENTRÉE */}
        {screen === 'entry' && (
          <section className="card">
            <h2>3. Par quoi veux-tu commencer ?</h2>
            <div className="grid-3">
              {(
                [
                  { id: 'decouvre', title: 'Je découvre ce qui me plaît', desc: 'Choisis jusqu’à 3 activités qui t’intriguent.' },
                  { id: 'objectif', title: 'J’ai un objectif', desc: 'Indique une direction que tu as déjà en tête.' },
                  { id: 'idee', title: 'J’ai une idée', desc: 'Pars d’une envie ou d’un projet personnel.' },
                ] as { id: EntryMode; title: string; desc: string }[]
              ).map((gate) => (
                <button
                  key={gate.id}
                  type="button"
                  className={`gate-card ${notebook.profile.entryMode === gate.id ? 'selected' : ''}`}
                  aria-pressed={notebook.profile.entryMode === gate.id}
                  onClick={() => updateProfile({ entryMode: gate.id })}
                >
                  <strong>{gate.title}</strong>
                  <span>{gate.desc}</span>
                </button>
              ))}
            </div>

            {notebook.profile.entryMode === 'decouvre' && (
              <div className="subpanel">
                <h3>Choisis jusqu’à 3 activités ({notebook.profile.selectedDiscoveryCards.length}/3)</h3>
                <div className="grid-2">
                  {DISCOVERY_CARDS.map((card) => {
                    const active = notebook.profile.selectedDiscoveryCards.includes(card.id);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        className={`choice-btn ${active ? 'selected' : ''}`}
                        aria-pressed={active}
                        onClick={() => toggleDiscoveryCard(card.id)}
                      >
                        {card.label}
                      </button>
                    );
                  })}
                </div>
                <div className="action-row">
                  <button type="button" className="btn-primary" onClick={launchFirstMission}>
                    Lancer ma première mission
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      updateProfile({ selectedDiscoveryCards: [] });
                      const randomMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
                      resetMissionState(randomMission.id);
                      setScreen('mission');
                    }}
                  >
                    Surprends-moi
                  </button>
                </div>
              </div>
            )}

            {notebook.profile.entryMode === 'objectif' && (
              <div className="subpanel">
                <h3>Quelle intention te parle le plus ?</h3>
                <div className="grid-2">
                  {OBJECTIVE_OPTIONS.map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      className={`choice-btn ${notebook.profile.selectedObjective === obj.id ? 'selected' : ''}`}
                      aria-pressed={notebook.profile.selectedObjective === obj.id}
                      onClick={() => updateProfile({ selectedObjective: obj.id })}
                    >
                      {obj.label}
                    </button>
                  ))}
                </div>
                <div className="action-row">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!notebook.profile.selectedObjective}
                    onClick={launchFirstMission}
                  >
                    Lancer ma première mission
                  </button>
                </div>
              </div>
            )}

            {notebook.profile.entryMode === 'idee' && (
              <div className="subpanel">
                <div className="field">
                  <label htmlFor="idea-input">Ton idée (facultatif, 300 caractères max)</label>
                  <textarea
                    id="idea-input"
                    maxLength={300}
                    rows={3}
                    value={notebook.profile.ideaText}
                    placeholder="Ex. Créer un atelier de réparation de vélos pour les jeunes…"
                    onChange={(e) => updateProfile({ ideaText: e.target.value })}
                  />
                  <p className="micro-helper">
                    Dans ce prototype, ton idée personnalise ton carnet. Les missions sont proposées à
                    partir de l’angle que tu choisis.
                  </p>
                </div>

                <h3>Pour avancer sur cette idée, qu’aurais-tu envie d’explorer en premier ?</h3>
                <div className="grid-2">
                  {IDEA_ANGLES.map((angle) => (
                    <button
                      key={angle.id}
                      type="button"
                      className={`choice-btn ${notebook.profile.ideaAngle === angle.id ? 'selected' : ''}`}
                      aria-pressed={notebook.profile.ideaAngle === angle.id}
                      onClick={() => updateProfile({ ideaAngle: angle.id })}
                    >
                      {angle.label}
                    </button>
                  ))}
                </div>
                <div className="action-row">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!notebook.profile.ideaAngle}
                    onClick={launchFirstMission}
                  >
                    Lancer ma première mission
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. MISSIONS */}
        {screen === 'mission' && (
          <section className="card">
            <div className="mission-tabs" role="tablist" aria-label="Choisir une mission">
              {orderedMissions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={m.id === currentMission.id}
                  className={`tab-btn ${m.id === currentMission.id ? 'selected' : ''}`}
                  onClick={() => resetMissionState(m.id)}
                >
                  {m.title}
                </button>
              ))}
            </div>

            <MissionIllustration id={currentMission.illustrationId} />
            <h2>{currentMission.title}</h2>
            <p className="lead">{currentMission.intro}</p>

            {!activeChoice && (
              <div>
                <h3>{currentMission.scene.prompt}</h3>
                <div className="grid-2">
                  {currentMission.scene.choices.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      className="role-card"
                      onClick={() => setActiveChoice(ch)}
                    >
                      <strong>{ch.label}</strong>
                      <span>{ch.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeChoice && !consequenceText && (
              <div>
                <div className="role-banner">
                  Rôle essayé : <strong>{activeChoice.label}</strong>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setActiveChoice(null)}
                  >
                    Changer de rôle
                  </button>
                </div>
                <MicroActivityWidget
                  key={activeChoice.id}
                  activity={activeChoice.microActivity}
                  onComplete={handleMicroActivityComplete}
                />
              </div>
            )}

            {activeChoice && consequenceText && (
              <div className="consequence-box">
                <h3>Ce qui se passe dans le projet</h3>
                <p>{consequenceText}</p>

                <div className="feedback-box">
                  <h4>Cette activité, tu aimerais…</h4>
                  <div className="grid-2">
                    {(
                      [
                        { id: 'refaire', label: 'La refaire' },
                        { id: 'en_vrai', label: 'La découvrir en vrai' },
                        { id: 'autre_chose', label: 'Essayer autre chose' },
                        { id: 'ne_sais_pas', label: 'Je ne sais pas encore' },
                      ] as { id: FeedbackValue; label: string }[]
                    ).map((fb) => (
                      <button
                        key={fb.id}
                        type="button"
                        className={`choice-btn ${feedbackGiven === fb.id ? 'selected' : ''}`}
                        aria-pressed={feedbackGiven === fb.id}
                        onClick={() => handleFeedback(fb.id)}
                      >
                        {fb.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="action-row">
                  <button type="button" className="btn-primary" onClick={nextMission}>
                    Continuer vers une autre mission
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setActiveChoice(null);
                      setConsequenceText(null);
                      setFeedbackGiven(null);
                    }}
                  >
                    Essayer un autre rôle
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setScreen('pathways')}>
                    Voir mes chemins
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 6. CHEMINS */}
        {screen === 'pathways' && (
          <section className="card">
            <h2>Mes chemins possibles</h2>
            <p className="disclaimer-banner">
              Association illustrative à valider avec les écoles. Aucune condition d’admission n’est
              vérifiée dans ce prototype.
            </p>

            <div className="situation-switcher">
              <label htmlFor="sit-select">Simuler depuis la situation :</label>
              <select
                id="sit-select"
                value={notebook.profile.situation}
                onChange={(e) => updateProfile({ situation: e.target.value as SituationId })}
              >
                {(Object.keys(SITUATION_LABELS) as SituationId[]).map((sit) => (
                  <option key={sit} value={sit}>
                    {SITUATION_LABELS[sit]}
                  </option>
                ))}
              </select>
            </div>

            {proposedTracks.length === 0 ? (
              <div className="empty-state">
                <p>
                  Rien ne t’a vraiment parlé pour le moment. Tu peux essayer une autre mission ou
                  garder les questions que cela t’a donné envie de poser.
                </p>
                <button type="button" className="btn-primary" onClick={() => setScreen('mission')}>
                  Essayer une mission
                </button>
              </div>
            ) : (
              <div className="tracks-grid">
                {proposedTracks.map(({ track, reasons }) => {
                  const isSaved = notebook.savedTrackIds.includes(track.id);
                  const nodes = buildPathwayForSituation(notebook.profile.situation, track);
                  return (
                    <article key={track.id} className="track-card">
                      <div className="track-header">
                        <span className="school-badge">{track.school}</span>
                        <span className="status-badge">Statut : {track.validationStatus}</span>
                      </div>
                      <h3>{track.title}</h3>
                      <p>{track.summary}</p>
                      <div className="reason-box">
                        {reasons.map((r, i) => (
                          <p key={i}>{r}</p>
                        ))}
                      </div>
                      <h4>Compétences à développer</h4>
                      <ul>
                        {track.skills.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <h4>Parcours indicatif</h4>
                      <ol className="pathway-steps">
                        {nodes.map((node) => (
                          <li key={node.id}>
                            <span className="step-label">{node.stepLabel}</span>
                            <strong>{node.title}</strong>
                            <span>{node.detail}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="next-exp">
                        <strong>Prochaine expérience possible :</strong> {track.nextExperience}
                      </p>
                      <p className="micro-helper">Association illustrative à valider avec les écoles.</p>
                      <button
                        type="button"
                        className={isSaved ? 'btn-secondary' : 'btn-primary'}
                        onClick={() => toggleSaveTrack(track.id)}
                      >
                        {isSaved ? 'Retirer de mon carnet' : 'Garder cette piste'}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}

            <hr className="divider" />

            <h3>Explorer ou comparer deux chemins côte à côte</h3>
            <p className="muted">
              Tu peux aussi sauvegarder manuellement une piste même si elle n’apparaît pas en premier.
            </p>
            <div className="compare-controls">
              <select
                aria-label="Premier chemin à comparer"
                value={compareTrackIds[0]}
                onChange={(e) => setCompareTrackIds([e.target.value, compareTrackIds[1]])}
              >
                {EXPLORATION_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.school} — {t.title}
                  </option>
                ))}
              </select>
              <select
                aria-label="Second chemin à comparer"
                value={compareTrackIds[1]}
                onChange={(e) => setCompareTrackIds([compareTrackIds[0], e.target.value])}
              >
                {EXPLORATION_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.school} — {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="compare-grid">
              {compareTrackIds.map((id, idx) => {
                const track = EXPLORATION_TRACKS.find((t) => t.id === id)!;
                const nodes = buildPathwayForSituation(notebook.profile.situation, track);
                const isSaved = notebook.savedTrackIds.includes(track.id);
                return (
                  <div key={`${id}-${idx}`} className="compare-col">
                    <div className="track-header">
                      <span className="school-badge">{track.school}</span>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => toggleSaveTrack(track.id)}
                      >
                        {isSaved ? '✓ Gardée' : '+ Garder'}
                      </button>
                    </div>
                    <h4>{track.title}</h4>
                    <ol className="pathway-steps">
                      {nodes.map((node) => (
                        <li key={node.id}>
                          <span className="step-label">{node.stepLabel}</span>
                          <strong>{node.title}</strong>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>

            <div className="action-row">
              <button type="button" className="btn-primary" onClick={() => setScreen('notebook')}>
                Ouvrir mon carnet
              </button>
            </div>
          </section>
        )}

        {/* 7. CARNET */}
        {screen === 'notebook' && (
          <section className="card">
            <div className="notebook-header">
              <AvatarIcon
                avatarId={notebook.profile.avatarId}
                color={notebook.profile.color}
                size={56}
              />
              <div>
                <h2>Mon carnet d’exploration</h2>
                <p className="muted">
                  {notebook.profile.nickname || 'Explorateur'} •{' '}
                  {SITUATION_LABELS[notebook.profile.situation]} •{' '}
                  {REFLECTION_LABELS[notebook.profile.reflection]}
                </p>
              </div>
            </div>

            {notebook.profile.ideaText && (
              <div className="idea-callout">
                <strong>Mon idée (texte saisi par le joueur) :</strong>
                <p>{notebook.profile.ideaText}</p>
              </div>
            )}

            <h3>Activités essayées ({notebook.feedbacks.length})</h3>
            {notebook.feedbacks.length === 0 ? (
              <p className="muted">Aucune activité essayée pour le moment.</p>
            ) : (
              <ul className="notebook-list">
                {notebook.feedbacks.map((fb) => (
                  <li key={`${fb.missionId}-${fb.choiceId}`}>
                    <strong>{fb.activityLabel}</strong> ({fb.missionTitle}) —{' '}
                    <span className="tag-pill">
                      {fb.feedback === 'refaire' && 'À refaire'}
                      {fb.feedback === 'en_vrai' && 'À découvrir en vrai'}
                      {fb.feedback === 'autre_chose' && 'Autre chose pour l’instant'}
                      {fb.feedback === 'ne_sais_pas' && 'Je ne sais pas encore'}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h3>Pistes sauvegardées ({notebook.savedTrackIds.length})</h3>
            {notebook.savedTrackIds.length === 0 ? (
              <p className="muted">Aucune piste sauvegardée. Tu peux en ajouter depuis « Mes chemins ».</p>
            ) : (
              <ul className="notebook-list">
                {notebook.savedTrackIds.map((id) => {
                  const t = EXPLORATION_TRACKS.find((tr) => tr.id === id);
                  if (!t) return null;
                  return (
                    <li key={id}>
                      <strong>{t.title}</strong> ({t.school}) —{' '}
                      <em>Association illustrative à valider avec les écoles.</em>
                    </li>
                  );
                })}
              </ul>
            )}

            <h3>Questions à vérifier</h3>
            <ul className="notebook-list">
              {notebook.questionsToCheck.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <form onSubmit={handleAddQuestion} className="inline-form no-print">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ajouter une question à poser…"
                aria-label="Ajouter une question à vérifier"
              />
              <button type="submit" className="btn-secondary">
                Ajouter
              </button>
            </form>

            <h3>Ma prochaine action</h3>
            <div className="grid-2 no-print">
              {NEXT_ACTIONS.map((act) => (
                <button
                  key={act}
                  type="button"
                  className={`choice-btn ${notebook.nextAction === act ? 'selected' : ''}`}
                  aria-pressed={notebook.nextAction === act}
                  onClick={() => setNotebook((prev) => ({ ...prev, nextAction: act }))}
                >
                  {act}
                </button>
              ))}
            </div>
            {notebook.nextAction && (
              <p className="print-only">
                <strong>Prochaine action choisie :</strong> {notebook.nextAction}
              </p>
            )}

            <div className="action-row no-print">
              <button type="button" className="btn-primary" onClick={handleCopySummary}>
                Copier mon résumé
              </button>
              <button type="button" className="btn-secondary" onClick={() => window.print()}>
                Imprimer / enregistrer en PDF
              </button>
              <button type="button" className="btn-ghost" onClick={() => setScreen('character')}>
                Recommencer
              </button>
              <button type="button" className="btn-danger" onClick={handleDeleteLocalData}>
                Supprimer mes données locales
              </button>
            </div>
            {copyStatus && <p className="status-msg" role="status">{copyStatus}</p>}
            <p className="disclaimer-text">
              Ton exploration reste dans ce navigateur. Aucun compte n’est nécessaire.
            </p>
          </section>
        )}

        {/* 8. À PROPOS */}
        {screen === 'about' && (
          <section className="card">
            <h2>À propos de « Et si… » (v0.1)</h2>
            <p>
              <strong>Et si…</strong> est un prototype d’exploration destiné à tester une expérience
              ludique autour des quatre hautes écoles de la HES-SO Fribourg (HEIA-FR, HEG-FR,
              HEdS-FR, HETS-FR).
            </p>
            <h3>Ce que fait ce prototype</h3>
            <ul>
              <li>Propose quatre missions narratives courtes et des microactivités interactives.</li>
              <li>Relie tes ressentis à des familles d’activités de façon transparente et explicable.</li>
              <li>Sauvegarde ton carnet uniquement dans ton navigateur (localStorage).</li>
            </ul>
            <h3>Limites assumées de la v0.1</h3>
            <ul>
              <li>Ce n’est ni un test d’orientation validé, ni un outil officiel d’admission.</li>
              <li>Aucune condition d’admission n’est vérifiée ni garantie.</li>
              <li>Les regroupements affichés sont illustratifs et ne sont pas des intitulés officiels de Bachelors.</li>
              <li>Aucune donnée n’est envoyée à un serveur ou à une intelligence artificielle.</li>
            </ul>
            <div className="action-row">
              <button type="button" className="btn-primary" onClick={() => setScreen('home')}>
                Retour à l’accueil
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
