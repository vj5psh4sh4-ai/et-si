import React, { useEffect, useState } from 'react';
import { BookOpen, DoorOpen, Map, Signpost, X } from 'lucide-react';
import type { AppApi, Screen } from '../appApi';
import { useI18n, type Key } from '../i18n';
import { LANGS } from '../i18n/lang';
import { AvatarIcon } from './Avatars';
import { SignpostMark } from './Illustrations';

interface NavItem {
  id: Screen;
  key: Key;
  icon: React.ElementType;
  match: Screen[];
}

const NAV: NavItem[] = [
  { id: 'panel', key: 'nav.panel', icon: Signpost, match: ['panel', 'cards', 'share'] },
  { id: 'doors', key: 'nav.doors', icon: DoorOpen, match: ['doors', 'sheet', 'cfc'] },
  { id: 'hub', key: 'nav.missions', icon: Map, match: ['hub', 'mission', 'character', 'start', 'entry'] },
  { id: 'notebook', key: 'nav.notebook', icon: BookOpen, match: ['notebook'] },
];

/** Entrées visibles : le stand se limite au panneau et aux portes ; sans questionnaire, pas de panneau. */
function navFor(app: AppApi): NavItem[] {
  return NAV.filter((n) => {
    if (n.id === 'panel' && !app.cardsEnabled) return false;
    if (app.isStand && (n.id === 'hub' || n.id === 'notebook')) return false;
    return true;
  });
}

const open = (app: AppApi, n: NavItem) => (n.id === 'hub' ? app.openMissions() : app.go(n.id));
const keptCount = (app: AppApi) => app.notebook.savedProgrammeIds.length + app.notebook.savedCfc.length;

export const LangSwitch: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t('nav.lang')}>
      {LANGS.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export const Header: React.FC<{ app: AppApi }> = ({ app }) => {
  const { t } = useI18n();
  const attract = app.isStand && app.screen === 'home';
  const count = keptCount(app);
  return (
    <header className="top-bar no-print">
      <button type="button" className="brand-btn" onClick={() => app.go('home')} aria-label={t('nav.home')}>
        <SignpostMark size={30} />
        <span>{t('app.name')}</span>
      </button>
      {!attract && (
        <nav aria-label={t('nav.main')} className="top-nav">
          {navFor(app).map((n) => {
            const active = n.match.includes(app.screen);
            return (
              <button key={n.id} type="button" className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => open(app, n)}>
                {t(n.key)}
                {n.id === 'notebook' && count > 0 && <span className="nav-count">{count}</span>}
              </button>
            );
          })}
        </nav>
      )}
      <div className="top-tools">
        <LangSwitch />
        {app.isStand ? (
          !attract && (
            <button type="button" className="btn btn-small btn-ink stand-finish" onClick={app.standReset}>
              <X size={16} aria-hidden="true" /> {t('stand.finish')}
            </button>
          )
        ) : (
          <button type="button" className="player-pill" onClick={() => app.go('character')} title={t('nav.character')} aria-label={t('nav.character')}>
            <AvatarIcon avatarId={app.notebook.profile.avatarId} color={app.notebook.profile.color} size={34} decorative />
            <span className="player-name">{app.notebook.profile.nickname || t('nav.character.default')}</span>
          </button>
        )}
      </div>
    </header>
  );
};

/** Écrans plein cadre, sans barre du bas : accueil, point de départ et cartes. */
const NO_BOTTOM_NAV: Screen[] = ['home', 'situation', 'cards'];

export const BottomNav: React.FC<{ app: AppApi }> = ({ app }) => {
  const { t } = useI18n();
  if (NO_BOTTOM_NAV.includes(app.screen)) return null;
  const items = navFor(app);
  const count = keptCount(app);
  return (
    <nav className="bottom-nav no-print" aria-label={t('nav.quick')} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((n) => {
        const Icon = n.icon;
        const active = n.match.includes(app.screen);
        return (
          <button key={n.id} type="button" className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => open(app, n)}>
            <span className="bn-icon">
              <Icon size={22} aria-hidden="true" />
              {n.id === 'notebook' && count > 0 && <span className="nav-count">{count}</span>}
            </span>
            <span>{t(n.key)}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const DemoBanner: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { t } = useI18n();
  return (
    <div className="demo-banner no-print" role="status">
      <span>{t('demo.banner')}</span>
      <button type="button" className="btn btn-small btn-ink" onClick={onExit}>
        <X size={16} aria-hidden="true" /> {t('demo.exit')}
      </button>
    </div>
  );
};

/** Panneau reçu par lien ou code QR : rien n'est écrit tant que la personne ne le garde pas. */
export const SharedBanner: React.FC<{ app: AppApi }> = ({ app }) => {
  const { t } = useI18n();
  return (
    <div className="demo-banner shared-banner no-print" role="status">
      <span>{t('shared.banner')}</span>
      <span className="banner-actions">
        {app.storedHasExploration ? (
          <ConfirmButton
            className="btn btn-small btn-ink"
            label={t('shared.keep.replace')}
            warning={t('shared.keep.warning')}
            confirmLabel={t('shared.keep')}
            onConfirm={app.keepShared}
          />
        ) : (
          <button type="button" className="btn btn-small btn-ink" onClick={app.keepShared}>
            {t('shared.keep')}
          </button>
        )}
        <button type="button" className="btn btn-small btn-ghost" onClick={app.discardShared}>
          {t('shared.discard')}
        </button>
      </span>
    </div>
  );
};

/** Avertissement du mode stand avant la remise à zéro. Un geste n'importe où le referme. */
export const StandIdleDialog: React.FC<{ seconds: number }> = ({ seconds }) => {
  const { t } = useI18n();
  return (
    <div className="idle-overlay no-print">
      <div className="idle-card" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-text">
        <h2 id="idle-title">{t('stand.idle.title')}</h2>
        <p id="idle-text">{t('stand.idle.text', { n: seconds })}</p>
        <button type="button" className="btn btn-primary btn-lg" autoFocus>
          {t('stand.idle.continue')}
        </button>
      </div>
    </div>
  );
};

/** Contenus restés en français (missions) : la mention s'affiche dans la langue de l'interface. */
export const FrenchOnlyNote: React.FC<{ k: Key }> = ({ k }) => {
  const { lang, t } = useI18n();
  if (lang === 'fr') return null;
  return (
    <p className="hint-line fr-only-note" lang={lang}>
      {t(k)}
    </p>
  );
};

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
  label: React.ReactNode;
  confirmLabel: string;
  warning: string;
  onConfirm: () => void;
  className?: string;
}> = ({ label, confirmLabel, warning, onConfirm, className }) => {
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 6000);
    return () => clearTimeout(timer);
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
      <button
        type="button"
        className="btn btn-danger btn-small"
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => setArmed(false)}>
        {t('app.cancel')}
      </button>
    </span>
  );
};
