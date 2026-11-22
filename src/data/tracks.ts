import type { SituationId } from '../types';

export const SITUATION_LABELS: Record<SituationId, string> = {
  co: 'Au CO / à l’école obligatoire',
  apprentissage: 'En apprentissage',
  college: 'Au collège / gymnase',
  ecg: 'À l’ECG',
  autre: 'Dans une autre situation',
  non_precise: 'Non précisée',
};

export const REFLECTION_LABELS = {
  decouvre: 'Je découvre',
  hesite: 'J’hésite',
  objectif: 'J’ai un objectif',
  idee: 'J’ai une idée à réaliser',
};
