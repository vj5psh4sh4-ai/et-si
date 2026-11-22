// Politique d'affichage (règle 7 de la proposition v0.3) : le statut de validation commande l'affichage.
// - validated : affichage normal, avec la source.
// - to_review : affichage avec la mention « information à confirmer auprès de l'école ».
// - demo      : visible seulement si SHOW_DEMO est vrai, avec la mention « version de test ».
//
// Décision 5 (« que montre-t-on si la relecture n'est pas terminée ? ») n'a pas encore de réponse.
// Par défaut, le prototype montre les éléments démo avec leur mention. Pour une mise en production,
// construire avec VITE_SHOW_DEMO=0 : le questionnaire (statut démo) disparaît alors de l'application.
import type { ValidationStatus } from '../mapping/engine/types';

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const SHOW_DEMO: boolean = env.VITE_SHOW_DEMO !== '0';

export const isVisible = (status: ValidationStatus): boolean => status !== 'demo' || SHOW_DEMO;

/** Couverture minimale des intérêts d'une filière pour qu'elle figure sur le panneau (règle 1). */
export const MIN_COVERAGE = 0.5;

/** Valeur moteur (0..3) des trois réponses d'une carte : non, peut-être, oui. Proposition à tester. */
export const CHOICE_VALUES = [0, 1.5, 3] as const;

/** Valeur moteur des retours de mission (règle 9). « Je ne sais pas » reste non renseigné. */
export const FEEDBACK_VALUES: Record<string, number | null> = {
  refaire: 3,
  en_vrai: 2,
  autre_chose: 0,
  ne_sais_pas: null,
};

/** Poids des cartes face aux missions lors de la fusion des deux profils. Proposition à relire. */
export const CARDS_WEIGHT = 0.6;

/** Adresse publique utilisée dans les liens et codes QR (décision 7 en attente : adresse stable à fixer). */
export const PUBLIC_URL: string | null = env.VITE_PUBLIC_URL ?? null;

export const STAND_IDLE_SECONDS = 45;
export const STAND_WARNING_SECONDS = 10;
