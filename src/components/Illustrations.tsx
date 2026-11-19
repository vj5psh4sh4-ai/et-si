import React from 'react';

const INK = '#1b1f2a';
const PAPER = '#fffaf0';
const SIGN = '#f2c230';

/** Panneau indicateur jaune, clin d’œil aux sentiers pédestres suisses. */
export const SignpostMark: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="14.5" y="4" width="3" height="26" rx="1" fill={INK} />
    <path d="M5 7 H22 L27 10.5 L22 14 H5 Z" fill={SIGN} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M27 16 H10 L5 19.5 L10 23 H27 Z" fill={PAPER} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

/** Illustration d’accueil : Préalpes, lac, sentier qui bifurque et panneau à plusieurs directions. */
export const HeroLandscape: React.FC = () => (
  <svg viewBox="0 0 560 420" className="hero-svg" aria-hidden="true">
    <defs>
      <clipPath id="hero-clip">
        <rect width="560" height="420" rx="28" />
      </clipPath>
    </defs>
    <g clipPath="url(#hero-clip)">
      <rect width="560" height="420" fill="#dbe6ee" />
      <circle cx="430" cy="92" r="38" fill="#f6d97a" />
      {/* montagnes lointaines */}
      <path d="M0 210 L70 140 L120 175 L190 96 L260 168 L320 120 L390 178 L460 110 L560 190 V420 H0 Z" fill="#a9bfcf" />
      <path d="M190 96 L172 115 L184 112 L196 120 L206 108 Z" fill={PAPER} />
      <path d="M460 110 L444 128 L456 125 L468 132 L476 122 Z" fill={PAPER} />
      {/* collines */}
      <path d="M0 250 Q90 200 180 238 T380 230 T560 236 V420 H0 Z" fill="#7d9c8b" />
      {/* lac */}
      <path d="M0 268 Q140 252 300 270 T560 262 V300 Q380 290 230 300 T0 296 Z" fill="#8fb3cc" />
      <path d="M60 280 H120 M300 284 H350 M420 276 H470" stroke={PAPER} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* prairie */}
      <path d="M0 300 Q160 286 300 304 T560 296 V420 H0 Z" fill="#c9d9a8" />
      {/* sentiers qui bifurquent */}
      <path d="M250 420 C250 380, 270 360, 280 340" stroke="#efe3c8" strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M280 340 C300 318, 360 312, 420 300" stroke="#efe3c8" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M280 340 C262 318, 200 314, 130 304" stroke="#efe3c8" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M280 340 C286 324, 290 314, 300 306" stroke="#efe3c8" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M250 420 C250 380, 270 360, 280 340 C300 318, 360 312, 420 300" stroke={INK} strokeWidth="2" strokeDasharray="2 9" fill="none" strokeLinecap="round" />
      {/* sapins */}
      {[
        [70, 300, 1],
        [96, 310, 0.8],
        [470, 296, 1.1],
        [500, 306, 0.85],
        [40, 318, 0.7],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-3" y="-6" width="6" height="14" fill="#5a4632" />
          <polygon points="0,-58 -18,-4 18,-4" fill="#2f5d50" />
        </g>
      ))}
      {/* panneau indicateur */}
      <g transform="translate(330 220)">
        <rect x="-4" y="0" width="8" height="128" rx="2" fill="#6b5a46" />
        <g>
          <path d="M-8 6 H96 L114 22 L96 38 H-8 Z" fill={SIGN} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="6" y="18" width="62" height="8" rx="4" fill={INK} opacity="0.85" />
        </g>
        <g>
          <path d="M8 46 H-96 L-114 62 L-96 78 H8 Z" fill={SIGN} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="-86" y="58" width="54" height="8" rx="4" fill={INK} opacity="0.85" />
        </g>
        <g>
          <path d="M-8 86 H74 L92 102 L74 118 H-8 Z" fill={PAPER} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="6" y="98" width="44" height="8" rx="4" fill={INK} opacity="0.6" />
        </g>
        <path d="M-6 -8 H6 V-2 H-6 Z" fill="#e4572e" />
      </g>
      {/* points d’étapes */}
      <circle cx="420" cy="300" r="7" fill="#e4572e" stroke={INK} strokeWidth="2" />
      <circle cx="130" cy="304" r="7" fill="#2f5fd0" stroke={INK} strokeWidth="2" />
      <circle cx="300" cy="306" r="6" fill="#0f8f7c" stroke={INK} strokeWidth="2" />
    </g>
  </svg>
);

type MissionIllu = 'lieu' | 'autonomie' | 'campus' | 'evenement';

export const MISSION_ACCENTS: Record<MissionIllu, { bg: string; accent: string }> = {
  lieu: { bg: '#f7e3cf', accent: '#e4572e' },
  autonomie: { bg: '#dcebe6', accent: '#0f8f7c' },
  campus: { bg: '#dfe6f6', accent: '#2f5fd0' },
  evenement: { bg: '#f3dfea', accent: '#b23b84' },
};

/** Scènes de mission : formes simples, pas de personnages stéréotypés. */
export const MissionScene: React.FC<{ id: MissionIllu; className?: string }> = ({ id, className }) => {
  const { bg, accent } = MISSION_ACCENTS[id];
  return (
    <svg viewBox="0 0 400 220" className={className ?? 'mission-scene'} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill={bg} />
      <rect y="168" width="400" height="52" fill="#000" opacity="0.06" />
      {id === 'lieu' && (
        <g>
          {/* bâtiment en friche qui devient lieu de rencontre */}
          <rect x="70" y="70" width="170" height="100" fill={PAPER} stroke={INK} strokeWidth="3" />
          <path d="M60 74 L155 30 L250 74 Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <rect x="95" y="100" width="40" height="34" fill="#cfe0ea" stroke={INK} strokeWidth="2.5" />
          <rect x="175" y="110" width="40" height="60" fill={SIGN} stroke={INK} strokeWidth="2.5" />
          <circle cx="206" cy="142" r="3" fill={INK} />
          <path d="M100 60 h20 M190 60 h18" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          {/* bulles d’idées */}
          <circle cx="290" cy="80" r="22" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <circle cx="330" cy="56" r="14" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <circle cx="322" cy="110" r="10" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <path d="M282 80 h16 M290 72 v16" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
          {/* banc + plante */}
          <rect x="270" y="150" width="70" height="8" rx="3" fill={INK} />
          <rect x="278" y="158" width="5" height="12" fill={INK} />
          <rect x="327" y="158" width="5" height="12" fill={INK} />
          <path d="M360 170 q-6 -30 0 -44 q6 14 0 44" fill="#2f5d50" />
          <path d="M360 170 q-18 -20 -14 -34 q12 10 14 34" fill="#3f7a69" />
        </g>
      )}
      {id === 'autonomie' && (
        <g>
          {/* intérieur : fenêtre, table, objet adapté */}
          <rect x="40" y="36" width="120" height="96" rx="6" fill="#cfe0ea" stroke={INK} strokeWidth="3" />
          <path d="M100 36 V132 M40 84 H160" stroke={INK} strokeWidth="2.5" />
          <circle cx="132" cy="60" r="12" fill={SIGN} />
          <rect x="190" y="120" width="160" height="10" rx="3" fill={INK} />
          <rect x="204" y="130" width="8" height="40" fill={INK} />
          <rect x="328" y="130" width="8" height="40" fill={INK} />
          {/* tasse avec poignée adaptée */}
          <rect x="220" y="84" width="34" height="36" rx="6" fill={PAPER} stroke={INK} strokeWidth="3" />
          <path d="M254 92 h12 a8 8 0 0 1 0 18 h-12" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          {/* carnet / plan d’accompagnement */}
          <rect x="284" y="90" width="48" height="30" rx="3" fill={accent} stroke={INK} strokeWidth="2.5" />
          <path d="M292 100 h30 M292 108 h20" stroke={PAPER} strokeWidth="3" strokeLinecap="round" />
          {/* coche */}
          <circle cx="250" cy="52" r="20" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <path d="M240 52 l7 7 l13 -14" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 170 q10 -26 30 -30" stroke="#2f5d50" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
      {id === 'campus' && (
        <g>
          {/* bâtiment de campus + écran de réservation + boîte de prêt */}
          <rect x="30" y="58" width="150" height="112" fill={PAPER} stroke={INK} strokeWidth="3" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}-${c}`} x={44 + c * 33} y={72 + r * 30} width="22" height="18" fill="#cfe0ea" stroke={INK} strokeWidth="2" />
            ))
          )}
          <rect x="210" y="40" width="88" height="140" rx="14" fill={INK} />
          <rect x="218" y="54" width="72" height="108" rx="6" fill={PAPER} />
          <rect x="226" y="64" width="56" height="12" rx="6" fill={accent} />
          <rect x="226" y="84" width="40" height="8" rx="4" fill={INK} opacity="0.3" />
          <rect x="226" y="100" width="56" height="20" rx="4" fill="#dfe6f6" stroke={INK} strokeWidth="1.5" />
          <rect x="226" y="126" width="56" height="20" rx="4" fill="#dfe6f6" stroke={INK} strokeWidth="1.5" />
          <circle cx="272" cy="110" r="4" fill="#0f8f7c" />
          <circle cx="272" cy="136" r="4" fill="#e4572e" />
          <rect x="316" y="118" width="62" height="52" fill={SIGN} stroke={INK} strokeWidth="3" />
          <path d="M316 132 H378" stroke={INK} strokeWidth="2.5" />
          <circle cx="347" cy="104" r="12" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M347 92 v-8" stroke={INK} strokeWidth="3" />
        </g>
      )}
      {id === 'evenement' && (
        <g>
          {/* fanions, tente, tables */}
          <path d="M0 40 Q200 90 400 40" stroke={INK} strokeWidth="2" fill="none" />
          {[30, 80, 130, 180, 230, 280, 330, 370].map((x, i) => {
            const y = 40 + Math.sin((x / 400) * Math.PI) * 25 + 4;
            const fill = [accent, SIGN, '#2f5fd0', '#0f8f7c'][i % 4];
            return <path key={x} d={`M${x - 10} ${y - 4} L${x + 10} ${y - 4} L${x} ${y + 18} Z`} fill={fill} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />;
          })}
          <path d="M120 170 L190 90 L260 170 Z" fill={PAPER} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M190 90 L175 170 M190 90 L205 170" stroke={accent} strokeWidth="3" />
          <path d="M175 170 L190 130 L205 170 Z" fill={INK} />
          <rect x="40" y="140" width="56" height="8" rx="3" fill={INK} />
          <rect x="300" y="140" width="64" height="8" rx="3" fill={INK} />
          <circle cx="56" cy="128" r="9" fill={SIGN} stroke={INK} strokeWidth="2" />
          <circle cx="80" cy="130" r="7" fill="#2f5fd0" stroke={INK} strokeWidth="2" />
          <circle cx="318" cy="128" r="9" fill="#0f8f7c" stroke={INK} strokeWidth="2" />
          <circle cx="344" cy="126" r="11" fill={accent} stroke={INK} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};
