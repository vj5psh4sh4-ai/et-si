// Carte A6 à imprimer : le panneau du visiteur avec son code QR, ou une carte vierge à remplir à la main.
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROGRAMMES } from '../domain/data';
import type { Route } from '../domain/routes';
import { useI18n } from '../i18n';
import { programmeName, schoolCode } from '../i18n/labels';
import { walkTime } from '../ui/helpers';
import { SignpostMark } from './Illustrations';
import { QrCode } from './QrCode';

export interface A6Blade {
  programmeId: string;
  route: Route | null;
  aside?: boolean;
}

export interface A6Content {
  name: string;
  start: string;
  blades: A6Blade[];
  likes: string[];
  questions: string[];
  url: string;
}

const PAGE_STYLE_ID = 'a6-page-style';

/**
 * Impression au format A6 : une règle @page est posée le temps de l'impression, puis retirée,
 * pour ne pas changer le format du carnet (A4).
 */
export function useA6Print() {
  const [kind, setKind] = useState<'panel' | 'blank' | null>(null);

  useEffect(() => {
    if (!kind) return;
    const style = document.createElement('style');
    style.id = PAGE_STYLE_ID;
    style.textContent = '@page { size: 105mm 148mm; margin: 0; }';
    document.head.appendChild(style);
    document.body.classList.add('print-a6');
    const done = () => setKind(null);
    window.addEventListener('afterprint', done);
    // Laisse le temps à la carte (et à son code QR) de s'afficher avant d'ouvrir l'impression.
    const timer = window.setTimeout(() => window.print(), 350);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', done);
      document.body.classList.remove('print-a6');
      style.remove();
    };
  }, [kind]);

  const print = useCallback((k: 'panel' | 'blank') => setKind(k), []);
  return { kind, print };
}

const Lines: React.FC<{ n: number }> = ({ n }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <span key={i} className="a6-line" />
    ))}
  </>
);

export const A6Card: React.FC<{ kind: 'panel' | 'blank' | null; content?: A6Content | null }> = ({ kind, content }) => {
  const { lang, t } = useI18n();
  if (!kind) return null;
  const blank = kind === 'blank' || !content;
  return createPortal(
    <article className={`a6-card${blank ? ' a6-blank' : ''}`} lang={lang}>
      <header className="a6-head">
        <SignpostMark size={26} />
        <div>
          <strong>{t(blank ? 'share.card.blank.title' : 'share.card.title')}</strong>
          {blank ? (
            <span className="a6-field">
              {t('share.card.blank.name')} <span className="a6-line" />
            </span>
          ) : (
            <span>{[content.name, content.start].filter(Boolean).join(' · ')}</span>
          )}
        </div>
      </header>

      <ol className="a6-blades">
        {blank
          ? [0, 1, 2].map((i) => (
              <li key={i} className="a6-blade">
                <span className="a6-field">
                  {t('share.card.blank.blade')} <span className="a6-line" />
                </span>
                <span className="a6-field">
                  {t('share.card.blank.why')} <span className="a6-line" />
                </span>
              </li>
            ))
          : content.blades.map((b) => (
              <li key={b.programmeId} className={`a6-blade${b.aside ? ' a6-aside' : ''}`}>
                <span className="a6-school">
                  {b.aside ? `${t('panel.aside.kicker')} ` : ''}
                  {schoolCode(PROGRAMMES[b.programmeId].school, lang)}
                </span>
                <strong>{programmeName(b.programmeId, lang)}</strong>
                <span className="a6-time">
                  {b.route ? `${walkTime(b.route, lang, t)}${b.route.yearsMax > 0 ? ` ${t('panel.walk')}` : ''}` : t('panel.walk.none')}
                </span>
              </li>
            ))}
      </ol>

      {!blank && content.likes.length > 0 && (
        <p className="a6-likes">
          <span className="a6-kicker">{t('share.card.blank.why')}</span> {content.likes.join(' · ')}
        </p>
      )}

      <div className="a6-bottom">
        <div className="a6-questions">
          <span className="a6-kicker">{t('share.card.blank.questions')}</span>
          {blank ? (
            <Lines n={4} />
          ) : (
            <ul>
              {content.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          )}
        </div>
        {!blank && (
          <div className="a6-qr">
            <QrCode value={content.url} label={t('share.qr.alt')} loading={t('share.qr.loading')} error="" />
          </div>
        )}
      </div>

      <footer className="a6-foot">{t('share.card.footer')}</footer>
    </article>,
    document.body,
  );
};
