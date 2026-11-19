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

export const AvatarIcon: React.FC<{ avatarId: string; color: string; size?: number }> = ({
  avatarId,
  color,
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Avatar ${avatarId}`}
      className="avatar-svg"
    >
      <rect width="64" height="64" rx="18" fill={color} fillOpacity="0.14" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      {avatarId === 'boussole' && (
        <g stroke={color} strokeWidth="2.5" fill="none">
          <circle cx="32" cy="32" r="16" />
          <polygon points="32,18 37,32 32,46 27,32" fill={color} fillOpacity="0.8" />
        </g>
      )}
      {avatarId === 'montagne' && (
        <g fill={color}>
          <polygon points="14,46 28,20 42,46" fillOpacity="0.85" />
          <polygon points="30,46 42,26 52,46" fillOpacity="0.5" />
        </g>
      )}
      {avatarId === 'feuille' && (
        <g stroke={color} strokeWidth="2.5" fill="none">
          <path d="M18 44 C18 24, 34 16, 48 16 C48 32, 38 46, 18 44 Z" fill={color} fillOpacity="0.25" />
          <path d="M18 44 L40 24" />
        </g>
      )}
      {avatarId === 'etoile' && (
        <polygon
          points="32,14 37,26 50,27 40,36 43,49 32,42 21,49 24,36 14,27 27,26"
          fill={color}
          fillOpacity="0.85"
        />
      )}
      {avatarId === 'vague' && (
        <g stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d="M14 28 Q23 18 32 28 T50 28" />
          <path d="M14 40 Q23 30 32 40 T50 40" opacity="0.6" />
        </g>
      )}
      {avatarId === 'prisme' && (
        <g stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.25">
          <polygon points="32,14 50,32 32,50 14,32" />
          <line x1="32" y1="14" x2="32" y2="50" />
        </g>
      )}
    </svg>
  );
};

export const MissionIllustration: React.FC<{ id: 'lieu' | 'autonomie' | 'campus' | 'evenement' }> = ({
  id,
}) => {
  return (
    <svg
      viewBox="0 0 320 96"
      className="mission-banner-svg"
      aria-hidden="true"
    >
      <rect width="320" height="96" rx="14" fill="#eef2ff" />
      {id === 'lieu' && (
        <g>
          <rect x="34" y="34" width="76" height="44" rx="6" fill="#c7d2fe" />
          <polygon points="28,36 72,14 116,36" fill="#6366f1" />
          <circle cx="170" cy="48" r="14" fill="#34d399" />
          <circle cx="204" cy="54" r="10" fill="#60a5fa" />
          <rect x="240" y="30" width="48" height="48" rx="10" fill="#fde68a" />
        </g>
      )}
      {id === 'autonomie' && (
        <g>
          <circle cx="64" cy="48" r="24" fill="#bfdbfe" />
          <path d="M54 48 L62 56 L76 40" stroke="#1d4ed8" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="116" y="28" width="84" height="40" rx="10" fill="#ddd6fe" />
          <circle cx="246" cy="48" r="18" fill="#a7f3d0" />
        </g>
      )}
      {id === 'campus' && (
        <g>
          <rect x="32" y="26" width="60" height="46" rx="8" fill="#bae6fd" />
          <rect x="112" y="18" width="96" height="58" rx="10" fill="#93c5fd" />
          <circle cx="256" cy="48" r="20" fill="#fcd34d" />
        </g>
      )}
      {id === 'evenement' && (
        <g>
          <circle cx="60" cy="48" r="18" fill="#fbcfe8" />
          <circle cx="110" cy="42" r="22" fill="#c4b5fd" />
          <circle cx="164" cy="52" r="16" fill="#99f6e4" />
          <rect x="210" y="26" width="76" height="44" rx="12" fill="#fde68a" />
        </g>
      )}
    </svg>
  );
};
