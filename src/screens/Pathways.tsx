import React, { useState } from 'react';
import { ArrowRight, Bookmark, BookmarkCheck, Check, Compass, Footprints, Map } from 'lucide-react';
import type { AppApi } from '../appApi';
import { EXPLORATION_TRACKS, SITUATION_LABELS, buildPathwayForSituation } from '../data/tracks';
import { SITUATION_SHORT, TRACK_COLORS } from '../data/ui';
import type { ExplorationTrack, PathwayNode, SituationId, ValidationStatus } from '../types';

const STATUS_LABEL: Record<ValidationStatus, string> = {
  demo: 'Illustratif',
  to_review: 'Conditions à vérifier',
  validated: 'Vérifié',
};

const SITUATIONS: SituationId[] = ['co', 'apprentissage', 'college', 'ecg', 'autre', 'non_precise'];

const trackStyle = (t: ExplorationTrack) => {
  const c = TRACK_COLORS[t.id] ?? TRACK_COLORS.heia;
  return { ['--t-main' as string]: c.main, ['--t-soft' as string]: c.soft, ['--t-ink' as string]: c.ink } as React.CSSProperties;
};

const Trail: React.FC<{ nodes: PathwayNode[]; compact?: boolean }> = ({ nodes, compact }) => (
  <ol className={`trail ${compact ? 'compact' : ''}`}>
    {nodes.map((node, i) => (
      <li key={node.id} className={`trail-node ${node.title === 'Conditions à vérifier' ? 'check' : ''}`}>
        <span className="trail-marker" aria-hidden="true">
          {i === 0 ? <Footprints size={14} /> : i === nodes.length - 1 ? <Compass size={14} /> : i}
        </span>
        <div className="trail-content">
          <span className="trail-step">{node.stepLabel}</span>
          <strong>{node.title}</strong>
          {!compact && <span className="trail-detail">{node.detail}</span>}
          {i > 0 && <span className={`status-pill s-${node.validationStatus}`}>{STATUS_LABEL[node.validationStatus]}</span>}
        </div>
      </li>
    ))}
  </ol>
);

export const PathwaysScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { notebook } = app;
  const situation = notebook.profile.situation;
  const proposedIds = app.proposedTracks.map((p) => p.track.id);
  const [compareIds, setCompareIds] = useState<[string, string]>(() => {
    const a = proposedIds[0] ?? 'heia';
    const b = proposedIds[1] ?? EXPLORATION_TRACKS.find((t) => t.id !== a)!.id;
    return [a, b];
  });

  const others = EXPLORATION_TRACKS.filter((t) => !proposedIds.includes(t.id));

  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Mes chemins</p>
        <h1 className="page-title">Où pourraient mener tes découvertes ?</h1>
        <p className="page-lead">
          Les pistes viennent uniquement des activités que tu as aimées ou des pistes que tu as gardées. Pas de score, pas de classement.
        </p>
      </header>

      <div className="situation-bar" role="group" aria-labelledby="sit-label">
        <span id="sit-label" className="situation-label">
          Depuis ma situation :
        </span>
        <div className="chip-row">
          {SITUATIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${situation === s ? 'selected' : ''}`}
              aria-pressed={situation === s}
              title={SITUATION_LABELS[s]}
              onClick={() => app.updateProfile({ situation: s })}
            >
              {SITUATION_SHORT[s]}
            </button>
          ))}
        </div>
      </div>

      <p className="disclaimer-banner">
        <strong>Association illustrative à valider avec les écoles.</strong> Aucune condition d’admission n’est vérifiée dans ce prototype :
        les étapes indiquent ce qu’il faut explorer, pas ce qui est garanti.
      </p>

      {app.proposedTracks.length === 0 ? (
        <div className="empty-state">
          <Map size={40} aria-hidden="true" />
          <p>
            Rien ne t’a vraiment parlé pour le moment. Tu peux essayer une autre mission ou garder les questions que cela t’a donné envie de poser.
          </p>
          <div className="action-row center">
            <button type="button" className="btn btn-primary" onClick={() => app.go('hub')}>
              Essayer une mission
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => app.go('notebook')}>
              Noter mes questions
            </button>
          </div>
        </div>
      ) : (
        <div className="tracks-grid">
          {app.proposedTracks.map(({ track, reasons }) => {
            const isSaved = notebook.savedTrackIds.includes(track.id);
            const nodes = buildPathwayForSituation(situation, track);
            return (
              <article key={track.id} className="track-card" style={trackStyle(track)}>
                <div className="track-plate">
                  <span className="track-school">{track.school}</span>
                  <h2>{track.title}</h2>
                </div>
                <div className="track-body">
                  <p>{track.summary}</p>
                  <ul className="reason-list">
                    {reasons.map((r, i) => (
                      <li key={i}>
                        <Check size={16} strokeWidth={3} aria-hidden="true" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="h-mini">Compétences à développer</h3>
                  <ul className="skill-chips">
                    {track.skills.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <h3 className="h-mini">Parcours indicatif</h3>
                  <Trail nodes={nodes} />
                  <div className="next-exp">
                    <span className="h-mini">Prochaine expérience possible</span>
                    <p>{track.nextExperience}</p>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-block ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
                    aria-pressed={isSaved}
                    onClick={() => app.toggleSaveTrack(track.id)}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck size={18} aria-hidden="true" /> Gardée dans mon carnet
                      </>
                    ) : (
                      <>
                        <Bookmark size={18} aria-hidden="true" /> Garder cette piste
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {others.length > 0 && (
        <div className="other-tracks">
          <h2 className="section-title">Autres pistes du prototype</h2>
          <p className="muted">Tu peux garder une piste même si elle n’est pas ressortie de tes missions.</p>
          <div className="other-grid">
            {others.map((t) => {
              const isSaved = notebook.savedTrackIds.includes(t.id);
              return (
                <div key={t.id} className="other-card" style={trackStyle(t)}>
                  <span className="track-school">{t.school}</span>
                  <strong>{t.title}</strong>
                  <button type="button" className="btn btn-small btn-ghost" aria-pressed={isSaved} onClick={() => app.toggleSaveTrack(t.id)}>
                    {isSaved ? 'Gardée' : 'Garder'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="compare">
        <h2 className="section-title">Comparer deux chemins</h2>
        <p className="muted">Depuis la situation « {SITUATION_LABELS[situation]} ».</p>
        <div className="compare-grid">
          {compareIds.map((id, idx) => {
            const track = EXPLORATION_TRACKS.find((t) => t.id === id)!;
            const nodes = buildPathwayForSituation(situation, track);
            const isSaved = notebook.savedTrackIds.includes(track.id);
            return (
              <div key={idx} className="compare-col" style={trackStyle(track)}>
                <label className="sr-only" htmlFor={`cmp-${idx}`}>
                  {idx === 0 ? 'Premier chemin à comparer' : 'Second chemin à comparer'}
                </label>
                <select
                  id={`cmp-${idx}`}
                  value={id}
                  onChange={(e) => {
                    const next: [string, string] = [...compareIds] as [string, string];
                    next[idx] = e.target.value;
                    setCompareIds(next);
                  }}
                >
                  {EXPLORATION_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.school} — {t.title}
                    </option>
                  ))}
                </select>
                <Trail nodes={nodes} compact />
                <button type="button" className="btn btn-small btn-ghost" aria-pressed={isSaved} onClick={() => app.toggleSaveTrack(track.id)}>
                  {isSaved ? 'Gardée dans mon carnet' : 'Garder cette piste'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="action-row">
        <button type="button" className="btn btn-primary" onClick={() => app.go('notebook')}>
          Ouvrir mon carnet <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => app.go('hub')}>
          Essayer une autre mission
        </button>
      </div>
    </section>
  );
};
