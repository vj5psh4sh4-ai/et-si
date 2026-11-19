import React, { useState } from 'react';
import { MicroActivity } from '../types';

interface Props {
  activity: MicroActivity;
  onComplete: (selectedIds: string[]) => void;
}

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
      if (delta > 0 && usedTokens >= totalTokens) return prev;
      return { ...prev, [id]: next };
    });
  };

  if (activity.type === 'pick_questions' || activity.type === 'select_constraints') {
    const canSubmit = selected.length === targetCount;
    return (
      <div className="micro-box">
        <p className="micro-prompt">{activity.prompt}</p>
        <p className="micro-helper">
          Sélectionnés : {selected.length} / {targetCount}
        </p>
        <div className="option-stack">
          {activity.options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                className={`choice-btn ${active ? 'selected' : ''}`}
                aria-pressed={active}
                onClick={() => toggleSelect(opt.id)}
              >
                <span className="choice-check" aria-hidden="true">
                  {active ? '✓' : '○'}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={!canSubmit}
          onClick={() => onComplete(selected)}
        >
          Valider mes choix
        </button>
      </div>
    );
  }

  if (activity.type === 'rank_priorities') {
    return (
      <div className="micro-box">
        <p className="micro-prompt">{activity.prompt}</p>
        <p className="micro-helper">Utilise les boutons Monter / Descendre pour ordonner tes priorités.</p>
        <ol className="rank-list">
          {ranked.map((id, idx) => {
            const opt = activity.options.find((o) => o.id === id)!;
            return (
              <li key={id} className="rank-item">
                <span className="rank-badge">{idx + 1}</span>
                <span className="rank-label">{opt.label}</span>
                <div className="rank-actions">
                  <button
                    type="button"
                    className="btn-small"
                    disabled={idx === 0}
                    aria-label={`Monter ${opt.label}`}
                    onClick={() => moveRank(idx, -1)}
                  >
                    ↑ Monter
                  </button>
                  <button
                    type="button"
                    className="btn-small"
                    disabled={idx === ranked.length - 1}
                    aria-label={`Descendre ${opt.label}`}
                    onClick={() => moveRank(idx, 1)}
                  >
                    ↓ Descendre
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onComplete([ranked[0]])}
        >
          Valider mon classement
        </button>
      </div>
    );
  }

  // allocate_tokens
  const canSubmitTokens = usedTokens === totalTokens;
  const topTokenId = Object.entries(tokens).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  return (
    <div className="micro-box">
      <p className="micro-prompt">{activity.prompt}</p>
      <p className="micro-helper">
        Jetons placés : <strong>{usedTokens} / {totalTokens}</strong>
      </p>
      <div className="token-list">
        {activity.options.map((opt) => (
          <div key={opt.id} className="token-row">
            <span>{opt.label}</span>
            <div className="token-controls">
              <button
                type="button"
                className="btn-small"
                disabled={(tokens[opt.id] ?? 0) === 0}
                aria-label={`Retirer un jeton pour ${opt.label}`}
                onClick={() => adjustToken(opt.id, -1)}
              >
                −
              </button>
              <span className="token-count" aria-live="polite">
                {tokens[opt.id] ?? 0}
              </span>
              <button
                type="button"
                className="btn-small"
                disabled={usedTokens >= totalTokens}
                aria-label={`Ajouter un jeton pour ${opt.label}`}
                onClick={() => adjustToken(opt.id, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-primary"
        disabled={!canSubmitTokens}
        onClick={() => onComplete([topTokenId])}
      >
        Valider ma répartition
      </button>
    </div>
  );
};
