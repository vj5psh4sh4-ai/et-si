// Accès unique au référentiel copié dans src/mapping (voir scripts/sync-mapping.mjs).
// La couche applicative ne modifie jamais ces données : elle décide seulement quoi montrer.
import mappingJson from '../mapping/data/mapping.json';
import profileJson from '../mapping/data/profile-mapping.json';
import versionJson from '../mapping/VERSION.json';
import type {
  AdmissionRule,
  Credential,
  Mapping,
  ProfileMapping,
  Programme,
  Requirement,
  SchoolId,
  Source,
  Stage,
  Training,
} from '../mapping/engine/types';

export const M = mappingJson as unknown as Mapping;
export const PM = profileJson as unknown as ProfileMapping;
export const MAPPING_VERSION = `${versionJson.mapping}+${versionJson.profileMapping}`;
export const MAPPING_DATE = versionJson.generatedAt;

const index = <T extends { id: string }>(list: T[]): Record<string, T> => Object.fromEntries(list.map((x) => [x.id, x]));

export const PROGRAMMES: Record<string, Programme> = index(M.programmes);
export const TRAININGS: Record<string, Training> = index(M.trainings);
export const CREDENTIALS: Record<string, Credential> = index(M.credentials);
export const REQUIREMENTS: Record<string, Requirement> = index(M.requirements);
export const RULES: Record<string, AdmissionRule> = index(M.admissionRules);
export const SOURCES: Record<string, Source> = index(M.sources);
export const STAGES: Record<string, Stage> = index(M.stages);

export const SCHOOL_ORDER: SchoolId[] = ['heia', 'heg', 'heds', 'hets'];

/** Les dix Bachelors, dans un ordre stable (école, puis ordre du référentiel). */
export const BACHELORS: Programme[] = M.programmes
  .filter((p) => p.degree === 'bachelor')
  .sort((a, b) => SCHOOL_ORDER.indexOf(a.school) - SCHOOL_ORDER.indexOf(b.school));

export const BACHELOR_IDS: string[] = BACHELORS.map((p) => p.id);
