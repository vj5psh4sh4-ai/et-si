import { ITEM_IDS, expressSequence, type Answers } from '../profile';
import type { CardChoice } from '../../types';

/** Profils de test de la proposition v0.3, sur l'échelle 0..3 du référentiel. */
const RAW: Record<string, Record<string, number>> = {
  lea: { q12: 3, q13: 3, q18: 3, q25: 3, q14: 2, q22: 3, q06: 2, q20: 2, q01: 0, q04: 0, q26: 0, q27: 0 },
  noah: { q01: 3, q02: 3, q04: 3, q27: 3, q03: 2, q07: 2, q23: 2, q12: 0, q13: 0, q14: 0, q17: 0, q25: 0 },
  ines: { q09: 3, q10: 3, q11: 3, q16: 3, q24: 3, q05: 2, q22: 2, q25: 2, q02: 0, q19: 0, q20: 0, q26: 0 },
  malik: { q03: 3, q08: 3, q26: 3, q19: 3, q30: 2, q02: 2, q22: 2, q05: 1, q13: 0, q24: 0 },
};

/** Trois boutons au lieu de quatre : 0 et 1 -> non, 2 -> peut-être, 3 -> oui. */
const toChoice = (v: number): CardChoice => (v >= 3 ? 2 : v >= 2 ? 1 : 0);

export type PersonaId = keyof typeof RAW;

export function fullAnswers(id: PersonaId): Answers {
  return Object.fromEntries(ITEM_IDS.map((q) => [q, toChoice(RAW[id][q] ?? 1)]));
}

/** Joue le parcours express comme le ferait la personne. */
export function playExpress(id: PersonaId): Answers {
  const full = fullAnswers(id);
  const answers: Answers = {};
  for (let guard = 0; guard < 40; guard++) {
    const next = expressSequence(answers).find((q) => answers[q] === undefined);
    if (!next) break;
    answers[next] = full[next];
  }
  return answers;
}
