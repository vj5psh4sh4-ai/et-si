import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Cog,
  Compass,
  Hammer,
  HandHeart,
  HeartPulse,
  Laptop,
  Lightbulb,
  ListChecks,
  Shuffle,
  Target,
  Users,
} from 'lucide-react';
import type { AppApi } from '../appApi';
import { AVATAR_OPTIONS, AvatarIcon, COLOR_OPTIONS } from '../components/Avatars';
import { OnboardingStepper } from '../components/Chrome';
import { DISCOVERY_CARDS, IDEA_ANGLES, OBJECTIVE_OPTIONS } from '../data/missions';
import { REFLECTION_LABELS, SITUATION_LABELS } from '../data/tracks';
import { ENTRY_GATES } from '../data/ui';
import type { EntryMode, ReflectionState, SituationId } from '../types';

const CARD_ICONS: Record<string, React.ElementType> = {
  comprendre: Cog,
  aider: HandHeart,
  inventer: Hammer,
  organiser: ListChecks,
  lieux: Building2,
  sante: HeartPulse,
  numerique: Laptop,
  collectif: Users,
  soigner: HeartPulse,
  technique: Cog,
  accompagner: HandHeart,
  gerer: ListChecks,
  espaces: Building2,
  autre: Compass,
};

const GATE_ICONS: Record<EntryMode, React.ElementType> = {
  decouvre: Compass,
  objectif: Target,
  idee: Lightbulb,
};

const SITUATION_ORDER: SituationId[] = ['co', 'apprentissage', 'college', 'ecg', 'autre', 'non_precise'];
const SITUATION_CHOICE_LABEL: Record<SituationId, string> = {
  ...SITUATION_LABELS,
  non_precise: 'Je préfère explorer sans préciser',
};

/* ---------- 1. Personnage ---------- */

export const CharacterScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const p = app.notebook.profile;
  return (
    <section className="page onb">
      <OnboardingStepper step={1} />
      <div className="onb-grid">
        <aside className="traveller-card" style={{ ['--player' as string]: p.color }}>
          <span className="traveller-kicker">Carte de voyage</span>
          <AvatarIcon avatarId={p.avatarId} color={p.color} size={112} />
          <strong className="traveller-name">{p.nickname || 'Sans pseudonyme'}</strong>
          <span className="traveller-sub">Prêt·e à explorer</span>
          <p className="traveller-note">Ton apparence ne modifie jamais les pistes proposées.</p>
        </aside>

        <div className="onb-main">
          <h1 className="page-title">Qui part en exploration ?</h1>
          <p className="page-lead">Choisis un emblème et une couleur pour ton personnage. Tu pourras les changer plus tard.</p>

          <fieldset className="fieldset">
            <legend>Ton emblème</legend>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((av) => {
                const on = p.avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    className={`avatar-tile ${on ? 'selected' : ''}`}
                    aria-pressed={on}
                    onClick={() => app.updateProfile({ avatarId: av.id })}
                  >
                    <AvatarIcon avatarId={av.id} color={p.color} size={52} decorative />
                    <span>{av.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend>Ta couleur</legend>
            <div className="color-row">
              {COLOR_OPTIONS.map((c) => {
                const on = p.color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`color-dot ${on ? 'selected' : ''}`}
                    style={{ backgroundColor: c.id }}
                    aria-label={c.label}
                    aria-pressed={on}
                    title={c.label}
                    onClick={() => app.updateProfile({ color: c.id })}
                  >
                    {on && <Check size={18} color="#fff" strokeWidth={3} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="nickname">Prénom ou pseudonyme (facultatif)</label>
            <input
              id="nickname"
              type="text"
              maxLength={30}
              autoComplete="off"
              value={p.nickname}
              placeholder="Ex. Camille, Sam…"
              onChange={(e) => app.updateProfile({ nickname: e.target.value })}
            />
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={() => app.go('start')}>
              Continuer <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => app.go('start')}>
              Passer cette étape
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- 2. Point de départ ---------- */

const REFLECTION_TO_GATE: Record<ReflectionState, EntryMode> = {
  decouvre: 'decouvre',
  hesite: 'decouvre',
  objectif: 'objectif',
  idee: 'idee',
};

export const StartScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const p = app.notebook.profile;
  return (
    <section className="page onb">
      <OnboardingStepper step={2} />
      <h1 className="page-title">Où en es-tu aujourd’hui ?</h1>
      <p className="page-lead">Deux questions indépendantes. On peut être au collège et avoir une idée très précise, ou en apprentissage et encore hésiter.</p>

      <div className="two-col">
        <fieldset className="fieldset panel">
          <legend>Dans ta formation</legend>
          <div className="chip-stack">
            {SITUATION_ORDER.map((sit) => {
              const on = p.situation === sit;
              return (
                <button
                  key={sit}
                  type="button"
                  className={`choice-btn ${on ? 'selected' : ''}`}
                  aria-pressed={on}
                  onClick={() => app.updateProfile({ situation: sit })}
                >
                  <span className="radio-dot" aria-hidden="true" />
                  {SITUATION_CHOICE_LABEL[sit]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="fieldset panel">
          <legend>Dans ta réflexion</legend>
          <div className="chip-stack">
            {(Object.keys(REFLECTION_LABELS) as ReflectionState[]).map((ref) => {
              const on = p.reflection === ref;
              return (
                <button
                  key={ref}
                  type="button"
                  className={`choice-btn ${on ? 'selected' : ''}`}
                  aria-pressed={on}
                  onClick={() => app.updateProfile({ reflection: ref })}
                >
                  <span className="radio-dot" aria-hidden="true" />
                  {REFLECTION_LABELS[ref]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="action-row">
        <button type="button" className="btn btn-ghost" onClick={() => app.go('character')}>
          <ArrowLeft size={18} aria-hidden="true" /> Retour
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!p.entryMode) app.updateProfile({ entryMode: REFLECTION_TO_GATE[p.reflection] });
            app.go('entry');
          }}
        >
          Choisir ma porte d’entrée <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

/* ---------- 3. Porte d’entrée ---------- */

export const EntryScreen: React.FC<{ app: AppApi }> = ({ app }) => {
  const p = app.notebook.profile;
  const suggested = REFLECTION_TO_GATE[p.reflection];

  const toggleCard = (cardId: string) => {
    const cur = p.selectedDiscoveryCards;
    if (cur.includes(cardId)) app.updateProfile({ selectedDiscoveryCards: cur.filter((c) => c !== cardId) });
    else if (cur.length < 3) app.updateProfile({ selectedDiscoveryCards: [...cur, cardId] });
  };

  return (
    <section className="page onb">
      <OnboardingStepper step={3} />
      <h1 className="page-title">Par quelle porte veux-tu entrer ?</h1>
      <p className="page-lead">Les trois portes mènent aux mêmes missions. Elles changent seulement l’ordre dans lequel on te les propose.</p>

      <div className="gate-grid" role="group" aria-label="Portes d’entrée">
        {ENTRY_GATES.map((g) => {
          const Icon = GATE_ICONS[g.id];
          const on = p.entryMode === g.id;
          return (
            <button
              key={g.id}
              type="button"
              className={`gate-card ${on ? 'selected' : ''}`}
              aria-pressed={on}
              onClick={() => app.updateProfile({ entryMode: g.id })}
            >
              <span className="gate-top">
                <span className="gate-icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <span className="gate-kicker">{g.kicker}</span>
                {g.id === suggested && <span className="pill pill-soft">D’après ta réponse</span>}
              </span>
              <strong>{g.title}</strong>
              <span className="gate-desc">{g.desc}</span>
            </button>
          );
        })}
      </div>

      {p.entryMode === 'decouvre' && (
        <div className="subpanel">
          <div className="subpanel-head">
            <h2>Qu’est-ce qui t’intrigue ?</h2>
            <span className="counter-pill" aria-live="polite">
              {p.selectedDiscoveryCards.length} / 3
            </span>
          </div>
          <p className="muted">Choisis jusqu’à trois activités. « J’aimerais essayer » suffit : pas besoin d’être déjà doué·e.</p>
          <div className="interest-grid">
            {DISCOVERY_CARDS.map((card) => {
              const Icon = CARD_ICONS[card.id] ?? Compass;
              const on = p.selectedDiscoveryCards.includes(card.id);
              const full = p.selectedDiscoveryCards.length >= 3;
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`interest-card ${on ? 'selected' : ''} ${!on && full ? 'dimmed' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleCard(card.id)}
                >
                  <Icon size={24} aria-hidden="true" />
                  <span>{card.label}</span>
                  {on && (
                    <span className="interest-check" aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={app.launchFirstMission}>
              Voir mes missions <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-secondary" onClick={app.surpriseMission}>
              <Shuffle size={18} aria-hidden="true" /> Surprends-moi
            </button>
          </div>
        </div>
      )}

      {p.entryMode === 'objectif' && (
        <div className="subpanel">
          <h2>Quelle direction as-tu en tête ?</h2>
          <p className="muted">Choisis l’intention la plus proche. Les missions te feront tester ce qu’elle implique concrètement.</p>
          <div className="interest-grid">
            {OBJECTIVE_OPTIONS.map((obj) => {
              const Icon = CARD_ICONS[obj.id] ?? Compass;
              const on = p.selectedObjective === obj.id;
              return (
                <button
                  key={obj.id}
                  type="button"
                  className={`interest-card ${on ? 'selected' : ''}`}
                  aria-pressed={on}
                  onClick={() => app.updateProfile({ selectedObjective: obj.id })}
                >
                  <Icon size={24} aria-hidden="true" />
                  <span>{obj.label}</span>
                </button>
              );
            })}
          </div>
          <div className="action-row">
            <button type="button" className="btn btn-primary" disabled={!p.selectedObjective} onClick={app.launchFirstMission}>
              Voir mes missions <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {p.entryMode === 'idee' && (
        <div className="subpanel">
          <h2>Raconte ton idée</h2>
          <div className="field">
            <label htmlFor="idea-input">Ton idée (facultatif)</label>
            <textarea
              id="idea-input"
              maxLength={300}
              rows={3}
              value={p.ideaText}
              placeholder="Ex. Créer un atelier de réparation de vélos pour les jeunes…"
              onChange={(e) => app.updateProfile({ ideaText: e.target.value })}
              aria-describedby="idea-help"
            />
            <div className="field-foot">
              <p id="idea-help" className="micro-helper">
                Dans ce prototype, ton idée personnalise ton carnet. Les missions sont proposées à partir de l’angle que tu choisis.
              </p>
              <span className="char-count">{p.ideaText.length} / 300</span>
            </div>
          </div>
          <h3 className="h-sub">Pour avancer sur cette idée, qu’aurais-tu envie d’explorer en premier ?</h3>
          <div className="chip-row">
            {IDEA_ANGLES.map((angle) => {
              const on = p.ideaAngle === angle.id;
              return (
                <button
                  key={angle.id}
                  type="button"
                  className={`chip ${on ? 'selected' : ''}`}
                  aria-pressed={on}
                  onClick={() => app.updateProfile({ ideaAngle: angle.id })}
                >
                  {angle.label}
                </button>
              );
            })}
          </div>
          <div className="action-row">
            <button type="button" className="btn btn-primary" disabled={!p.ideaAngle} onClick={app.launchFirstMission}>
              Voir mes missions <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="action-row">
        <button type="button" className="btn btn-ghost" onClick={() => app.go('start')}>
          <ArrowLeft size={18} aria-hidden="true" /> Retour
        </button>
      </div>
    </section>
  );
};
