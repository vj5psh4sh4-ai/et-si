import React, { useMemo, useState } from 'react';
import { ArrowRight, Copy, Pencil, Printer, Signpost, Trash2, X } from 'lucide-react';
import type { AppApi } from '../appApi';
import { AvatarIcon } from '../components/Avatars';
import { ConfirmButton } from '../components/Chrome';
import { SchoolChip, WalkTime, schoolVars } from '../components/Signpost';
import { FEEDBACK_SHORT } from '../data/ui';
import { cfcByKey } from '../domain/cfc';
import { PROGRAMMES } from '../domain/data';
import { ITEM_IDS } from '../domain/profile';
import { compareRoutes, pickRoute, routesFor, type Route } from '../domain/routes';
import { colon, translate, useI18n, type Key } from '../i18n';
import { LANGS } from '../i18n/lang';
import { cardShort, programmeName, schoolCode } from '../i18n/labels';
import { situationLabel, walkTime } from '../ui/helpers';

const NEXT_KEYS: Key[] = ['nb.next.1', 'nb.next.2', 'nb.next.3', 'nb.next.4'];

interface Line {
  programmeId: string;
  route: Route | null;
  aside: boolean;
}

/** Carnet : il garde des réponses et des choix. Le panneau est recalculé à chaque ouverture. */
export const NotebookScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const { notebook, panel, situation, variant } = app;
  const { profile, feedbacks, questionsToCheck, nextAction } = notebook;
  const [newQuestion, setNewQuestion] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const lines = useMemo<Line[]>(() => {
    const line = (programmeId: string, aside = false): Line => ({
      programmeId,
      route: pickRoute(routesFor(programmeId, situation, lang), variant),
      aside,
    });
    const trio = panel.trio
      .map((r) => line(r.programmeId))
      .sort((a, b) => (a.route && b.route ? compareRoutes(a.route, b.route) : a.route ? -1 : b.route ? 1 : 0));
    return panel.aside ? [...trio, line(panel.aside.programmeId, true)] : trio;
  }, [panel, situation, lang, variant]);

  const likedCards = ITEM_IDS.filter((id) => notebook.answers[id] === 2);
  const likedMissions = feedbacks.filter((f) => f.feedback === 'refaire' || f.feedback === 'en_vrai');
  const answered = Object.keys(notebook.answers).length;
  const saved = notebook.savedProgrammeIds.filter((id) => PROGRAMMES[id]);
  const savedCfc = notebook.savedCfc.map((k) => cfcByKey(k)).filter((e) => !!e);

  // La prochaine action est enregistrée en toutes lettres : on la reconnaît dans les trois langues.
  const plain = (s: string) => s.replace(/\u00a0/g, ' ');
  const nextIndex = NEXT_KEYS.findIndex((k) => LANGS.some((l) => plain(translate(l, k)) === plain(nextAction)));
  const nextLabel = nextIndex >= 0 ? t(NEXT_KEYS[nextIndex]) : nextAction || t('nb.next.none');

  const time = (r: Route | null) => (r ? `${walkTime(r, lang, t)}${r.yearsMax > 0 ? ` ${t('panel.walk')}` : ''}` : t('panel.walk.none'));
  const label = (id: string) => `${programmeName(id, lang)} (${schoolCode(PROGRAMMES[id].school, lang)})`;

  const buildSummary = () => {
    const block = (title: string, items: string[]) => (items.length ? ['', `${title}${colon(lang).trimEnd()}`, ...items.map((i) => `- ${i}`)] : []);
    return [
      t('nb.summary.title'),
      `${t('nb.summary.name')}${colon(lang)}${profile.nickname.trim() || t('nb.summary.anonymous')}`,
      `${t('nb.summary.start')}${colon(lang)}${situationLabel(situation, lang, t)}`,
      ...block(t('nb.panel.title'), lines.map((l) => `${l.aside ? `${t('panel.aside.kicker')} ` : ''}${label(l.programmeId)}, ${time(l.route)}`)),
      ...block(t('nb.saved.title'), saved.map(label)),
      ...block(t('nb.cfc.title'), savedCfc.map((e) => e.label)),
      ...block(t('nb.liked.title'), [...likedCards.map((id) => cardShort(id, lang)), ...likedMissions.map((f) => f.activityLabel)]),
      ...block(t('nb.questions.title'), questionsToCheck),
      '',
      `${t('nb.next.title')}${colon(lang)}${nextLabel}`,
      '',
      t('nb.summary.disclaimer'),
    ].join('\n');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopyStatus(t('nb.copied'));
    } catch {
      setCopyStatus(t('nb.copy.error'));
    }
    window.setTimeout(() => setCopyStatus(''), 4000);
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const q = newQuestion.trim();
    if (!q) return;
    app.addQuestions([q]);
    setNewQuestion('');
  };

  const removeQuestion = (idx: number) =>
    app.updateNotebook((prev) => ({ ...prev, questionsToCheck: prev.questionsToCheck.filter((_, i) => i !== idx) }));

  return (
    <section className="page notebook">
      <header className="nb-head" style={{ ['--player' as string]: profile.color }}>
        <AvatarIcon avatarId={profile.avatarId} color={profile.color} size={72} />
        <div className="nb-head-text">
          <p className="eyebrow">{t('nb.eyebrow')}</p>
          <h1 className="page-title">{profile.nickname || t('nb.title.default')}</h1>
          <p className="nb-meta">
            <span>{situationLabel(situation, lang, t)}</span>
            <span>{t('nb.answers.count', { n: answered, total: ITEM_IDS.length })}</span>
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-small no-print" onClick={() => app.openSituation('notebook')}>
          <Pencil size={16} aria-hidden="true" /> {t('nb.edit')}
        </button>
      </header>

      {profile.ideaText && (
        <div className="idea-callout" lang="fr">
          <span className="idea-label">Mon idée (texte saisi)</span>
          <p>« {profile.ideaText} »</p>
        </div>
      )}

      <div className="nb-grid">
        <div className="nb-col">
          <section className="nb-section">
            <h2>{t('nb.panel.title')}</h2>
            {lines.length === 0 ? (
              <>
                <p className="muted">{t('nb.panel.empty')}</p>
                {app.cardsEnabled && (
                  <button type="button" className="btn btn-primary btn-small no-print" onClick={app.startExpress}>
                    {t('panel.empty.cards')}
                  </button>
                )}
              </>
            ) : (
              <>
                <ul className="nb-list nb-blades">
                  {lines.map((l) => (
                    <li key={l.programmeId} className="nb-track" style={schoolVars(l.programmeId)}>
                      <button type="button" className="nb-open" onClick={() => app.openSheet(l.programmeId, 'notebook')}>
                        <span className="nb-open-text">
                          <strong>{programmeName(l.programmeId, lang)}</strong>
                          <span className="muted small">
                            {l.aside ? `${t('panel.aside.kicker')} ${t('panel.aside.note')} · ` : ''}
                            {schoolCode(PROGRAMMES[l.programmeId].school, lang)}
                          </span>
                        </span>
                        <WalkTime route={l.route} />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="small muted">{t('nb.panel.recomputed')}</p>
                <button type="button" className="btn btn-secondary btn-small no-print" onClick={() => app.go('panel')}>
                  <Signpost size={16} aria-hidden="true" /> {t('nb.panel.open')}
                </button>
              </>
            )}
          </section>

          <section className="nb-section">
            <h2>
              {t('nb.saved.title')} <span className="count">{saved.length}</span>
            </h2>
            {saved.length === 0 ? (
              <p className="muted">{t('nb.saved.empty')}</p>
            ) : (
              <ul className="nb-list">
                {saved.map((id) => (
                  <li key={id} className="nb-track" style={schoolVars(id)}>
                    <button type="button" className="nb-open" onClick={() => app.openSheet(id, 'notebook')}>
                      <span className="nb-open-text">
                        <strong>{programmeName(id, lang)}</strong>
                      </span>
                      <SchoolChip programmeId={id} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn no-print"
                      aria-label={`${t('sheet.unsave')}${colon(lang)}${programmeName(id, lang)}`}
                      onClick={() => app.toggleSaveProgramme(id)}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {savedCfc.length > 0 && (
            <section className="nb-section">
              <h2>
                {t('nb.cfc.title')} <span className="count">{savedCfc.length}</span>
              </h2>
              <ul className="nb-list" lang="fr">
                {savedCfc.map((e) => (
                  <li key={e.key}>
                    <button
                      type="button"
                      className="nb-open"
                      onClick={() => {
                        app.setCfcKey(e.key);
                        app.go('cfc');
                      }}
                    >
                      <span className="nb-open-text">
                        <strong>{e.label}</strong>
                      </span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="icon-btn no-print" aria-label={`${t('sheet.unsave')}${colon(lang)}${e.label}`} onClick={() => app.toggleSaveCfc(e.key)}>
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="nb-col">
          <section className="nb-section">
            <h2>{t('nb.liked.title')}</h2>
            {likedCards.length === 0 && likedMissions.length === 0 ? (
              <p className="muted">{t('nb.liked.empty')}</p>
            ) : (
              <>
                {likedCards.length > 0 && (
                  <>
                    <span className="h-mini">{t('nb.liked.cards')}</span>
                    <ul className="like-chips">
                      {likedCards.map((id) => (
                        <li key={id}>{cardShort(id, lang)}</li>
                      ))}
                    </ul>
                  </>
                )}
                {likedMissions.length > 0 && (
                  <>
                    <span className="h-mini">{t('nb.liked.missions')}</span>
                    <ul className="like-chips" lang="fr">
                      {likedMissions.map((f) => (
                        <li key={`${f.missionId}-${f.choiceId}`}>{f.activityLabel}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </section>

          {feedbacks.length > 0 && (
            <section className="nb-section">
              <h2>
                {t('nb.tried.title')} <span className="count">{feedbacks.length}</span>
              </h2>
              <ul className="nb-list" lang="fr">
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
            </section>
          )}

          <section className="nb-section">
            <h2>{t('nb.questions.title')}</h2>
            <ul className="nb-list q-list">
              {questionsToCheck.map((q, i) => (
                <li key={`${i}-${q}`}>
                  <span>{q}</span>
                  <button type="button" className="icon-btn no-print" aria-label={`${t('nb.questions.remove')}${colon(lang)}${q}`} onClick={() => removeQuestion(i)}>
                    <X size={16} aria-hidden="true" />
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
                placeholder={t('nb.questions.placeholder')}
                aria-label={t('nb.questions.add')}
              />
              <button type="submit" className="btn btn-secondary">
                {t('nb.questions.add')}
              </button>
            </form>
          </section>

          <section className="nb-section">
            <h2>{t('nb.next.title')}</h2>
            <div className="action-options no-print" role="group" aria-label={t('nb.next.title')}>
              {NEXT_KEYS.map((k, i) => {
                const on = nextIndex === i;
                return (
                  <button
                    key={k}
                    type="button"
                    className={`choice-btn ${on ? 'selected' : ''}`}
                    aria-pressed={on}
                    onClick={() => app.updateNotebook((prev) => ({ ...prev, nextAction: on ? '' : t(k) }))}
                  >
                    <span className="radio-dot" aria-hidden="true" />
                    {t(k)}
                  </button>
                );
              })}
            </div>
            <p className="print-only">{nextLabel}</p>
          </section>
        </div>
      </div>

      <div className="nb-actions no-print">
        <div className="action-row">
          <button type="button" className="btn btn-primary" onClick={copy}>
            <Copy size={18} aria-hidden="true" /> {t('nb.copy')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> {t('nb.print')}
          </button>
          {panel.status === 'ready' && (
            <button type="button" className="btn btn-ghost" onClick={() => app.go('share')}>
              {t('panel.take')}
            </button>
          )}
        </div>
        {!app.isDemo && (
          <div className="action-row">
            <ConfirmButton label={t('nb.restart')} warning={t('nb.restart.warning')} confirmLabel={t('nb.restart.confirm')} onConfirm={app.restartExploration} />
            <ConfirmButton
              label={
                <>
                  <Trash2 size={16} aria-hidden="true" /> {t('nb.delete')}
                </>
              }
              className="btn btn-ghost btn-danger-text"
              warning={t('nb.delete.warning')}
              confirmLabel={t('nb.delete.confirm')}
              onConfirm={app.deleteLocalData}
            />
          </div>
        )}
        <p className="status-msg" role="status">
          {copyStatus}
        </p>
        <p className="disclaimer-text">{t('nb.summary.disclaimer')}</p>
      </div>
    </section>
  );
};
