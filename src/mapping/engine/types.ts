// Types du mapping « Et si… » : voies d'accès et débouchés HES-SO Fribourg.
// Compatibles avec src/types.ts du dépôt (ValidationStatus, ActivityTag, SituationId).

export type ValidationStatus = 'demo' | 'to_review' | 'validated';

export type ActivityTag =
  | 'ecouter' | 'accompagner' | 'concevoir' | 'analyser'
  | 'organiser' | 'soigner' | 'construire' | 'coordonner';

export type SchoolId = 'heia' | 'heg' | 'heds' | 'hets';

export type AccessType = 'direct' | 'conditionnel' | 'sur_dossier' | 'non_admis';

export interface Source {
  id: string;
  title: string;
  url: string;
  consultedAt: string; // AAAA-MM-JJ
}

/** Point de départ : classe du CO / de l'OS, ou situation adulte. */
export interface Stage {
  id: string;
  label: string;
  lang: 'fr' | 'de';
  sourceIds: string[];
}

/** Titre obtenu (secondaire II, ES, passerelle). */
export interface Credential {
  id: string;
  label: string;
  level: 'secondaire_II' | 'tertiaire_B' | 'passerelle';
}

/** Formation : relie un point de départ ou un titre à un ou plusieurs titres. */
export interface Training {
  id: string;
  label: string;
  entryFrom: { from: string; condition?: string }[]; // Stage.id ou Credential.id
  credentialIds: string[];
  durationYears: { min: number; max: number };
  schools: string[];
  grantsQualifiers: string[]; // ex. 'cfc_liste_filiere:ba_heg_ee'
  fixedCfc: boolean; // true si la formation impose un CFC précis (EC, ESSG, EMF, eikon)
  note: string | null;
  sourceIds: string[];
  validationStatus: ValidationStatus;
  reviewedAt: string;
}

export interface Requirement {
  id: string;
  label: string;
  addsYearsBeforeEntry: number;
  addsYearsToStudies: number;
  sourceIds: string[];
}

export interface Programme {
  id: string;
  school: SchoolId;
  degree: 'bachelor' | 'master';
  title: string;
  durationYears: number;
  languages: string[];
  modes: ('plein_temps' | 'temps_partiel' | 'en_emploi' | 'pibs')[];
  orientations: string[];
  regulated: boolean;
  location: string;
  nextProgrammeIds: string[];
  activityTags: ActivityTag[];
  activityTagsStatus: ValidationStatus;
  note: string | null;
  sourceIds: string[];
  validationStatus: ValidationStatus;
  reviewedAt: string;
}

/** Règle d'admission : titre d'entrée (ou Bachelor pour un Master) vers programme. */
export interface AdmissionRule {
  id: string;
  programmeId: string;
  credentialId: string; // Credential.id ou Programme.id (Bachelor)
  qualifier: string | null; // ex. 'cfc_liste_filiere', 'cfc_ase', 'es_domaine'
  access: AccessType;
  requirementIds: string[];
  note: string | null;
  sourceIds: string[];
  validationStatus: ValidationStatus;
  reviewedAt: string;
}

export interface Occupation {
  id: string;
  label: string;
}

export type OccupationLevel =
  | 'metier' | 'poste' | 'specialisation' | 'evolution' | 'master' | 'secteur' | 'piste';

export interface ProgrammeOccupation {
  programmeId: string;
  occupationId: string;
  level: OccupationLevel;
  sourceIds: string[];
  validationStatus: ValidationStatus;
  reviewedAt: string;
}

export interface CfcList {
  sourceId: string;
  cfc: string[];
  complete: boolean;
  note?: string;
}

export interface ExamplePath {
  id: string;
  programmeId: string;
  label: string;
  steps: string[];
  minYearsBeforeEntry: number;
  access: AccessType;
  validationStatus: ValidationStatus;
}

export interface Mapping {
  meta: { version: string; generatedAt: string; scope: string; disclaimer: string };
  sources: Source[];
  stages: Stage[];
  credentials: Credential[];
  trainings: Training[];
  requirements: Requirement[];
  programmes: Programme[];
  cfcLists: Record<string, CfcList>;
  admissionRules: AdmissionRule[];
  occupations: Occupation[];
  programmeOccupations: ProgrammeOccupation[];
  examplePaths: ExamplePath[];
}

/** Lien avec les situations du jeu (SituationId de src/types.ts). */
export const SITUATION_TO_STAGES: Record<string, string[]> = {
  co: ['co_eb', 'co_g', 'co_pg', 'os_real', 'os_sek', 'os_progym'],
  apprentissage: ['cr_cfc', 'cr_cfc_mp'],
  college: ['cr_mat_gym'],
  ecg: ['cr_ecg_sante', 'cr_ecg_ts', 'cr_ecg_ped'],
  autre: ['adulte_25', 'cr_es'],
  non_precise: ['co_g'],
};

// ---------------------------------------------------------------------------
// Couche « profil » : envies, intérêts, qualités, conditions (data/profile-mapping.json)

export type ProfessionLevel = 'afp' | 'cfc' | 'hes';
export type ConditionAxis = 'lieu' | 'social' | 'physique' | 'methode' | 'clientele' | 'ordinateur' | 'manuel';
export type InterestKind = 'activite' | 'matiere' | 'cadre';
export type QualityFamily =
  | 'cognitive' | 'relationnelle' | 'organisation' | 'engagement'
  | 'creative' | 'manuelle_sensorielle' | 'resistance' | 'scolaire' | 'contrainte';
export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

/** Intérêt du moteur orientation.ch (37 valeurs, identifiant officiel conservé). */
export interface Interest {
  id: string;
  label: string;
  orientationId: string;
  kind: InterestKind;
  /** Pont vers les tags du jeu (proposition de travail). */
  activityTags: ActivityTag[];
  /** Repère Holland, modèle de travail non utilisé par orientation.ch. */
  riasec: Riasec | null;
  conditions: Partial<Record<ConditionAxis, -1 | 1>>;
  sourceIds: string[];
  mappingStatus: ValidationStatus;
}

/** Qualité requise orientation.ch (76 valeurs). kind 'contrainte' : point d'attention, pas de score. */
export interface Quality {
  id: string;
  label: string;
  orientationId: string;
  kind: 'qualite' | 'contrainte';
  family: QualityFamily;
  schoolSubjects: string[];
  sourceIds: string[];
  mappingStatus: ValidationStatus;
}

export interface ConditionDef { id: ConditionAxis; label: string; min: string; max: string; sourceIds: string[] }

/** Profil d'une profession AFP, CFC ou HES. */
export interface ProfessionProfile {
  id: string;
  level: ProfessionLevel;
  label: string;
  orientationSlug: string | null;
  interests: string[];
  qualities: string[];
  constraints: string[];
  /** Déduites des intérêts (ex. « Travailler à l'extérieur » -> lieu +1). */
  conditions: Partial<Record<ConditionAxis, number>>;
  activityTags: ActivityTag[];
  /** Bachelors auxquels mène directement ce métier HES. */
  programmeIds: string[];
  /** Bachelors dont la liste de CFC contient ce CFC (accès direct avec MP). */
  directAccessProgrammeIds: string[];
  basis: string;
  note: string | null;
  sourceIds: string[];
  validationStatus: ValidationStatus;
  reviewedAt: string;
}

export interface ProgrammeProfile {
  programmeId: string;
  profileIds: string[];
  inheritsFrom?: string[];
  interests: Record<string, number>;
  qualities: Record<string, number>;
  validationStatus: ValidationStatus;
  reviewedAt: string;
}

export interface QuestionnaireItem {
  id: string;
  text: string;
  /** Poids par intérêt ; un poids négatif inverse la réponse. */
  interests: Record<string, number>;
  conditions: Partial<Record<ConditionAxis, -1 | 1>>;
}

export interface ProfileMapping {
  meta: { version: string; generatedAt: string; scope: string; disclaimer: string; taxonomy: string };
  sources: Source[];
  interests: Interest[];
  qualities: Quality[];
  qualityFamilies: { id: QualityFamily; label: string }[];
  schoolSubjects: { id: string; label: string }[];
  conditions: ConditionDef[];
  profiles: ProfessionProfile[];
  programmeProfiles: ProgrammeProfile[];
  questionnaire: {
    scale: { value: number; label: string }[];
    prompt: string;
    sourceIds: string[];
    validationStatus: ValidationStatus;
    items: QuestionnaireItem[];
    qualityItems: { id: string; text: string; qualities: string[] }[];
  };
  tagToInterests: Partial<Record<ActivityTag, Record<string, number>>>;
}

/** Profil de la personne, calculé localement (jamais envoyé à un serveur). */
export interface UserProfile {
  interests: Record<string, number>;
  qualities: Record<string, number>;
  conditions: Partial<Record<ConditionAxis, number>>;
}
