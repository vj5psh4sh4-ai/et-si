import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Signpost } from 'lucide-react';
import type { AppApi } from '../appApi';
import { EXPRESS_LENGTH, expressSequence, remainingItems, remainingQualityItems } from '../domain/profile';
import { useI18n, type Key } from '../i18n';
import { cardText, qualityText } from '../i18n/labels';
import type { CardChoice } from '../types';

const CHOICES: CardChoice[] = [0, 1, 2];
const LABELS: Record<'cards' | 'forces', Key[]> = {
  cards: ['cards.no', 'cards.maybe', 'cards.yes'],
  forces: ['cards.forces.no', 'cards.forces.maybe', 'cards.forces.yes'],
};
/** « Arrêter ici » apparaît à partir de la neuvième carte du parcours express. */
const STOP_FROM = 8;

export const CardsScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const mode = app.cardsMode;
  const quality = mode === 'forces';
  const nb = app.notebook;
  const answers = quality ? nb.qualityAnswers : nb.answers;

  // « Autres cartes » et « Mes forces » : la liste est figée à l'ouverture. Le parcours express se recalcule.
  const [fixed] = useState<string[] | null>(() =>
    mode === 'more' ? remainingItems(nb.answers) : mode === 'forces' ? remainingQualityItems(nb.qualityAnswers) : null,
  );
  const seq = fixed ?? expressSequence(nb.answers);
  const [index, setIndex] = useState(() => {
    if (fixed) return 0;
    const first = seq.findIndex((id) => nb.answers[id] === undefined);
    return first < 0 ? seq.length : first;
  });

  const finished = seq.length > 0 && index >= seq.length;
  const go = app.go;
  useEffect(() => {
    if (finished) go('panel');
  }, [finished, go]);

  const id = seq[index];
  const total = fixed ? seq.length : Math.max(EXPRESS_LENGTH, seq.length);
  const bonus = !fixed && seq.length > EXPRESS_LENGTH && index >= EXPRESS_LENGTH;

  const answer = (choice: CardChoice) => {
    if (!id) return;
    app.answerCard(id, choice, quality);
    setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  // Clavier : 1, 2, 3 pour répondre, flèche gauche pour revenir.
  const handler = useRef<(e: KeyboardEvent) => void>(() => undefined);
  handler.current = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement | null;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      e.preventDefault();
      answer((Number(e.key) - 1) as CardChoice);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      back();
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handler.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!id) {
    return (
      <section className="page cards-page">
        <div className="card-done">
          <h1 className="page-title">{t('cards.done.title')}</h1>
          <p className="page-lead">{t('cards.done.text')}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => app.go('panel')}>
            <Signpost size={20} aria-hidden="true" /> {t('cards.toPanel')}
          </button>
        </div>
      </section>
    );
  }

  const text = quality ? qualityText(id, lang) : cardText(id, lang);
  const labels = LABELS[quality ? 'forces' : 'cards'];
  const current = answers[id];
  const canStop = fixed ? true : index >= STOP_FROM;

  return (
    <section className="page cards-page">
      <div className="cards-top">
        <button type="button" className="back-link" onClick={index > 0 ? back : () => app.go(fixed ? 'panel' : 'home')}>
          <ArrowLeft size={18} aria-hidden="true" /> {index > 0 ? t('cards.previous') : t('app.back')}
        </button>
        <p className="eyebrow">{t(`cards.eyebrow.${mode}` as Key)}</p>
      </div>

      <div className="cards-progress">
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>

      <div className="card-stage" aria-live="polite" aria-atomic="true">
        <article key={id} className="q-card">
          <p className="q-count">{t('cards.progress', { n: index + 1, total })}</p>
          <p className="q-prompt">{t(quality ? 'cards.prompt.forces' : 'cards.prompt')}</p>
          <h1 className="q-text">{text}</h1>
        </article>
      </div>

      <div className="answer-row" role="group" aria-label={t(quality ? 'cards.prompt.forces' : 'cards.prompt')}>
        {CHOICES.map((c) => (
          <button
            key={c}
            type="button"
            className={`answer-btn answer-${c}${current === c ? ' selected' : ''}`}
            aria-pressed={current === c}
            onClick={() => answer(c)}
          >
            <span className="answer-key" aria-hidden="true">
              {c + 1}
            </span>
            {t(labels[c])}
          </button>
        ))}
      </div>

      <p className="cards-keys">{t('cards.keys')}</p>
      {bonus && (
        <p className="hint-line" role="status">
          {t('cards.bonus')}
        </p>
      )}

      {canStop && (
        <div className="action-row center">
          <button type="button" className="btn btn-ghost" onClick={() => app.go('panel')}>
            {t('cards.stop')} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
      {!quality && <p className="disclaimer-text cards-note">{t('note.demo')}</p>}
    </section>
  );
};
