import type { SituationId } from '../types';
import type { Lang } from '../i18n/lang';

export type SchoolYear = 9 | 10 | 11;
export type ClassType = 'eb' | 'g' | 'pg';

export interface Situation {
  id: SituationId;
  schoolYear: SchoolYear | null;
  classType: ClassType | null;
}

const STAGE_BY_CLASS: Record<'fr' | 'de', Record<ClassType, string>> = {
  fr: { eb: 'co_eb', g: 'co_g', pg: 'co_pg' },
  de: { eb: 'os_real', g: 'os_sek', pg: 'os_progym' },
};

/** Les élèves du CO (ou de l'OS) et les personnes qui ne précisent pas partent d'une classe du secondaire I. */
export const isSchoolStart = (s: Situation): boolean => s.id === 'co' || s.id === 'non_precise';

/** Nœud de départ au secondaire I. Sans type de classe indiqué : classe G (ou Sekundarklasse en allemand). */
export function stageFor(s: Situation, lang: Lang): string {
  const table = STAGE_BY_CLASS[lang === 'de' ? 'de' : 'fr'];
  return table[s.classType ?? 'g'];
}

/**
 * Année de la fin du CO pour un élève de 9H, 10H ou 11H.
 * L'année scolaire commence en août : en février 2027, une 10H se termine à l'été 2027, le CO à l'été 2028.
 */
export function endOfCompulsorySchool(schoolYear: SchoolYear, now: Date = new Date()): number {
  const schoolYearStart = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return schoolYearStart + 1 + (11 - schoolYear);
}

/** Années de rentrée possibles en Bachelor, au plus tôt. null si l'année scolaire n'est pas connue. */
export function entryYears(s: Situation, yearsMin: number, yearsMax: number, now: Date = new Date()): [number, number] | null {
  if (s.id !== 'co' || !s.schoolYear) return null;
  const end = endOfCompulsorySchool(s.schoolYear, now);
  return [end + Math.ceil(yearsMin), end + Math.ceil(yearsMax)];
}
