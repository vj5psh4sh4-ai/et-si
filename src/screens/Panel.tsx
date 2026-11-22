import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookmarkCheck, BookmarkPlus, Check, DoorOpen, Layers, Map, MapPin, QrCode as QrIcon, RotateCcw, Sparkles } from 'lucide-react';
import type { AppApi } from '../appApi';
import { ConfirmButton } from '../components/Chrome';
import { Blade, RouteTrail, SchoolChip, VariantChips, schoolVars } from '../components/Signpost';
import { MISSIONS } from '../data/missions';
import { isSchoolStart, entryYears } from '../domain/situation';
import { remainingItems, remainingQualityItems, type Ranked } from '../domain/profile';
import { compareRoutes, pickRoute, routesFor, type ProgrammeRoutes, type Route, type VariantChoice } from '../domain/routes';
import { colon, useI18n } from '../i18n';
import { cardShort, programmeName, variantVia } from '../i18n/labels';
import { questionsFor, situationLabel } from '../ui/helpers';

interface BladeData {
  ranked: Ranked;
  routes: ProgrammeRoutes;
  /** Chemin par la voie choisie ; null si cette voie ne mène pas à la filière. */
  route: Route | null;
}

const ACTIVITY_LABELS: Record<string, string> = Object.fromEntries(
  MISSIONS.flatMap((m) => m.scene.choices.map((c) => [c.id, c.activityLabel])),
);

export const PanelScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const { panel, situation, variant, notebook } = app;
  const detailRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [etsiMsg, setEtsiMsg] = useState('');

  // Les lames sont rangées par temps de marche pour la voie choisie, jamais par note.
  const blades = useMemo<BladeData[]>(() => {
    const list = panel.trio.map((ranked) => {
      const routes = routesFor(ranked.programmeId, situation, lang);
      return { ranked, routes, route: pickRoute(routes, variant) };
    });
    return list.sort((a, b) => (a.route && b.route ? compareRoutes(a.route, b.route) : a.route ? -1 : b.route ? 1 : 0));
  }, [panel.trio, situation, lang, variant]);

  const aside = useMemo<BladeData | null>(() => {
    if (!panel.aside) return null;
    const routes = routesFor(panel.aside.programmeId, situation, lang);
    return { ranked: panel.aside, routes, route: pickRoute(routes, variant) };
  }, [panel.aside, situation, lang, variant]);

  const all = aside ? [...blades, aside] : blades;
  const selected = all.find((b) => b.ranked.programmeId === selectedId) ?? blades[0] ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    // Sur un petit écran, le détail est sous le panneau : on l'amène à l'écran.
    if (window.matchMedia('(max-width: 820px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
    }
  };

  const changeVariant = (v: VariantChoice) => {
    app.setVariant(v);
    setEtsiMsg(t('panel.etsi.changed', { variant: variantVia(v, lang) }));
  };
  useEffect(() => {
    if (!etsiMsg) return;
    const timer = setTimeout(() => setEtsiMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [etsiMsg]);

  const name = notebook.profile.nickname.trim();
  const more = remainingItems(notebook.answers).length;
  const forces = remainingQualityItems(notebook.qualityAnswers).length;

  const header = (
    <header className="page-head panel-head">
      <p className="eyebrow">{t('panel.eyebrow')}</p>
      <h1 className="page-title">{name ? t('panel.title.named', { name }) : t('panel.title')}</h1>
      <p className="start-line">
        <MapPin size={16} aria-hidden="true" />
        <span>
          {t('doors.from')}{colon(lang)}<strong>{situationLabel(situation, lang, t)}</strong>
        </span>
        <button type="button" className="btn-link" onClick={() => app.openSituation('panel')}>
          {t('sit.change')}
        </button>
      </p>
    </header>
  );

  if (panel.status === 'empty' || !selected) {
    return (
      <section className="page panel-page">
        {header}
        <div className="panel empty-panel">
          <h2 className="section-title">{t('panel.empty.title')}</h2>
          <p>{panel.answered > 0 ? t('panel.empty.partial') : t('panel.empty.text')}</p>
          <div className="action-row">
            {app.cardsEnabled &&
              (panel.answered > 0 && more > 0 ? (
                <button type="button" className="btn btn-primary" onClick={() => app.startCards('more')}>
                  <Layers size={18} aria-hidden="true" /> {t('panel.empty.more')}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={app.startExpress}>
                  <Layers size={18} aria-hidden="true" /> {t('panel.empty.cards')}
                </button>
              ))}
            <button type="button" className="btn btn-secondary" onClick={() => app.go('doors')}>
              <DoorOpen size={18} aria-hidden="true" /> {t('panel.doors')}
            </button>
            {!app.isStand && (
              <button type="button" className="btn btn-ghost" onClick={app.openMissions}>
                <Map size={18} aria-hidden="true" /> {t('panel.mission')}
              </button>
            )}
          </div>
        </div>
        <p className="disclaimer-text">{t('note.notAdmission')}</p>
        {app.isStaff && <StaffTable app={app} />}
      </section>
    );
  }

  const sid = selected.ranked.programmeId;
  const shown = selected.route ?? selected.routes.best;
  const cardReasons = selected.ranked.reasons.filter((r) => r.kind === 'card').slice(0, 4);
  const missionReasons = selected.ranked.reasons.filter((r) => r.kind === 'mission').slice(0, 3);
  const years = shown ? entryYears(situation, shown.yearsMin, shown.yearsMax) : null;
  const questions = questionsFor(sid, shown, lang, t);
  const questionsAdded = questions.every((q) => notebook.questionsToCheck.includes(q));
  const saved = notebook.savedProgrammeIds.includes(sid);

  return (
    <section className="page panel-page">
      {header}
      <p className="page-lead panel-lead">{t('panel.lead')}</p>

      <div className="panel-layout">
        <div className="signpost-col">
          <div className="signpost" role="group" aria-label={t('panel.blades')}>
            <span className="signpost-pole" aria-hidden="true" />
            <span className="signpost-cap" aria-hidden="true" />
            {blades.map((b, i) => (
              <Blade
                key={b.ranked.programmeId}
                programmeId={b.ranked.programmeId}
                route={b.route}
                index={i}
                selected={b.ranked.programmeId === sid}
                onSelect={() => select(b.ranked.programmeId)}
              />
            ))}
            {aside && (
              <Blade
                programmeId={aside.ranked.programmeId}
                route={aside.route}
                index={blades.length}
                aside
                selected={aside.ranked.programmeId === sid}
                onSelect={() => select(aside.ranked.programmeId)}
              />
            )}
            <span className="signpost-ground" aria-hidden="true" />
          </div>
          {panel.trio.length > 3 && <p className="small muted">{t('panel.ties')}</p>}

          <VariantChips
            variantIds={app.variantIds}
            value={variant}
            onChange={changeVariant}
            title={t(isSchoolStart(situation) ? 'panel.etsi.title' : 'panel.etsi.title.other')}
          />
          <p className="sr-only" role="status">
            {etsiMsg}
          </p>
        </div>

        <div className="blade-detail" ref={detailRef} style={schoolVars(sid)}>
          <div className="detail-head">
            <SchoolChip programmeId={sid} />
            <h2 className="detail-title">{programmeName(sid, lang)}</h2>
          </div>

          {cardReasons.length > 0 && (
            <div className="reasons">
              <span className="h-mini">{t('panel.because')}</span>
              <ul className="reason-chips">
                {cardReasons.map((r) => (
                  <li key={r.id}>
                    <Check size={14} strokeWidth={3} aria-hidden="true" /> {cardShort(r.id, lang)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {missionReasons.length > 0 && (
            <div className="reasons">
              <span className="h-mini">{t('panel.because.mission')}</span>
              <ul className="reason-chips" lang="fr">
                {missionReasons.map((r) => (
                  <li key={r.id}>
                    <Check size={14} strokeWidth={3} aria-hidden="true" /> {ACTIVITY_LABELS[r.id] ?? r.id}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {shown && (
            <div className="path-block">
              <h3 className="path-title">
                {t('panel.path')}
                <span className="path-via">{t('panel.path.via', { variant: variantVia(shown.variant, lang) })}</span>
              </h3>
              {!selected.route && variant !== 'auto' && (
                <p className="trail-note path-noroute">
                  {t('panel.noRoute', { variant: variantVia(variant, lang), best: variantVia(shown.variant, lang) })}
                </p>
              )}
              <RouteTrail route={shown} situation={situation} user={app.user} />
              {years ? (
                <p className="entry-date">
                  {years[0] === years[1] ? t('panel.date', { year: years[0] }) : t('panel.date.range', { a: years[0], b: years[1] })}
                </p>
              ) : (
                isSchoolStart(situation) && (
                  <p className="entry-date entry-date-ask">
                    {t('panel.date.ask')}{' '}
                    <button type="button" className="btn-link" onClick={() => app.openSituation('panel')}>
                      {t('sit.change')}
                    </button>
                  </p>
                )
              )}
            </div>
          )}

          <div className="action-row detail-actions">
            <button type="button" className="btn btn-primary" onClick={() => app.openSheet(sid, 'panel')}>
              {t('panel.sheet')} <ArrowRight size={18} aria-hidden="true" />
            </button>
            {!app.isStand && (
              <button type="button" className="btn btn-ghost" aria-pressed={saved} onClick={() => app.toggleSaveProgramme(sid)}>
                {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <BookmarkPlus size={18} aria-hidden="true" />}
                {saved ? t('panel.saved') : t('panel.save')}
              </button>
            )}
          </div>

          <div className="stand-questions">
            <h3 className="path-title">{t('panel.questions.title')}</h3>
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
        </div>
      </div>

      <section className="next-steps" aria-labelledby="next-title">
        <h2 id="next-title" className="section-title">
          {t('panel.actions.title')}
        </h2>
        <div className="next-grid">
          <button type="button" className="next-card next-card-main" onClick={() => app.go('share')}>
            <QrIcon size={24} aria-hidden="true" />
            <strong>{t('panel.take')}</strong>
            <span>{t('panel.take.text')}</span>
          </button>
          {app.cardsEnabled && more > 0 && (
            <button type="button" className="next-card" onClick={() => app.startCards('more')}>
              <Layers size={24} aria-hidden="true" />
              <strong>{t('panel.refine', { n: more })}</strong>
              <span>{t('panel.refine.text')}</span>
            </button>
          )}
          {app.cardsEnabled && forces > 0 && (
            <button type="button" className="next-card" onClick={() => app.startCards('forces')}>
              <Sparkles size={24} aria-hidden="true" />
              <strong>{t('panel.forces')}</strong>
              <span>{t('panel.forces.text', { n: forces })}</span>
            </button>
          )}
          <button type="button" className="next-card" onClick={() => app.go('doors')}>
            <DoorOpen size={24} aria-hidden="true" />
            <strong>{t('panel.doors')}</strong>
            <span>{t('panel.doors.text')}</span>
          </button>
          {!app.isStand && (
            <button type="button" className="next-card" onClick={app.openMissions}>
              <Map size={24} aria-hidden="true" />
              <strong>{t('panel.mission')}</strong>
              <span>{t('panel.mission.text')}</span>
            </button>
          )}
        </div>
        {app.cardsEnabled && !app.isDemo && (
          <div className="action-row">
            <ConfirmButton
              label={
                <>
                  <RotateCcw size={16} aria-hidden="true" /> {t('panel.restart')}
                </>
              }
              className="btn btn-ghost btn-small"
              warning={t('panel.restart.warning')}
              confirmLabel={t('panel.restart.confirm')}
              onConfirm={app.restartCards}
            />
          </div>
        )}
      </section>

      <ul className="panel-notes">
        <li>{t('note.noScore')}</li>
        {app.cardsEnabled && <li>{t('note.demo')}</li>}
        <li>{t('note.notAdmission')}</li>
      </ul>

      {app.isStaff && <StaffTable app={app} />}
    </section>
  );
};

/** Chiffres de travail, visibles seulement avec ?animateur=1. Jamais affichés aux visiteurs. */
const StaffTable: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const shown = new Set(app.panel.trio.map((r) => r.programmeId));
  const asideId = app.panel.aside?.programmeId;
  const num = (n: number, digits: number) => n.toFixed(digits).replace('.', lang === 'en' ? '.' : ',');
  return (
    <section className="staff-box" aria-labelledby="staff-title">
      <h2 id="staff-title" className="section-title">
        {t('panel.staff.title')}
      </h2>
      <p className="small muted">{t('panel.staff.note')}</p>
      <div className="table-scroll">
        <table className="staff-table">
          <thead>
            <tr>
              <th scope="col">{t('panel.staff.programme')}</th>
              <th scope="col">{t('panel.staff.score')}</th>
              <th scope="col">{t('panel.staff.coverage')}</th>
              <th scope="col">{t('panel.staff.reasons')}</th>
              <th scope="col">{t('panel.staff.shown')}</th>
            </tr>
          </thead>
          <tbody>
            {app.panel.all.map((r) => (
              <tr key={r.programmeId}>
                <th scope="row">{programmeName(r.programmeId, lang)}</th>
                <td>{num(r.score, 1)}</td>
                <td>{num(r.coverage, 2)}</td>
                <td>{r.reasons.map((x) => x.id).join(', ')}</td>
                <td>{shown.has(r.programmeId) ? '●' : r.programmeId === asideId ? '○' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
