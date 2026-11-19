import React from 'react';
import type { AppApi } from '../appApi';

export const AboutScreen: React.FC<{ app: AppApi }> = ({ app }) => (
  <section className="page about">
    <header className="page-head">
      <p className="eyebrow">À propos</p>
      <h1 className="page-title">« Et si… », un prototype d’exploration</h1>
      <p className="page-lead">
        Ce prototype teste une expérience ludique autour des quatre hautes écoles de la HES-SO Fribourg : HEIA-FR, HEG-FR, HEdS-FR et
        HETS-FR.
      </p>
    </header>

    <div className="about-grid">
      <section className="panel">
        <h2>Ce que fait ce prototype</h2>
        <ul>
          <li>Quatre missions narratives courtes, avec plusieurs rôles et des microactivités interactives.</li>
          <li>Des pistes qui viennent uniquement de tes ressentis, avec une explication visible.</li>
          <li>Un carnet sauvegardé seulement dans ton navigateur, que tu peux copier, imprimer ou supprimer.</li>
        </ul>
      </section>
      <section className="panel">
        <h2>Limites assumées</h2>
        <ul>
          <li>Ce n’est ni un test d’orientation validé, ni un outil officiel d’admission.</li>
          <li>Aucune condition d’admission n’est vérifiée ni garantie.</li>
          <li>Les regroupements affichés sont illustratifs et ne sont pas des intitulés officiels de bachelors.</li>
          <li>Il ne couvre pas tous les métiers ni toutes les formations en Suisse.</li>
          <li>Aucune donnée n’est envoyée à un serveur ou à une intelligence artificielle.</li>
        </ul>
      </section>
    </div>

    <div className="action-row">
      <button type="button" className="btn btn-primary" onClick={() => app.go('home')}>
        Retour à l’accueil
      </button>
    </div>
  </section>
);
