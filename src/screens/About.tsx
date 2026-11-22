import React from 'react';
import { Printer } from 'lucide-react';
import type { AppApi } from '../appApi';
import { A6Card, useA6Print } from '../components/A6Card';
import { CFC_INDEX } from '../domain/cfc';
import { M, MAPPING_DATE, MAPPING_VERSION } from '../domain/data';
import { formatDate, useI18n } from '../i18n';

export const AboutScreen: React.FC<{ app: AppApi; version: string }> = ({ app, version }) => {
  const { lang, t } = useI18n();
  const a6 = useA6Print();
  const total = M.admissionRules.length;
  const validated = M.admissionRules.filter((r) => r.validationStatus === 'validated').length;
  return (
    <section className="page about">
      <header className="page-head">
        <p className="eyebrow">{t('about.eyebrow')}</p>
        <h1 className="page-title">{t('about.title')}</h1>
        <p className="page-lead">{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
      </header>

      <div className="about-grid">
        <section className="panel">
          <h2>{t('about.privacy.title')}</h2>
          <p>{t('about.privacy.text')}</p>
        </section>
        <section className="panel">
          <h2>{t('about.data.title')}</h2>
          <ul>
            <li>{t('about.data.text', { version: MAPPING_VERSION, date: formatDate(lang, MAPPING_DATE) })}</li>
            <li>{t('about.data.rules', { validated, total })}</li>
            {app.cardsEnabled && <li>{t('about.data.cards')}</li>}
            <li>{t('about.data.cfc', { n: CFC_INDEX.length })}</li>
            <li>{t('about.data.sources', { n: M.sources.length })}</li>
          </ul>
        </section>
        <section className="panel">
          <h2>{t('about.lang.title')}</h2>
          <p>{t('about.lang.text')}</p>
        </section>
        <section className="panel">
          <h2>{t('about.card.title')}</h2>
          <p>{t('about.card.text')}</p>
          <button type="button" className="btn btn-secondary" onClick={() => a6.print('blank')}>
            <Printer size={18} aria-hidden="true" /> {t('share.print.blank')}
          </button>
        </section>
      </div>

      <p className="small muted about-version">{t('about.version', { version })}</p>
      <div className="action-row">
        <button type="button" className="btn btn-primary" onClick={() => app.go('home')}>
          {t('app.backHome')}
        </button>
      </div>
      <A6Card kind={a6.kind} />
    </section>
  );
};
