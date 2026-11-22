// Déclarations TypeScript pour matching.mjs
import type { Mapping, ProfileMapping, UserProfile, ValidationStatus, ProfessionLevel } from './types';

export interface ProfileMatch {
  profileId: string;
  label: string;
  level: ProfessionLevel;
  /** 0..100 : correspondance entre ce que la personne aime et ce que la profession demande. */
  score: number;
  interestScore: number;
  qualityScore: number;
  /** 0..100 : part des critères de la profession effectivement questionnés. */
  coverage: number;
  matchedInterests: string[];
  matchedQualities: string[];
  conditionConflicts: string[];
  constraints: string[];
  validationStatus: ValidationStatus;
  sourceIds: string[];
}

export interface ProgrammeMatch {
  programmeId: string;
  title: string;
  school: string;
  score: number;
  matchedInterests: string[];
  matchedQualities: string[];
  professions: string[];
  masters: string[];
  validationStatus: ValidationStatus;
}

export interface Bridge extends ProfileMatch {
  directAccess: { programmeId: string; title?: string; programmeScore: number | null }[];
}

export function profileFromAnswers(pm: ProfileMapping, answers?: Record<string, number>, qualityAnswers?: Record<string, number>): UserProfile;
export function profileFromTags(pm: ProfileMapping, tagScores?: Record<string, number>): UserProfile;
export function mergeProfiles(a: UserProfile, b: UserProfile, weightA?: number): UserProfile;
export function matchProfile(pm: ProfileMapping, user: UserProfile, profile: ProfileMapping['profiles'][number]): ProfileMatch;
export function rankProfiles(pm: ProfileMapping, user: UserProfile, opts?: { levels?: ProfessionLevel | ProfessionLevel[]; limit?: number }): ProfileMatch[];
export function rankProgrammes(pm: ProfileMapping, m: Mapping, user: UserProfile, opts?: { limit?: number }): ProgrammeMatch[];
export function bridges(pm: ProfileMapping, m: Mapping, user: UserProfile, opts?: { limit?: number }): Bridge[];
export function cfcRoutesTo(pm: ProfileMapping, user: UserProfile, programmeId: string): ProfileMatch[];
export function affinity(pm: ProfileMapping, profileId: string, programmeId: string): number | null;
