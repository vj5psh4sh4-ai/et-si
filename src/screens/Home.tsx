import React from 'react';
import { ArrowRight, BookOpen, Footprints, Signpost } from 'lucide-react';
import type { AppApi } from '../appApi';
import { HeroLandscape } from '../components/Illustrations';

export const HomeScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const resume = app.hasSavedData && !app.isDemo && app.notebook.feedbacks.length > 0;
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Essaie des idées · Explore plusieurs chemins · Découvre ta prochaine étape</p>
          <h1 className="hero-title">
            Et si<span className="hero-dots">…</span>
          </h1>
          <p className="hero-lead">Plusieurs futurs sont possibles. Commence par en essayer un.</p>
          <p className="hero-note">Tu n’as pas besoin de savoir aujourd’hui ce que tu feras toute ta vie.</p>
          <div className="action-row">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => app.go('character')}>
              Commencer <ArrowRight size={20} aria-hidden="true" />
            </button>
            {resume && (
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => app.go('hub')}>
                Reprendre mon exploration
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-lg" onClick={app.startDemo}>
              Voir une démo
            </button>
          </div>
          <p className="hero-meta">5 à 8 minutes · sans compte · rien n’est envoyé</p>
        </div>
        <div className="hero-art">
          <HeroLandscape />
        </div>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">Comment ça marche</h2>
        <ol className="how-grid">
          <li>
            <span className="how-icon">
              <Footprints size={22} aria-hidden="true" />
            </span>
            <span className="how-step">1</span>
            <h3>Tu pars de là où tu en es</h3>
            <p>Ton personnage, ta situation et ce qui t’attire aujourd’hui. Rien n’est définitif.</p>
          </li>
          <li>
            <span className="how-icon">
              <Signpost size={22} aria-hidden="true" />
            </span>
            <span className="how-step">2</span>
            <h3>Tu essaies des missions</h3>
            <p>Tu rejoins un projet, tu choisis un rôle et tu prends des décisions. Tu peux bifurquer à tout moment.</p>
          </li>
          <li>
            <span className="how-icon">
              <BookOpen size={22} aria-hidden="true" />
            </span>
            <span className="how-step">3</span>
            <h3>Tu repars avec des pistes</h3>
            <p>Les chemins de formation qui y mènent et une prochaine expérience à vivre pour de vrai.</p>
          </li>
        </ol>
      </section>

      <p className="disclaimer-text home-disclaimer">
        Prototype d’exploration autour des quatre hautes écoles de la HES-SO Fribourg (HEIA-FR, HEG-FR, HEdS-FR,
        HETS-FR). Ce n’est ni un test d’orientation ni un outil d’admission.
      </p>
    </div>
  );
};
