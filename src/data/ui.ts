import type { ActivityTag, FeedbackValue } from '../types';

/** Couleurs des quatre écoles, utilisées sur les lames, les portes et les fiches. */
export const TRACK_COLORS: Record<string, { main: string; soft: string; ink: string }> = {
  heia: { main: '#2f5fd0', soft: '#e3ebfb', ink: '#1c3c8c' },
  heg: { main: '#d9701c', soft: '#fbecdc', ink: '#8a430a' },
  heds: { main: '#0f8f7c', soft: '#dcf2ee', ink: '#0a5b4f' },
  hets: { main: '#b23b84', soft: '#f6e1ee', ink: '#7a2459' },
};

export const TAG_LABELS: Record<ActivityTag, string> = {
  ecouter: 'Écouter',
  accompagner: 'Accompagner',
  concevoir: 'Concevoir',
  analyser: 'Analyser',
  organiser: 'Organiser',
  soigner: 'Prendre soin',
  construire: 'Construire',
  coordonner: 'Coordonner',
};

export const FEEDBACK_OPTIONS: { id: FeedbackValue; label: string; hint: string }[] = [
  { id: 'refaire', label: 'La refaire', hint: 'Ça m’a plu, j’en reprendrais.' },
  { id: 'en_vrai', label: 'La découvrir en vrai', hint: 'J’aimerais voir ce que ça donne pour de vrai.' },
  { id: 'autre_chose', label: 'Essayer autre chose', hint: 'Pas pour moi en ce moment.' },
  { id: 'ne_sais_pas', label: 'Je ne sais pas encore', hint: 'Trop tôt pour le dire.' },
];

export const FEEDBACK_SHORT: Record<FeedbackValue, string> = {
  refaire: 'À refaire',
  en_vrai: 'À découvrir en vrai',
  autre_chose: 'Autre chose pour l’instant',
  ne_sais_pas: 'Je ne sais pas encore',
};

export const ENTRY_GATES = [
  {
    id: 'decouvre' as const,
    kicker: 'Porte 1',
    title: 'Je découvre ce qui me plaît',
    desc: 'Pars d’activités qui t’intriguent. Aucune connaissance préalable n’est nécessaire.',
  },
  {
    id: 'objectif' as const,
    kicker: 'Porte 2',
    title: 'J’ai un objectif',
    desc: 'Tu as déjà une direction en tête. Teste ce qu’elle implique au quotidien.',
  },
  {
    id: 'idee' as const,
    kicker: 'Porte 3',
    title: 'J’ai une idée',
    desc: 'Tu veux créer, résoudre ou améliorer quelque chose. Découvre ce qu’il faudrait apprendre.',
  },
];
