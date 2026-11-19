import React, { useEffect, useState } from 'react';
import { BookOpen, Info, Map, Signpost, X } from 'lucide-react';
import type { AppApi, Screen } from '../appApi';
import { AvatarIcon } from './Avatars';
import { SignpostMark } from './Illustrations';

const NAV: { id: Screen; label: string; icon: React.ElementType; match: Screen[] }[] = [
  { id: 'hub', label: 'Missions', icon: Map, match: ['hub', 'mission'] },
  { id: 'pathways', label: 'Mes chemins', icon: Signpost, match: ['pathways'] },
  { id: 'notebook', label: 'Mon carnet', icon: BookOpen, match: ['notebook'] },
  { id: 'about', label: 'À propos', icon: Info, match: ['about'] },
];

export const Header: React.FC<{ app: AppApi }> = ({ app }) => {
  const count = app.notebook.feedbacks.length;
  return (
    <header className="top-bar no-print">
      <button type="button" className="brand-btn" onClick={() => app.go('home')} aria-label="Et si… — accueil">
        <SignpostMark size={30} />
        <span>Et si…</span>
      </button>
      <nav aria-label="Navigation principale" className="top-nav">
        {NAV.map((n) => {
          const active = n.match.includes(app.screen);
          return (
            <button
              key={n.id}
              type="button"
              className={active ? 'active' : ''}
              aria-current={active ? 'page' : undefined}
              onClick={() => app.go(n.id)}
            >
              {n.label}
              {n.id === 'notebook' && count > 0 && <span className="nav-count">{count}</span>}
            </button>
          );
        })}
      </nav>
      <button type="button" className="player-pill" onClick={() => app.go('character')} title="Modifier mon personnage">
        <AvatarIcon avatarId={app.notebook.profile.avatarId} color={app.notebook.profile.color} size={34} decorative />
        <span className="player-name">{app.notebook.profile.nickname || 'Mon personnage'}</span>
      </button>
    </header>
  );
};

export const BottomNav: React.FC<{ app: AppApi }> = ({ app }) => {
  if (app.screen === 'home') return null;
  const count = app.notebook.feedbacks.length;
  return (
    <nav className="bottom-nav no-print" aria-label="Navigation rapide">
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = n.match.includes(app.screen);
        return (
          <button
            key={n.id}
            type="button"
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
            onClick={() => app.go(n.id)}
          >
            <span className="bn-icon">
              <Icon size={22} aria-hidden="true" />
              {n.id === 'notebook' && count > 0 && <span className="nav-count">{count}</span>}
            </span>
            <span>{n.id === 'pathways' ? 'Chemins' : n.id === 'notebook' ? 'Carnet' : n.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const DemoBanner: React.FC<{ onExit: () => void }> = ({ onExit }) => (
  <div className="demo-banner no-print" role="status">
    <span>
      <strong>Mode démo</strong> — exploration fictive d’« Alex ». Rien n’est enregistré.
    </span>
    <button type="button" className="btn btn-small btn-ink" onClick={onExit}>
      <X size={16} aria-hidden="true" /> Quitter la démo
    </button>
  </div>
);

export const OnboardingStepper: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => {
  const labels = ['Mon personnage', 'Mon point de départ', 'Mon envie'];
  return (
    <ol className="onb-stepper" aria-label={`Étape ${step} sur 3`}>
      {labels.map((l, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'current' : 'todo';
        return (
          <li key={l} className={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="onb-dot">{n}</span>
            <span className="onb-label">{l}</span>
          </li>
        );
      })}
    </ol>
  );
};

/** Bouton à double confirmation, sans boîte de dialogue native. */
export const ConfirmButton: React.FC<{
  label: string;
  confirmLabel: string;
  warning: string;
  onConfirm: () => void;
  className?: string;
}> = ({ label, confirmLabel, warning, onConfirm, className }) => {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 6000);
    return () => clearTimeout(t);
  }, [armed]);
  if (!armed) {
    return (
      <button type="button" className={className ?? 'btn btn-ghost'} onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="confirm-inline" role="alert">
      <span>{warning}</span>
      <button type="button" className="btn btn-danger btn-small" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => setArmed(false)}>
        Annuler
      </button>
    </span>
  );
};
