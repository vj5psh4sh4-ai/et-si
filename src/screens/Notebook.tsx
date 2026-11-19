import React, { useState } from 'react';
import { Copy, Pencil, Printer, Trash2, X } from 'lucide-react';
import type { AppApi } from '../appApi';
import { NEXT_ACTIONS } from '../appApi';
import { AvatarIcon } from '../components/Avatars';
import { ConfirmButton } from '../components/Chrome';
import { EXPLORATION_TRACKS, REFLECTION_LABELS, SITUATION_LABELS } from '../data/tracks';
import { FEEDBACK_SHORT, TRACK_COLORS } from '../data/ui';

export const NotebookScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { notebook } = app;
  const { profile, feedbacks, questionsToCheck, nextAction } = notebook;
  const [newQuestion, setNewQuestion] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const liked = feedbacks.filter((f) => f.feedback === 'refaire' || f.feedback === 'en_vrai');

  const buildSummary = () => {
    const lines = [
      '=== MON CARNET « ET SI… » ===',
      `Personnage : ${profile.nickname || 'Anonyme'}`,
      `Situation déclarée : ${SITUATION_LABELS[profile.situation]}`,
      `Réflexion : ${REFLECTION_LABELS[profile.reflection]}`,
      profile.ideaText ? `Mon idée (texte saisi) : ${profile.ideaText}` : '',
      '',
      'Activités appréciées ou à découvrir en vrai :',
      liked.length ? liked.map((f) => `- ${f.activityLabel} (${f.missionTitle})`).join('\n') : '- Aucune activité retenue pour le moment',
      '',
      'Pistes (associations illustratives à valider avec les écoles) :',
      app.proposedTracks.length
        ? app.proposedTracks.map((p) => `- ${p.track.title} (${p.track.school})`).join('\n')
        : '- Aucune piste retenue pour le moment',
      '',
      'Questions à vérifier :',
      ...questionsToCheck.map((q) => `- ${q}`),
      '',
      `Prochaine action : ${nextAction || 'Non définie'}`,
    ];
    return lines.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopyStatus('Résumé copié dans le presse-papiers.');
    } catch {
      setCopyStatus('Copie automatique impossible ici. Utilise « Imprimer / PDF ».');
    }
    setTimeout(() => setCopyStatus(''), 4000);
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const q = newQuestion.trim();
    if (!q) return;
    app.updateNotebook((prev) => ({ ...prev, questionsToCheck: [...prev.questionsToCheck, q] }));
    setNewQuestion('');
  };

  const removeQuestion = (idx: number) =>
    app.updateNotebook((prev) => ({ ...prev, questionsToCheck: prev.questionsToCheck.filter((_, i) => i !== idx) }));

  return (
    <section className="page notebook">
      <header className="nb-head" style={{ ['--player' as string]: profile.color }}>
        <AvatarIcon avatarId={profile.avatarId} color={profile.color} size={72} />
        <div className="nb-head-text">
          <p className="eyebrow">Mon carnet d’exploration</p>
          <h1 className="page-title">{profile.nickname || 'Mon exploration'}</h1>
          <p className="nb-meta">
            <span>{SITUATION_LABELS[profile.situation]}</span>
            <span>{REFLECTION_LABELS[profile.reflection]}</span>
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-small no-print" onClick={() => app.go('start')}>
          <Pencil size={16} aria-hidden="true" /> Modifier mon point de départ
        </button>
      </header>

      {profile.ideaText && (
        <div className="idea-callout">
          <span className="idea-label">Mon idée (texte saisi)</span>
          <p>« {profile.ideaText} »</p>
        </div>
      )}

      <div className="nb-grid">
        <div className="nb-col">
          <section className="nb-section">
            <h2>
              Activités essayées <span className="count">{feedbacks.length}</span>
            </h2>
            {feedbacks.length === 0 ? (
              <p className="muted">Aucune activité essayée pour le moment.</p>
            ) : (
              <ul className="nb-list">
                {feedbacks.map((fb) => (
                  <li key={`${fb.missionId}-${fb.choiceId}`}>
                    <div>
                      <strong>{fb.activityLabel}</strong>
                      <span className="muted small">{fb.missionTitle}</span>
                    </div>
                    <span className={`fb-pill fb-${fb.feedback}`}>{FEEDBACK_SHORT[fb.feedback]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="nb-section">
            <h2>
              Pistes gardées <span className="count">{notebook.savedTrackIds.length}</span>
            </h2>
            {notebook.savedTrackIds.length === 0 ? (
              <p className="muted">Aucune piste gardée. Tu peux en ajouter depuis « Mes chemins ».</p>
            ) : (
              <ul className="nb-list">
                {notebook.savedTrackIds.map((id) => {
                  const t = EXPLORATION_TRACKS.find((tr) => tr.id === id);
                  if (!t) return null;
                  return (
                    <li key={id} className="nb-track" style={{ ['--t-main' as string]: TRACK_COLORS[t.id]?.main }}>
                      <div>
                        <strong>{t.title}</strong>
                        <span className="muted small">{t.school} · association illustrative à valider</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="nb-col">
          <section className="nb-section">
            <h2>Questions à vérifier</h2>
            <ul className="nb-list q-list">
              {questionsToCheck.map((q, i) => (
                <li key={i}>
                  <span>{q}</span>
                  <button type="button" className="icon-btn no-print" aria-label={`Retirer la question : ${q}`} onClick={() => removeQuestion(i)}>
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={addQuestion} className="inline-form no-print">
              <input
                type="text"
                value={newQuestion}
                maxLength={200}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ajouter une question à poser…"
                aria-label="Ajouter une question à vérifier"
              />
              <button type="submit" className="btn btn-secondary">
                Ajouter
              </button>
            </form>
          </section>

          <section className="nb-section">
            <h2>Ma prochaine action</h2>
            <div className="action-options no-print" role="group" aria-label="Ma prochaine action">
              {NEXT_ACTIONS.map((act) => {
                const on = nextAction === act;
                return (
                  <button
                    key={act}
                    type="button"
                    className={`choice-btn ${on ? 'selected' : ''}`}
                    aria-pressed={on}
                    onClick={() => app.updateNotebook((prev) => ({ ...prev, nextAction: on ? '' : act }))}
                  >
                    <span className="radio-dot" aria-hidden="true" />
                    {act}
                  </button>
                );
              })}
            </div>
            <p className="print-only">
              <strong>Prochaine action choisie :</strong> {nextAction || 'Non définie'}
            </p>
          </section>
        </div>
      </div>

      <div className="nb-actions no-print">
        <div className="action-row">
          <button type="button" className="btn btn-primary" onClick={copy}>
            <Copy size={18} aria-hidden="true" /> Copier mon résumé
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> Imprimer / enregistrer en PDF
          </button>
        </div>
        <div className="action-row">
          <ConfirmButton
            label="Recommencer"
            warning="Tes activités et pistes seront effacées, ton personnage est conservé."
            confirmLabel="Oui, recommencer"
            onConfirm={app.restartExploration}
          />
          <ConfirmButton
            label="Supprimer mes données locales"
            className="btn btn-ghost btn-danger-text"
            warning="Tout ce qui est enregistré dans ce navigateur sera supprimé."
            confirmLabel="Supprimer"
            onConfirm={app.deleteLocalData}
          />
        </div>
        {copyStatus && (
          <p className="status-msg" role="status">
            {copyStatus}
          </p>
        )}
        <p className="disclaimer-text">
          <Trash2 size={14} aria-hidden="true" /> Ton exploration reste dans ce navigateur. Aucun compte n’est nécessaire.
        </p>
      </div>
    </section>
  );
};
