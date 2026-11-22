import React from 'react';
import { ArrowRight, DoorOpen, Layers, Map, Route, Signpost, Wrench } from 'lucide-react';
import type { AppApi } from '../appApi';
import { HeroLandscape } from '../components/Illustrations';
import { hasExploration } from '../domain/notebook';
import { useI18n } from '../i18n';

/** Écran d'appel du mode stand : une seule action, lisible à trois mètres. */
const Attract: React.FC<{ app: AppApi }> = ({ app }) => {
  const { lang, setLang, t } = useI18n();
  // Chaque visiteur repart d'un carnet vide, même si la tablette n'a pas encore été remise à zéro.
  // La langue choisie sur cet écran est conservée.
  const fresh = () => {
    app.standReset();
    setLang(lang);
  };
  const start = () => {
    fresh();
    app.startExpress();
  };
  const doors = () => {
    fresh();
    app.go('doors');
  };
  return (
    <div className="attract">
      <div className="attract-copy">
        <span className="pill pill-sign">{t('stand.badge')}</span>
        <h1 className="attract-title">{t('stand.title')}</h1>
        <p className="attract-time">{t('stand.time')}</p>
        <button type="button" className="btn btn-primary attract-cta" onClick={start}>
          {t('stand.cta')} <ArrowRight size={28} aria-hidden="true" />
        </button>
        <p className="hero-meta">{t('stand.note')}</p>
        <button type="button" className="btn btn-ghost" onClick={doors}>
          <DoorOpen size={18} aria-hidden="true" /> {t('panel.doors')}
        </button>
      </div>
      <div className="hero-art attract-art">
        <HeroLandscape />
      </div>
    </div>
  );
};

export const HomeScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const { t } = useI18n();
  if (app.isStand) return <Attract app={app} />;
  const resume = app.cardsEnabled && !app.isDemo && hasExploration(app.notebook);
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="hero-title">
            Et si<span className="hero-dots">…</span>
          </h1>
          <p className="hero-lead">{app.cardsEnabled ? t('home.lead') : t('doors.lead')}</p>
          {app.cardsEnabled && <p className="hero-note">{t('home.note')}</p>}
          <div className="action-row">
            {resume ? (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => app.go('panel')}>
                <Signpost size={20} aria-hidden="true" /> {t('home.resume')}
              </button>
            ) : app.cardsEnabled ? (
              <button type="button" className="btn btn-primary btn-lg" onClick={app.startExpress}>
                {t('home.cta')} <span className="cta-time">· {t('home.cta.time')}</span> <ArrowRight size={20} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => app.go('doors')}>
                {t('home.doors.title')} <ArrowRight size={20} aria-hidden="true" />
              </button>
            )}
            {app.cardsEnabled && (
              <button type="button" className="btn btn-ghost btn-lg" onClick={app.startDemo}>
                {t('home.demo')}
              </button>
            )}
          </div>
          <p className="hero-meta">{t('home.meta')}</p>
        </div>
        <div className="hero-art">
          <HeroLandscape />
        </div>
      </section>

      <section className="entries" aria-labelledby="entries-title">
        <h2 id="entries-title" className="section-title">
          {t('home.more.title')}
        </h2>
        <div className="entry-grid">
          <button type="button" className="entry-card" onClick={() => app.go('doors')}>
            <span className="how-icon">
              <DoorOpen size={22} aria-hidden="true" />
            </span>
            <strong>{t('home.doors.title')}</strong>
            <span>{t('home.doors.text')}</span>
            <ArrowRight className="entry-go" size={18} aria-hidden="true" />
          </button>
          <button type="button" className="entry-card" onClick={() => app.go('cfc')}>
            <span className="how-icon">
              <Wrench size={22} aria-hidden="true" />
            </span>
            <strong>{t('home.cfc.title')}</strong>
            <span>{t('home.cfc.text')}</span>
            <ArrowRight className="entry-go" size={18} aria-hidden="true" />
          </button>
          <button type="button" className="entry-card" onClick={app.openMissions}>
            <span className="how-icon">
              <Map size={22} aria-hidden="true" />
            </span>
            <strong>{t('home.missions.title')}</strong>
            <span>{t('home.missions.text')}</span>
            <ArrowRight className="entry-go" size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      {app.cardsEnabled && (
        <section className="how" aria-labelledby="how-title">
          <h2 id="how-title" className="section-title">
            {t('home.how.title')}
          </h2>
          <ol className="how-grid">
            <li>
              <span className="how-icon">
                <Layers size={22} aria-hidden="true" />
              </span>
              <span className="how-step">1</span>
              <h3>{t('home.how.1.title')}</h3>
              <p>{t('home.how.1.text')}</p>
            </li>
            <li>
              <span className="how-icon">
                <Signpost size={22} aria-hidden="true" />
              </span>
              <span className="how-step">2</span>
              <h3>{t('home.how.2.title')}</h3>
              <p>{t('home.how.2.text')}</p>
            </li>
            <li>
              <span className="how-icon">
                <Route size={22} aria-hidden="true" />
              </span>
              <span className="how-step">3</span>
              <h3>{t('home.how.3.title')}</h3>
              <p>{t('home.how.3.text')}</p>
            </li>
          </ol>
        </section>
      )}

      <p className="disclaimer-text home-disclaimer">{t('home.disclaimer')}</p>
    </div>
  );
};
