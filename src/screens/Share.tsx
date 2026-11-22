import React, { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Printer } from 'lucide-react';
import type { AppApi } from '../appApi';
import { A6Card, useA6Print, type A6Content } from '../components/A6Card';
import { QrCode } from '../components/QrCode';
import { PUBLIC_URL } from '../domain/policy';
import { compareRoutes, pickRoute, routesFor } from '../domain/routes';
import { encodeShare, shareUrl } from '../domain/share';
import { useI18n } from '../i18n';
import { cardShort } from '../i18n/labels';
import { questionsFor, situationLabel } from '../ui/helpers';

/** Emporter son panneau : code QR, lien, ou carte A6. Le lien contient les réponses, pas un identifiant. */
export const ShareScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, t } = useI18n();
  const { notebook, panel, situation, variant } = app;
  const nickname = notebook.profile.nickname.trim();
  const [includeName, setIncludeName] = useState(true);
  const [status, setStatus] = useState('');
  const a6 = useA6Print();

  const url = useMemo(() => {
    const base = PUBLIC_URL ?? window.location.origin + window.location.pathname;
    return shareUrl(base, encodeShare(notebook, lang, includeName));
  }, [notebook, lang, includeName]);

  const content = useMemo<A6Content | null>(() => {
    if (panel.status !== 'ready') return null;
    const blade = (programmeId: string, aside = false) => ({
      programmeId,
      route: pickRoute(routesFor(programmeId, situation, lang), variant),
      aside,
    });
    const blades = panel.trio
      .map((r) => blade(r.programmeId))
      .sort((a, b) => (a.route && b.route ? compareRoutes(a.route, b.route) : a.route ? -1 : b.route ? 1 : 0));
    if (panel.aside) blades.push(blade(panel.aside.programmeId, true));
    const likes: string[] = [];
    for (const r of panel.trio) {
      for (const reason of r.reasons) {
        if (reason.kind !== 'card') continue;
        const label = cardShort(reason.id, lang);
        if (!likes.includes(label)) likes.push(label);
      }
    }
    const first = blades[0];
    return {
      name: includeName ? nickname : '',
      start: situationLabel(situation, lang, t),
      blades,
      likes: likes.slice(0, 4),
      questions: questionsFor(first.programmeId, first.route, lang, t, 3),
      url,
    };
  }, [panel, situation, lang, variant, includeName, nickname, t, url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus(t('share.copied'));
    } catch {
      setStatus(t('share.copy.error'));
    }
    window.setTimeout(() => setStatus(''), 4000);
  };

  return (
    <section className="page share-page">
      <button type="button" className="back-link" onClick={() => app.go('panel')}>
        <ArrowLeft size={18} aria-hidden="true" /> {t('sheet.backPanel')}
      </button>
      <header className="page-head">
        <p className="eyebrow">{t('share.eyebrow')}</p>
        <h1 className="page-title">{t('share.title')}</h1>
        {content && <p className="page-lead">{t('share.lead')}</p>}
      </header>

      {!content ? (
        <div className="panel empty-panel">
          <p>{t('share.empty')}</p>
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={app.startExpress}>
              {t('panel.empty.cards')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => a6.print('blank')}>
              <Printer size={18} aria-hidden="true" /> {t('share.print.blank')}
            </button>
          </div>
        </div>
      ) : (
        <div className="share-layout">
          <div className="qr-frame">
            <QrCode value={url} label={t('share.qr.alt')} loading={t('share.qr.loading')} error={t('share.qr.error')} />
          </div>
          <div className="share-side">
            <label className="share-link">
              <span className="h-mini">{t('share.link')}</span>
              <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
            </label>
            {nickname && (
              <label className="check-row">
                <input type="checkbox" checked={includeName} onChange={(e) => setIncludeName(e.target.checked)} />
                <span>{t('share.name')}</span>
              </label>
            )}
            <div className="action-row">
              <button type="button" className="btn btn-primary" onClick={copy}>
                <Copy size={18} aria-hidden="true" /> {t('share.copy')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => a6.print('panel')}>
                <Printer size={18} aria-hidden="true" /> {t('share.print')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => a6.print('blank')}>
                {t('share.print.blank')}
              </button>
            </div>
            <p className="status-msg" role="status">
              {status}
            </p>
            <p className="disclaimer-text">{t('share.privacy')}</p>
          </div>
        </div>
      )}

      <A6Card kind={a6.kind} content={content} />
    </section>
  );
};
