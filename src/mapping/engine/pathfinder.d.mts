// Déclarations TypeScript pour pathfinder.mjs
import type { AccessType, Mapping, OccupationLevel, ValidationStatus } from './types';

export interface PathStep {
  type: 'training' | 'admission';
  trainingId?: string;
  credentialId?: string;
  condition?: string | null;
  ruleId?: string;
  programmeId?: string;
  requirementIds?: string[];
}

export interface FoundPath {
  steps: PathStep[];
  yearsBeforeEntry: number;
  access: AccessType;
  /** Qualificatifs supposés, ex. 'cfc_liste_filiere' = « si ton CFC figure dans la liste ». */
  assumptions: string[];
  validationStatus: ValidationStatus;
}

export function findPaths(m: Mapping, fromId: string, targetId: string, opts?: { maxDepth?: number; limit?: number }): FoundPath[];

export function careersFor(
  m: Mapping,
  programmeId: string,
): Partial<Record<OccupationLevel, { id: string; label: string; status: ValidationStatus; sourceIds: string[] }[]>>;
