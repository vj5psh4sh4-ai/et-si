import React, { useMemo } from 'react';
import { ArrowLeft, BookmarkCheck, BookmarkPlus, Check, ExternalLink, Info } from 'lucide-react';
import type { AppApi, Screen } from '../appApi';
import { RouteTrail, SchoolChip, WalkTime, schoolVars } from '../components/Signpost';
import { M, PROGRAMMES, SOURCES } from '../domain/data';
import { isVisible } from '../domain/policy';
import { alternativesFor, pickRoute, routesFor } from '../domain/routes';
import { careersFor } from '../mapping/engine/pathfinder.mjs';
import type { OccupationLevel } from '../mapping/engine/types';
import { colon, formatDate, formatList, formatYears, useI18n, type Key } from '../i18n';
import { programmeName, schoolName, variantChip, variantVia } from '../i18n/labels';
import { questionsFor, situationLabel } from '../ui/helpers';

const BACK: Record<string, { screen: Screen; key: Key }> = {
  panel: { screen: 'panel', key: 'sheet.backPanel' },
  doors: { screen: 'doors', key: 'sheet.backDoors' },
  cfc: { screen: 'cfc', key: 'app.back' },
  notebook: { screen: 'notebook', key: 'app.back' },
};

const CAREER_GROUPS: { key: Key; levels: OccupationLevel[] }[] = [
  { key: 'sheet.after.jobs', levels: ['metier', 'poste', 'piste'] },
  { key: 'sheet.after.sectors', levels: ['secteur'] },
  { key: 'sheet.after.evolution', levels: ['specialisation', 'evolution', 'master'] },
];

/** Fiche d'une filière : faits, chemins depuis la situation, après le Bachelor, questions et sources. */
export const SheetScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const id = app.sheetId;
  const p = PROGRAMMES[id];
  const { situation, variant, notebook } = app;

  const routes = useMemo(() => routesFor(id, situation, lang), [id, situation, lang]);
  const picked = pickRoute(routes, variant);
  const shown = picked ?? routes.best;
  const alternatives = useMemo(() => (shown ? alternativesFor(id, situation, lang, shown.variant) : []), [id, situation, lang, shown]);
  const careers = useMemo(() => careersFor(M, id), [id]);

  if (!p) return null;
  const back = BACK[app.sheetFrom] ?? BACK.doors;
  const name = programmeName(id, lang);
  const saved = notebook.savedProgrammeIds.includes(id);
  const questions = questionsFor(id, shown, lang, t, 4);
  const questionsAdded = questions.every((q) => notebook.questionsToCheck.includes(q));
  const masters = p.nextProgrammeIds.map((mid) => PROGRAMMES[mid]).filter(Boolean);
  const sourceIds = [...new Set([...p.sourceIds, ...(shown?.admission.sourceIds ?? [])])].filter((sid) => SOURCES[sid]);

  const groups = CAREER_GROUPS.map((g) => ({
    key: g.key,
    items: g.levels.flatMap((lv) => careers[lv] ?? []).filter((o) => isVisible(o.status)),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="page sheet-page" style={schoolVars(id)}>
      <button type="button" className="back-link" onClick={() => app.go(back.screen)}>
        <ArrowLeft size={18} aria-hidden="true" /> {t(back.key)}
      </button>

      <header className="sheet-head">
        <div className="sheet-head-text">
          <p className="eyebrow">{t('sheet.eyebrow')}</p>
          <h1 className="page-title">{name}</h1>
          <p className="sheet-school">
            <SchoolChip programmeId={id} /> <span>{schoolName(p.school, lang)}</span>
          </p>
          <p className="sheet-official" lang="fr">
            {p.title}
          </p>
        </div>
        {!app.isStand && (
          <button type="button" className="btn btn-secondary" aria-pressed={saved} onClick={() => app.toggleSaveProgramme(id)}>
            {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <BookmarkPlus size={18} aria-hidden="true" />}
            {saved ? t('sheet.saved') : t('sheet.save')}
          </button>
        )}
      </header>

      <dl className="facts">
        <div>
          <dt>{t('sheet.facts.duration')}</dt>
          <dd>{formatYears(lang, p.durationYears)}</dd>
        </div>
        <div>
          <dt>{t('sheet.facts.modes')}</dt>
          <dd>{formatList(lang, p.modes.map((m) => t(`sheet.mode.${m}` as Key)))}</dd>
        </div>
        <div>
          <dt>{t('sheet.facts.languages')}</dt>
          <dd>{formatList(lang, p.languages.map((l) => t(`sheet.lang.${l}` as Key)))}</dd>
        </div>
        <div>
          <dt>{t('sheet.facts.location')}</dt>
          <dd>{p.location}</dd>
        </div>
        {p.orientations.length > 0 && (
          <div className="facts-wide">
            <dt>{t('sheet.facts.orientations')}</dt>
            <dd lang="fr">{p.orientations.join(' · ')}</dd>
          </div>
        )}
      </dl>

      {(p.regulated || p.note) && (
        <div className="sheet-notes">
          {p.regulated && (
            <p className="callout">
              <Info size={18} aria-hidden="true" /> <span>{t('sheet.regulated')}</span>
            </p>
          )}
          {p.note && (
            <p className="callout callout-soft">
              <Info size={18} aria-hidden="true" />
              <span>
                <strong>{t('sheet.facts.note')}{colon(lang)}</strong>
                <span lang="fr">{p.note}</span>
              </span>
            </p>
          )}
        </div>
      )}
      {p.validationStatus === 'to_review' && <p className="trail-note trail-review">{t('note.toReview')}</p>}

      <section className="sheet-section" aria-labelledby="paths-title">
        <h2 id="paths-title" className="section-title">
          {t('sheet.paths.title')}
        </h2>
        <p className="page-lead">{t('sheet.paths.lead')}</p>
        <p className="start-line">
          <span>
            {t('doors.from')}{colon(lang)}<strong>{situationLabel(situation, lang, t)}</strong>
          </span>
          <button type="button" className="btn-link" onClick={() => app.openSituation('sheet')}>
            {t('sit.change')}
          </button>
        </p>

        <div className="paths-layout">
          <ul className="variant-compare" aria-label={t(situation.id === 'co' || situation.id === 'non_precise' ? 'panel.etsi.title' : 'panel.etsi.title.other')}>
            {app.variantIds.map((v) => {
              const r = routes.byVariant[v] ?? null;
              const on = shown?.variant === v;
              return (
                <li key={v}>
                  <button type="button" className={`variant-row${on ? ' selected' : ''}${r ? '' : ' variant-none'}`} aria-pressed={on} onClick={() => app.setVariant(v)}>
                    <span className="variant-name">{variantChip(v, lang)}</span>
                    <WalkTime route={r} />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="route-card">
            {shown ? (
              <>
                <h3 className="path-title">
                  {t('panel.path')}
                  <span className="path-via">{t('panel.path.via', { variant: variantVia(shown.variant, lang) })}</span>
                </h3>
                {!picked && variant !== 'auto' && (
                  <p className="trail-note path-noroute" role="status">
                    {t('panel.noRoute', { variant: variantVia(variant, lang), best: variantVia(shown.variant, lang) })}
                  </p>
                )}
                <RouteTrail route={shown} situation={situation} user={app.user} detailed />
                {alternatives.length > 0 && (
                  <details className="alt-routes">
                    <summary>{t('access.alt')}</summary>
                    {alternatives.map((r, i) => (
                      <div key={i} className="alt-route">
                        <p className="alt-time">
                          <WalkTime route={r} />
                        </p>
                        <RouteTrail route={r} situation={situation} user={app.user} detailed />
                      </div>
                    ))}
                  </details>
                )}
              </>
            ) : (
              <p className="muted">{t('doors.none')}</p>
            )}
          </div>
        </div>
      </section>

      {(groups.length > 0 || masters.length > 0) && (
        <section className="sheet-section" aria-labelledby="after-title">
          <h2 id="after-title" className="section-title">
            {t('sheet.after.title')}
          </h2>
          {lang !== 'fr' && <p className="small muted">{t('note.frenchOnly.careers')}</p>}
          <div className="after-grid">
            {groups.map((g) => (
              <div key={g.key} className="after-block">
                <h3 className="h-mini">{t(g.key)}</h3>
                <ul className="after-list" lang="fr">
                  {g.items.map((o) => (
                    <li key={o.id}>
                      {o.label}
                      {o.status === 'to_review' && <span className="review-mark" aria-hidden="true">*</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {masters.length > 0 && (
              <div className="after-block">
                <h3 className="h-mini">{t('sheet.after.masters')}</h3>
                <ul className="after-list" lang="fr">
                  {masters.map((m) => (
                    <li key={m.id}>{m.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {groups.some((g) => g.items.some((o) => o.status === 'to_review')) && (
            <p className="small muted">
              <span aria-hidden="true">* </span>
              {t('note.toReview')}
            </p>
          )}
        </section>
      )}

      <section className="sheet-section sheet-bottom">
        <div className="stand-questions">
          <h2 className="section-title">{t('sheet.questions.title')}</h2>
          <ol className="question-list">
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          {!app.isStand && (
            <button type="button" className="btn btn-ghost btn-small" disabled={questionsAdded} onClick={() => app.addQuestions(questions)}>
              {questionsAdded ? (
                <>
                  <Check size={16} strokeWidth={3} aria-hidden="true" /> {t('panel.questions.added')}
                </>
              ) : (
                t('panel.questions.add')
              )}
            </button>
          )}
        </div>

        <div className="sources">
          <h2 className="section-title">{t('sheet.sources.title')}</h2>
          <ul className="source-list">
            {sourceIds.map((sid) => {
              const s = SOURCES[sid];
              return (
                <li key={sid}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" lang="fr">
                    {s.title} <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <span className="small muted">{t('sheet.sources.consulted', { date: formatDate(lang, s.consultedAt) })}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <p className="disclaimer-text">{t('note.notAdmission')}</p>
    </section>
  );
};
