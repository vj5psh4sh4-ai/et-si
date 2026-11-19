import React from 'react';

export const AVATAR_OPTIONS = [
  { id: 'boussole', label: 'Boussole' },
  { id: 'montagne', label: 'Sommet' },
  { id: 'feuille', label: 'Feuille' },
  { id: 'etoile', label: 'Étoile' },
  { id: 'vague', label: 'Vague' },
  { id: 'prisme', label: 'Prisme' },
];

export const COLOR_OPTIONS = [
  { id: '#2563eb', label: 'Bleu lac' },
  { id: '#0f766e', label: 'Vert sapin' },
  { id: '#b45309', label: 'Ocre chaud' },
  { id: '#7c3aed', label: 'Violet' },
  { id: '#be123c', label: 'Framboise' },
  { id: '#334155', label: 'Ardoise' },
];

const AVATAR_LABEL: Record<string, string> = Object.fromEntries(
  AVATAR_OPTIONS.map((a) => [a.id, a.label])
);

/** Avatar abstrait : un badge rond avec un emblème. Aucune apparence humaine, aucun stéréotype. */
export const AvatarIcon: React.FC<{ avatarId: string; color: string; size?: number; decorative?: boolean }> = ({
  avatarId,
  color,
  size = 48,
  decorative = false,
}) => {
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img', 'aria-label': `Avatar ${AVATAR_LABEL[avatarId] ?? avatarId}` };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="avatar-svg" {...a11y}>
      <circle cx="32" cy="32" r="31" fill={color} />
      <circle cx="32" cy="32" r="25" fill="#fffaf0" />
      <g fill={color} stroke={color} strokeLinejoin="round" strokeLinecap="round">
        {avatarId === 'boussole' && (
          <>
            <circle cx="32" cy="32" r="14" fill="none" strokeWidth="2.5" />
            <polygon points="32,17 36.5,32 32,47 27.5,32" strokeWidth="1" />
            <circle cx="32" cy="32" r="2.5" fill="#fffaf0" stroke="none" />
          </>
        )}
        {avatarId === 'montagne' && (
          <>
            <polygon points="12,45 27,20 42,45" strokeWidth="1" />
            <polygon points="30,45 41,27 52,45" fillOpacity="0.55" strokeWidth="1" />
            <polygon points="23,27 27,20 31,27 27,25" fill="#fffaf0" stroke="none" />
          </>
        )}
        {avatarId === 'feuille' && (
          <>
            <path d="M17 46 C17 26, 32 17, 48 17 C48 34, 38 47, 17 46 Z" strokeWidth="1" />
            <path d="M19 44 L40 25" stroke="#fffaf0" strokeWidth="2.5" fill="none" />
          </>
        )}
        {avatarId === 'etoile' && (
          <polygon
            points="32,13 37.5,26 51,27 40.5,36 44,50 32,42.5 20,50 23.5,36 13,27 26.5,26"
            strokeWidth="1"
          />
        )}
        {avatarId === 'vague' && (
          <g fill="none" strokeWidth="4.5">
            <path d="M13 27 Q22.5 17 32 27 T51 27" />
            <path d="M13 39 Q22.5 29 32 39 T51 39" strokeOpacity="0.55" />
          </g>
        )}
        {avatarId === 'prisme' && (
          <>
            <polygon points="32,13 50,32 32,51 14,32" fillOpacity="0.35" strokeWidth="2.5" />
            <polygon points="32,13 50,32 32,51" strokeWidth="1" />
          </>
        )}
      </g>
    </svg>
  );
};
