import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Minus, Plus } from 'lucide-react';
import { MicroActivity } from '../types';

interface Props {
  activity: MicroActivity;
  onComplete: (selectedIds: string[]) => void;
}

const TYPE_LABEL: Record<MicroActivity['type'], string> = {
  pick_questions: 'Choisir des questions',
  select_constraints: 'Repérer ce qui compte',
  rank_priorities: 'Classer des priorités',
  allocate_tokens: 'Répartir des ressources',
};

export const MicroActivityWidget: React.FC<Props> = ({ activity, onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [ranked, setRanked] = useState<string[]>(activity.options.map((o) => o.id));
  const [tokens, setTokens] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    activity.options.forEach((o) => (init[o.id] = 0));
    return init;
  });

  const targetCount = activity.targetCount ?? 2;
  const totalTokens = activity.totalTokens ?? 6;
  const usedTokens = Object.values(tokens).reduce((sum, n) => sum + n, 0);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= targetCount) return prev;
      return [...prev, id];
    });
  };

  const moveRank = (index: number, delta: -1 | 1) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= ranked.length) return;
    const copy = [...ranked];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    setRanked(copy);
  };

  const adjustToken = (id: string, delta: -1 | 1) => {
    setTokens((prev) => {
      const current = prev[id] ?? 0;
      const next = current + delta;
      if (next < 0) return prev;
      const used = Object.values(prev).reduce((s, n) => s + n, 0);
      if (delta > 0 && used >= totalTokens) return prev;
      return { ...prev, [id]: next };
    });
  };

  const header = (
    <div className="micro-head">
      <span className="micro-type">{TYPE_LABEL[activity.type]}</span>
      <p className="micro-prompt">{activity.prompt}</p>
    </div>
  );

  if (activity.type === 'pick_questions' || activity.type === 'select_constraints') {
    const canSubmit = selected.length === targetCount;
    const full = selected.length >= targetCount;
    return (
      <div className="micro-box">
        {header}
        <div className="option-stack" role="group" aria-label={activity.prompt}>
          {activity.options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                className={`option-btn ${active ? 'selected' : ''} ${!active && full ? 'dimmed' : ''}`}
                aria-pressed={active}
                onClick={() => toggleSelect(opt.id)}
              >
                <span className="option-check" aria-hidden="true">
                  {active && <Check size={16} strokeWidth={3} />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        <div className="micro-foot">
          <p className="micro-counter" aria-live="polite">
            {selected.length} / {targetCount} sélectionnés
          </p>
          <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={() => onComplete(selected)}>
            Valider mes choix
          </button>
        </div>
      </div>
    );
  }

  if (activity.type === 'rank_priorities') {
    return (
      <div className="micro-box">
        {header}
        <ol className="rank-list">
          {ranked.map((id, idx) => {
            const opt = activity.options.find((o) => o.id === id)!;
            return (
              <li key={id} className="rank-item">
                <span className="rank-badge" aria-hidden="true">{idx + 1}</span>
                <span className="rank-label">{opt.label}</span>
                <span className="rank-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={idx === 0}
                    aria-label={`Monter : ${opt.label}`}
                    onClick={() => moveRank(idx, -1)}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={idx === ranked.length - 1}
                    aria-label={`Descendre : ${opt.label}`}
                    onClick={() => moveRank(idx, 1)}
                  >
                    <ArrowDown size={18} />
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="micro-foot">
          <p className="micro-counter">Utilise les flèches pour changer l’ordre.</p>
          <button type="button" className="btn btn-primary" onClick={() => onComplete([ranked[0]])}>
            Valider mon classement
          </button>
        </div>
      </div>
    );
  }

  // allocate_tokens
  const canSubmitTokens = usedTokens === totalTokens;
  const topTokenId = Object.entries(tokens).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const remaining = totalTokens - usedTokens;

  return (
    <div className="micro-box">
      {header}
      <div className="token-pool" aria-hidden="true">
        {Array.from({ length: totalTokens }).map((_, i) => (
          <span key={i} className={`token ${i < remaining ? 'free' : 'used'}`} />
        ))}
      </div>
      <div className="token-list">
        {activity.options.map((opt) => {
          const n = tokens[opt.id] ?? 0;
          return (
            <div key={opt.id} className="token-row">
              <span className="token-label">{opt.label}</span>
              <span className="token-placed" aria-hidden="true">
                {Array.from({ length: n }).map((_, i) => (
                  <span key={i} className="token used" />
                ))}
              </span>
              <span className="token-controls">
                <button
                  type="button"
                  className="icon-btn"
                  disabled={n === 0}
                  aria-label={`Retirer un jeton : ${opt.label}`}
                  onClick={() => adjustToken(opt.id, -1)}
                >
                  <Minus size={18} />
                </button>
                <span className="token-count" aria-live="polite" aria-label={`${n} jetons pour ${opt.label}`}>
                  {n}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  disabled={usedTokens >= totalTokens}
                  aria-label={`Ajouter un jeton : ${opt.label}`}
                  onClick={() => adjustToken(opt.id, 1)}
                >
                  <Plus size={18} />
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="micro-foot">
        <p className="micro-counter" aria-live="polite">
          {remaining > 0 ? `Encore ${remaining} jeton${remaining > 1 ? 's' : ''} à placer` : 'Tous les jetons sont placés.'}
        </p>
        <button type="button" className="btn btn-primary" disabled={!canSubmitTokens} onClick={() => onComplete([topTokenId])}>
          Valider ma répartition
        </button>
      </div>
    </div>
  );
};
