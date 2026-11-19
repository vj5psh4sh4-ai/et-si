import React from 'react';
import { ArrowLeft, ArrowRight, Check, Map, RefreshCw, Signpost, Sparkles } from 'lucide-react';
import type { AppApi, MissionStep } from '../appApi';
import { MicroActivityWidget } from '../components/MicroActivityWidget';
import { MISSION_ACCENTS, MissionScene } from '../components/Illustrations';
import { getInitialPreferredTags } from '../engine/recommendation';
import { FEEDBACK_OPTIONS, FEEDBACK_SHORT, TAG_LABELS } from '../data/ui';
import type { Mission } from '../types';

function triedChoiceIds(app: AppApi, missionId: string) {
  return new Set(app.notebook.feedbacks.filter((f) => f.missionId === missionId).map((f) => f.choiceId));
}

/* ---------- Carte des missions ---------- */

export const MissionHub: React.FC<{ app: AppApi }> = ({ app }) => {
  const p = app.notebook.profile;
  const hasPrefs = getInitialPreferredTags(p).length > 0;
  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Carte des missions</p>
        <h1 className="page-title">Choisis un projet à rejoindre</h1>
        <p className="page-lead">
          Dans chaque mission, tu peux essayer plusieurs rôles. Aucun n’est noté : on cherche ce qui te donne envie d’aller plus loin.
        </p>
        {hasPrefs && (
          <p className="hint-line">
            <Sparkles size={16} aria-hidden="true" /> L’ordre des missions suit ce que tu as choisi à l’entrée. Toutes restent ouvertes.
          </p>
        )}
      </header>

      {p.ideaText && (
        <div className="idea-callout">
          <span className="idea-label">Ton idée</span>
          <p>« {p.ideaText} »</p>
        </div>
      )}

      <div className="mission-grid">
        {app.orderedMissions.map((m, i) => (
          <MissionCard key={m.id} app={app} mission={m} suggested={hasPrefs && i === 0} />
        ))}
      </div>

      {app.notebook.feedbacks.length > 0 && (
        <div className="hub-foot">
          <p>
            Tu as déjà essayé <strong>{app.notebook.feedbacks.length}</strong> rôle{app.notebook.feedbacks.length > 1 ? 's' : ''}.
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => app.go('pathways')}>
            <Signpost size={18} aria-hidden="true" /> Voir mes chemins
          </button>
        </div>
      )}
    </section>
  );
};

const MissionCard: React.FC<{ app: AppApi; mission: Mission; suggested: boolean }> = ({ app, mission, suggested }) => {
  const tried = triedChoiceIds(app, mission.id);
  const total = mission.scene.choices.length;
  const accent = MISSION_ACCENTS[mission.illustrationId].accent;
  return (
    <article className="mission-card" style={{ ['--m-accent' as string]: accent }}>
      <div className="mission-card-art">
        <MissionScene id={mission.illustrationId} />
        {suggested && <span className="pill pill-sign">Suggérée pour commencer</span>}
      </div>
      <div className="mission-card-body">
        <h2>{mission.title}</h2>
        <p>{mission.intro}</p>
        <div className="mission-progress" aria-label={`${tried.size} rôle(s) essayé(s) sur ${total}`}>
          <span className="role-dots" aria-hidden="true">
            {mission.scene.choices.map((c) => (
              <span key={c.id} className={tried.has(c.id) ? 'on' : ''} />
            ))}
          </span>
          <span>
            {tried.size === 0 ? `${total} rôles à essayer` : `${tried.size} / ${total} rôles essayés`}
          </span>
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={() => app.openMission(mission.id)}>
          {tried.size === 0 ? 'Rejoindre le projet' : 'Essayer un autre rôle'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

/* ---------- Mission en cours ---------- */

const STEPS: { id: MissionStep; label: string }[] = [
  { id: 'role', label: 'Choisir un rôle' },
  { id: 'activity', label: 'Agir' },
  { id: 'debrief', label: 'Voir le résultat' },
  { id: 'fork', label: 'Bifurquer' },
];

export const MissionPlay: React.FC<{ app: AppApi }> = ({ app }) => {
  const m = app.currentMission;
  const tried = triedChoiceIds(app, m.id);
  const stepIdx = STEPS.findIndex((s) => s.id === app.missionStep);
  const accent = MISSION_ACCENTS[m.illustrationId].accent;
  const remaining = m.scene.choices.filter((c) => !tried.has(c.id)).length;
  const stageRef = React.useRef<HTMLDivElement>(null);
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const el = stageRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }, [app.missionStep, app.activeChoice?.id]);

  return (
    <section className="page mission-page" style={{ ['--m-accent' as string]: accent }}>
      <button type="button" className="back-link" onClick={() => app.go('hub')}>
        <ArrowLeft size={18} aria-hidden="true" /> Toutes les missions
      </button>

      <div className="mission-layout">
        <aside className="mission-aside">
          <div className="mission-aside-art">
            <MissionScene id={m.illustrationId} />
          </div>
          <div className="mission-aside-body">
            <p className="eyebrow">Mission</p>
            <h1 className="mission-title">{m.title}</h1>
            <p>{m.intro}</p>
            <h2 className="aside-sub">Rôles dans ce projet</h2>
            <ul className="aside-roles">
              {m.scene.choices.map((c) => {
                const fb = app.notebook.feedbacks.find((f) => f.missionId === m.id && f.choiceId === c.id);
                const current = app.activeChoice?.id === c.id;
                return (
                  <li key={c.id} className={`${fb ? 'done' : ''} ${current ? 'current' : ''}`}>
                    <span className="aside-role-mark" aria-hidden="true">
                      {fb ? <Check size={14} strokeWidth={3} /> : null}
                    </span>
                    <span>
                      {c.label}
                      {fb && <small>{FEEDBACK_SHORT[fb.feedback]}</small>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="stage" ref={stageRef}>
          <ol className="stage-steps" aria-label={`Étape ${stepIdx + 1} sur 4 : ${STEPS[stepIdx].label}`}>
            {STEPS.map((s, i) => (
              <li key={s.id} className={i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}>
                <span className="ss-dot">{i < stepIdx ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                <span className="ss-label">{s.label}</span>
              </li>
            ))}
          </ol>

          {app.missionStep === 'role' && (
            <div className="stage-body">
              <h2 className="stage-title">{m.scene.prompt}</h2>
              <div className="role-grid">
                {m.scene.choices.map((ch) => (
                  <button key={ch.id} type="button" className="role-card" onClick={() => app.pickRole(ch)}>
                    <span className="role-card-top">
                      <strong>{ch.label}</strong>
                      {tried.has(ch.id) && <span className="pill pill-done">Déjà essayé</span>}
                    </span>
                    <span className="role-desc">{ch.description}</span>
                    <span className="tag-row">
                      {ch.tags.map((t) => (
                        <span key={t} className="tag">
                          {TAG_LABELS[t]}
                        </span>
                      ))}
                    </span>
                    <span className="role-go" aria-hidden="true">
                      <ArrowRight size={18} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {app.missionStep === 'activity' && app.activeChoice && (
            <div className="stage-body">
              <div className="role-banner">
                <span>
                  Ton rôle : <strong>{app.activeChoice.label}</strong>
                </span>
                <button type="button" className="btn-link" onClick={app.backToRoles}>
                  Changer de rôle
                </button>
              </div>
              <MicroActivityWidget key={app.activeChoice.id} activity={app.activeChoice.microActivity} onComplete={app.completeActivity} />
            </div>
          )}

          {app.missionStep === 'debrief' && app.activeChoice && app.consequenceText && (
            <div className="stage-body">
              <div className="consequence-card">
                <p className="eyebrow">Ce qui se passe dans le projet</p>
                <p className="consequence-text">{app.consequenceText}</p>
              </div>
              <fieldset className="fieldset feedback-set">
                <legend className="stage-title">« {app.activeChoice.activityLabel} » : tu aimerais…</legend>
                <div className="feedback-grid">
                  {FEEDBACK_OPTIONS.map((fb) => {
                    const on = app.feedbackGiven === fb.id;
                    return (
                      <button
                        key={fb.id}
                        type="button"
                        className={`feedback-btn ${on ? 'selected' : ''}`}
                        aria-pressed={on}
                        onClick={() => app.giveFeedback(fb.id)}
                      >
                        <strong>{fb.label}</strong>
                        <span>{fb.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="action-row">
                <button type="button" className="btn btn-primary" disabled={!app.feedbackGiven} onClick={app.toFork}>
                  Et maintenant ? <ArrowRight size={18} aria-hidden="true" />
                </button>
                {!app.feedbackGiven && <span className="micro-helper">Choisis une réponse pour continuer. « Je ne sais pas encore » compte aussi.</span>}
              </div>
            </div>
          )}

          {app.missionStep === 'fork' && app.activeChoice && (
            <div className="stage-body">
              {app.feedbackGiven && (
                <p className="saved-note" role="status">
                  <Check size={16} strokeWidth={3} aria-hidden="true" /> Noté dans ton carnet : « {app.activeChoice.activityLabel} » —{' '}
                  {FEEDBACK_SHORT[app.feedbackGiven]}
                </p>
              )}
              <h2 className="stage-title">Et maintenant, quel chemin prends-tu ?</h2>
              <div className="fork-grid">
                <button type="button" className="fork-card" onClick={app.backToRoles}>
                  <RefreshCw size={24} aria-hidden="true" />
                  <strong>Essayer un autre rôle</strong>
                  <span>
                    {remaining > 0
                      ? `Même projet, autre regard. ${remaining} rôle${remaining > 1 ? 's' : ''} pas encore essayé${remaining > 1 ? 's' : ''}.`
                      : 'Tu as essayé tous les rôles. Tu peux en refaire un.'}
                  </span>
                </button>
                <button type="button" className="fork-card" onClick={app.nextMission}>
                  <Map size={24} aria-hidden="true" />
                  <strong>Changer de mission</strong>
                  <span>Rejoindre un autre projet avec d’autres situations.</span>
                </button>
                <button type="button" className="fork-card fork-card-sign" onClick={() => app.go('pathways')}>
                  <Signpost size={24} aria-hidden="true" />
                  <strong>Voir mes chemins</strong>
                  <span>
                    {app.proposedTracks.length > 0
                      ? `${app.proposedTracks.length} piste${app.proposedTracks.length > 1 ? 's' : ''} à regarder de plus près.`
                      : 'Pour l’instant, aucune piste ne ressort. C’est normal.'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
