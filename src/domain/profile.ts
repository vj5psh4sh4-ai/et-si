// Règles 1, 2, 3 et 9 : couverture minimale, égalités conservées, aucune note affichée,
// et un seul profil nourri par les cartes et par les missions.
import { mergeProfiles, profileFromAnswers, rankProgrammes } from '../mapping/engine/matching.mjs';
import type { UserProfile } from '../mapping/engine/types';
import type { ActivityFeedback } from '../types';
import { BACHELOR_IDS, M, PM, PROGRAMMES } from './data';
import { CARDS_WEIGHT, CHOICE_VALUES, FEEDBACK_VALUES, MIN_COVERAGE } from './policy';

/** Réponse à une carte : 0 = non, 1 = peut-être, 2 = oui. */
export type CardChoice = 0 | 1 | 2;
export type Answers = Record<string, CardChoice>;

export const ITEM_IDS: string[] = PM.questionnaire.items.map((i) => i.id);
export const QUALITY_ITEM_IDS: string[] = PM.questionnaire.qualityItems.map((i) => i.id);
const ITEMS = Object.fromEntries(PM.questionnaire.items.map((i) => [i.id, i]));
const PROGRAMME_INTERESTS: Record<string, Record<string, number>> = Object.fromEntries(
  PM.programmeProfiles.map((pp) => [pp.programmeId, pp.interests]),
);

const I = {
  contacts: 'in_avoir_des_contacts_avec_d_autres_personn',
  conseiller: 'in_conseiller',
  informer: 'in_informer_et_sensibiliser',
  construire: 'in_planifier_construire_dessin_technique',
  creer: 'in_dessiner_decorer_creer',
  organiser: 'in_planifier_organiser',
  chiffres: 'in_travailler_avec_des_chiffres',
  diriger: 'in_diriger_et_assumer_des_responsabilites',
  soigner: 'in_aider_et_soigner_les_autres',
  experimenter: 'in_experimenter_rechercher',
  technique: 'in_realiser_des_taches_techniques',
  mains: 'in_travailler_avec_ses_mains',
  machines: 'in_travailler_avec_des_machines',
  equipe: 'in_travailler_en_equipe',
  ordinateur: 'in_travailler_a_l_ordinateur',
  enfants: 'in_travailler_avec_des_enfants',
} as const;

/**
 * Intérêts mis en jeu par chaque rôle de mission. Proposition de travail (statut « à relire ») :
 * elle remplace le pont par étiquettes de la v0.2 par un lien direct avec les 37 intérêts du référentiel.
 */
export const MISSION_INTERESTS: Record<string, Record<string, number>> = {
  'lieu-ecouter': { [I.contacts]: 1, [I.conseiller]: 0.5, [I.informer]: 0.5 },
  'lieu-espaces': { [I.construire]: 1, [I.creer]: 1 },
  'lieu-organiser': { [I.organiser]: 1, [I.chiffres]: 0.5, [I.diriger]: 0.5 },
  'lieu-bienetre': { [I.soigner]: 1, [I.experimenter]: 0.5 },
  'auto-soins': { [I.soigner]: 1, [I.contacts]: 0.5 },
  'auto-technique': { [I.technique]: 1, [I.mains]: 0.5, [I.construire]: 0.5, [I.machines]: 0.5 },
  'auto-entourage': { [I.conseiller]: 1, [I.contacts]: 1, [I.soigner]: 0.5, [I.equipe]: 0.5 },
  'campus-modele': { [I.organiser]: 1, [I.chiffres]: 1, [I.diriger]: 0.5 },
  'campus-numerique': { [I.ordinateur]: 1, [I.organiser]: 0.3, [I.creer]: 0.3 },
  'campus-inclusion': { [I.informer]: 1, [I.contacts]: 1, [I.soigner]: 0.5 },
  'evt-coord': { [I.organiser]: 1, [I.diriger]: 1, [I.equipe]: 0.5 },
  'evt-sante': { [I.soigner]: 1, [I.informer]: 0.5 },
  'evt-liens': { [I.contacts]: 1, [I.equipe]: 0.5, [I.informer]: 0.5, [I.enfants]: 0.3 },
};
export const MISSION_ACTIVITY_IDS: string[] = Object.keys(MISSION_INTERESTS);

const toEngine = (a: Record<string, CardChoice>): Record<string, number> =>
  Object.fromEntries(Object.entries(a).map(([k, v]) => [k, CHOICE_VALUES[v]]));

export function cardsProfile(answers: Answers, qualityAnswers: Answers = {}): UserProfile {
  return profileFromAnswers(PM, toEngine(answers), toEngine(qualityAnswers));
}

export function missionsProfile(feedbacks: ActivityFeedback[]): UserProfile {
  const acc: Record<string, { s: number; w: number }> = {};
  for (const f of feedbacks) {
    const value = FEEDBACK_VALUES[f.feedback];
    const weights = MISSION_INTERESTS[f.choiceId];
    if (value === null || value === undefined || !weights) continue;
    for (const [id, w] of Object.entries(weights)) {
      const o = (acc[id] ??= { s: 0, w: 0 });
      o.s += (value / 3) * w;
      o.w += w;
    }
  }
  return {
    interests: Object.fromEntries(Object.entries(acc).map(([k, o]) => [k, o.s / o.w])),
    qualities: {},
    conditions: {},
  };
}

export interface ProfileInput {
  answers: Answers;
  qualityAnswers?: Answers;
  feedbacks?: ActivityFeedback[];
}

/** Profil unique de la personne. Calculé à la volée, jamais enregistré (règle 8). */
export function buildProfile({ answers, qualityAnswers = {}, feedbacks = [] }: ProfileInput): UserProfile {
  const cards = cardsProfile(answers, qualityAnswers);
  const missions = missionsProfile(feedbacks);
  if (!Object.keys(missions.interests).length) return cards;
  if (!Object.keys(cards.interests).length && !Object.keys(cards.qualities).length) return missions;
  return mergeProfiles(cards, missions, CARDS_WEIGHT);
}

/** Part des intérêts d'une filière sur lesquels la personne s'est exprimée (0..1). */
export function coverageOf(programmeId: string, user: UserProfile): number {
  const wanted = PROGRAMME_INTERESTS[programmeId] ?? {};
  let known = 0;
  let total = 0;
  for (const [id, w] of Object.entries(wanted)) {
    total += w;
    if (user.interests[id] !== undefined) known += w;
  }
  return total ? known / total : 0;
}

export interface Reason {
  kind: 'card' | 'mission';
  id: string;
  weight: number;
}

const REASON_MIN = 0.5;

/** Ce que la personne a dit aimer et que la filière demande. Jamais un chiffre. */
export function reasonsFor(programmeId: string, { answers, feedbacks = [] }: ProfileInput): Reason[] {
  const wanted = PROGRAMME_INTERESTS[programmeId] ?? {};
  const out: Reason[] = [];
  const link = (weights: Record<string, number>) =>
    Object.entries(weights).reduce((best, [id, w]) => (w > 0 && wanted[id] ? Math.max(best, w * wanted[id]) : best), 0);
  for (const id of ITEM_IDS) {
    if (answers[id] !== 2) continue;
    const weight = link(ITEMS[id].interests);
    if (weight >= REASON_MIN) out.push({ kind: 'card', id, weight });
  }
  const seen = new Set<string>();
  for (const f of feedbacks) {
    if (f.feedback !== 'refaire' && f.feedback !== 'en_vrai') continue;
    if (seen.has(f.choiceId)) continue;
    seen.add(f.choiceId);
    const weight = link(MISSION_INTERESTS[f.choiceId] ?? {});
    if (weight >= REASON_MIN) out.push({ kind: 'mission', id: f.choiceId, weight });
  }
  return out.sort((a, b) => b.weight - a.weight);
}

export interface Ranked {
  programmeId: string;
  /** Note interne de classement. Jamais affichée au visiteur (règle 3). */
  score: number;
  coverage: number;
  reasons: Reason[];
  eligible: boolean;
}

export interface PanelResult {
  status: 'ready' | 'empty';
  /** Trois destinations, plus les ex æquo du troisième rang (cinq au maximum). */
  trio: Ranked[];
  /** Meilleure filière d'une école absente du trio : la lame en pointillé. */
  aside: Ranked | null;
  all: Ranked[];
  answered: number;
}

export const TRIO_SIZE = 3;
export const TRIO_MAX = 5;

export function rankAll(input: ProfileInput): Ranked[] {
  const user = buildProfile(input);
  const scores = new Map(rankProgrammes(PM, M, user, { limit: 99 }).map((r) => [r.programmeId, r.score]));
  return BACHELOR_IDS.map((programmeId) => {
    const coverage = coverageOf(programmeId, user);
    const reasons = reasonsFor(programmeId, input);
    return {
      programmeId,
      score: scores.get(programmeId) ?? 0,
      coverage,
      reasons,
      eligible: coverage >= MIN_COVERAGE && reasons.length > 0,
    };
  }).sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length || BACHELOR_IDS.indexOf(a.programmeId) - BACHELOR_IDS.indexOf(b.programmeId));
}

export function computePanel(input: ProfileInput): PanelResult {
  const all = rankAll(input);
  const answered = Object.keys(input.answers).length + (input.feedbacks?.length ?? 0);
  const eligible = all.filter((r) => r.eligible);
  if (!eligible.length) return { status: 'empty', trio: [], aside: null, all, answered };
  const cut = eligible[Math.min(TRIO_SIZE, eligible.length) - 1].score;
  const trio = eligible.filter((r) => r.score >= cut).slice(0, TRIO_MAX);
  const schools = new Set(trio.map((r) => PROGRAMMES[r.programmeId].school));
  const inTrio = new Set(trio.map((r) => r.programmeId));
  const aside =
    all.find((r) => !inTrio.has(r.programmeId) && !schools.has(PROGRAMMES[r.programmeId].school) && r.eligible) ?? null;
  return { status: 'ready', trio, aside, all, answered };
}

// --- Parcours express ---------------------------------------------------------------------------

/** Les huit cartes fixes : au moins deux par école, dans un ordre qui alterne les domaines. */
export const EXPRESS_FIXED = ['q05', 'q04', 'q03', 'q07', 'q16', 'q02', 'q12', 'q15'];
export const EXPRESS_ADAPTIVE = 4;
export const EXPRESS_BONUS = 2;

function pickAdaptive(answers: Answers, exclude: string[], count: number): string[] {
  const user = cardsProfile(answers);
  const top = rankProgrammes(PM, M, user, { limit: 99 })
    .filter((r) => BACHELOR_IDS.includes(r.programmeId))
    .slice(0, 4)
    .map((r) => PROGRAMME_INTERESTS[r.programmeId] ?? {});
  const skip = new Set(exclude);
  return ITEM_IDS.filter((id) => !skip.has(id))
    .map((id) => {
      let score = 0;
      for (const wanted of top) {
        for (const [interest, w] of Object.entries(ITEMS[id].interests)) {
          if (w <= 0 || !wanted[interest]) continue;
          score += w * wanted[interest] * (user.interests[interest] === undefined ? 3 : 1);
        }
      }
      return { id, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || ITEM_IDS.indexOf(a.id) - ITEM_IDS.indexOf(b.id))
    .slice(0, count)
    .map((x) => x.id);
}

const subset = (answers: Answers, ids: string[]): Answers =>
  Object.fromEntries(ids.filter((id) => answers[id] !== undefined).map((id) => [id, answers[id]]));

/**
 * Suite des cartes du parcours express, selon les réponses déjà données.
 * Les cartes adaptatives ne dépendent que des huit premières réponses : revenir en arrière ne change pas la suite.
 */
export function expressSequence(answers: Answers): string[] {
  const seq = [...EXPRESS_FIXED];
  if (!EXPRESS_FIXED.every((id) => answers[id] !== undefined)) return seq;
  seq.push(...pickAdaptive(subset(answers, EXPRESS_FIXED), seq, EXPRESS_ADAPTIVE));
  if (!seq.every((id) => answers[id] !== undefined)) return seq;
  // Cartes bonus : seulement si aucune destination n'atteint la couverture minimale.
  const panel = computePanel({ answers: subset(answers, seq) });
  if (panel.status === 'empty' && panel.all.some((r) => r.reasons.length > 0)) {
    seq.push(...pickAdaptive(subset(answers, seq), seq, EXPRESS_BONUS));
  }
  return seq;
}

/** Nombre de cartes annoncé au départ. */
export const EXPRESS_LENGTH = EXPRESS_FIXED.length + EXPRESS_ADAPTIVE;

/** Cartes restantes pour la version longue. */
export const remainingItems = (answers: Answers): string[] => ITEM_IDS.filter((id) => answers[id] === undefined);
export const remainingQualityItems = (answers: Answers): string[] => QUALITY_ITEM_IDS.filter((id) => answers[id] === undefined);
