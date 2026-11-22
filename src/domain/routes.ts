// Règles 4, 5 et 6 : des chemins parlants regroupés par voie, des durées en fourchette,
// quatre types d'accès et aucun verdict.
import { findPaths, type FoundPath } from '../mapping/engine/pathfinder.mjs';
import type { AccessType, ValidationStatus } from '../mapping/engine/types';
import type { Lang } from '../i18n/lang';
import { M, REQUIREMENTS, RULES, TRAININGS } from './data';
import { isSchoolStart, stageFor, type Situation } from './situation';

export type VariantId =
  | 'apprentissage' | 'ecole_metiers' | 'ecg' | 'college'
  | 'cfc_mp' | 'cfc_mp2'
  | 'ecg_sante' | 'ecg_ts' | 'ecg_ped'
  | 'maturite'
  | 'dossier' | 'es';

export type VariantChoice = VariantId | 'auto';

export const ALL_VARIANTS: VariantId[] = [
  'apprentissage', 'ecole_metiers', 'ecg', 'college', 'cfc_mp', 'cfc_mp2', 'ecg_sante', 'ecg_ts', 'ecg_ped', 'maturite', 'dossier', 'es',
];

export interface TrainingStep {
  kind: 'training';
  trainingId: string;
  credentialId: string;
  /** Condition d'entrée dans la formation, telle qu'écrite dans le référentiel. */
  condition: string | null;
  durMin: number;
  durMax: number;
  status: ValidationStatus;
  /** Vrai quand plusieurs maturités spécialisées mènent au même résultat : l'étape s'affiche sans domaine. */
  anyMs?: boolean;
}

export interface AdmissionStep {
  kind: 'admission';
  ruleId: string;
  programmeId: string;
  access: AccessType;
  requirementIds: string[];
  /** Qualificatif supposé (ex. « si ton CFC figure dans la liste »), null si aucun. */
  assumption: string | null;
  qualifier: string | null;
  note: string | null;
  status: ValidationStatus;
  sourceIds: string[];
  /** Années ajoutées aux études (ex. Bachelor intégré à la pratique). */
  extraStudyYears: number;
}

export type RouteStep = TrainingStep | AdmissionStep;

export interface Route {
  variant: VariantId;
  startId: string;
  programmeId: string;
  steps: RouteStep[];
  yearsMin: number;
  yearsMax: number;
  access: AccessType;
  validationStatus: ValidationStatus;
  admission: AdmissionStep;
}

const ACCESS_RANK: Record<string, number> = { direct: 0, conditionnel: 1, sur_dossier: 2 };
const APPRENTICESHIP = new Set(['tr_cfc_mp1', 'tr_cfc', 'tr_afp']);
/** Qualificatifs qui renvoient à une liste de CFC nommés. */
export const CFC_QUALIFIERS = new Set(['cfc_liste_filiere', 'cfc_ase', 'cfc_sante_mp_sante_social']);
/** Formations écartées des sentiers : hors périmètre HES (Dubs) ou détour par une école supérieure. */
const EXCLUDED = new Set(['tr_dubs', 'tr_es']);

interface VariantDef {
  id: VariantId;
  startId: string;
  accepts: (path: FoundPath) => boolean;
}

const firstTraining = (p: FoundPath): string | null => p.steps.find((s) => s.type === 'training')?.trainingId ?? null;

/** Une école de métiers n'est proposée que si son CFC figure dans la liste de la filière (règle 4). */
function isTradeSchoolRoute(p: FoundPath): boolean {
  const first = firstTraining(p);
  if (!first || !TRAININGS[first]?.fixedCfc) return false;
  if (p.steps.length !== 2 || p.assumptions.length) return false;
  const rule = RULES[p.steps[1].ruleId ?? ''];
  return !!rule?.qualifier && !rule.qualifier.endsWith('hors_liste');
}

/** Les voies proposées dépendent de la situation de départ. */
export function variantsFor(s: Situation, lang: Lang): VariantDef[] {
  if (isSchoolStart(s)) {
    const startId = stageFor(s, lang);
    return [
      { id: 'apprentissage', startId, accepts: (p) => APPRENTICESHIP.has(firstTraining(p) ?? '') },
      { id: 'ecole_metiers', startId, accepts: isTradeSchoolRoute },
      { id: 'ecg', startId, accepts: (p) => firstTraining(p) === 'tr_ecg' },
      { id: 'college', startId, accepts: (p) => firstTraining(p) === 'tr_gym' },
    ];
  }
  const any = () => true;
  switch (s.id) {
    case 'apprentissage':
      return [
        { id: 'cfc_mp', startId: 'cr_cfc_mp', accepts: any },
        { id: 'cfc_mp2', startId: 'cr_cfc', accepts: (p) => firstTraining(p) === 'tr_mp2' },
      ];
    case 'college':
      return [{ id: 'maturite', startId: 'cr_mat_gym', accepts: any }];
    case 'ecg':
      return [
        { id: 'ecg_sante', startId: 'cr_ecg_sante', accepts: any },
        { id: 'ecg_ts', startId: 'cr_ecg_ts', accepts: any },
        { id: 'ecg_ped', startId: 'cr_ecg_ped', accepts: any },
      ];
    default:
      return [
        { id: 'dossier', startId: 'adulte_25', accepts: any },
        { id: 'es', startId: 'cr_es', accepts: any },
      ];
  }
}

function toRoute(path: FoundPath, variant: VariantId, startId: string, programmeId: string): Route {
  let minT = 0;
  let maxT = 0;
  const steps: RouteStep[] = path.steps.map((st) => {
    if (st.type === 'training') {
      const t = TRAININGS[st.trainingId!];
      minT += t.durationYears.min;
      maxT += t.durationYears.max;
      return {
        kind: 'training',
        trainingId: t.id,
        credentialId: st.credentialId!,
        condition: st.condition ?? null,
        durMin: t.durationYears.min,
        durMax: t.durationYears.max,
        status: t.validationStatus,
      };
    }
    const rule = RULES[st.ruleId!];
    return {
      kind: 'admission',
      ruleId: rule.id,
      programmeId: rule.programmeId,
      access: rule.access,
      requirementIds: rule.requirementIds,
      assumption: rule.qualifier && path.assumptions.includes(rule.qualifier) ? rule.qualifier : null,
      qualifier: rule.qualifier,
      note: rule.note,
      status: rule.validationStatus,
      sourceIds: rule.sourceIds,
      extraStudyYears: rule.requirementIds.reduce((s, id) => s + (REQUIREMENTS[id]?.addsYearsToStudies ?? 0), 0),
    };
  });
  // Le moteur compte la durée minimale. La fourchette ajoute la durée maximale de chaque formation.
  const extra = path.yearsBeforeEntry - minT;
  const admission = steps[steps.length - 1] as AdmissionStep;
  return {
    variant,
    startId,
    programmeId,
    steps,
    yearsMin: path.yearsBeforeEntry,
    yearsMax: maxT + extra,
    access: path.access,
    validationStatus: path.validationStatus,
    admission,
  };
}

/** Ordre de préférence à l'intérieur d'une voie : règle validée, puis durée, puis type d'accès. */
function compareWithinVariant(a: Route, b: Route): number {
  const va = a.admission.status === 'validated' ? 0 : 1;
  const vb = b.admission.status === 'validated' ? 0 : 1;
  const ca = a.admission.assumption && CFC_QUALIFIERS.has(a.admission.assumption) ? 0 : 1;
  const cb = b.admission.assumption && CFC_QUALIFIERS.has(b.admission.assumption) ? 0 : 1;
  return (
    va - vb ||
    a.yearsMin - b.yearsMin ||
    a.yearsMax - b.yearsMax ||
    ACCESS_RANK[a.access] - ACCESS_RANK[b.access] ||
    ca - cb ||
    a.steps.length - b.steps.length
  );
}

/** Ordre entre les voies : le temps de marche d'abord. */
export function compareRoutes(a: Route, b: Route): number {
  return a.yearsMin - b.yearsMin || a.yearsMax - b.yearsMax || ACCESS_RANK[a.access] - ACCESS_RANK[b.access];
}

const isMs = (trainingId: string): boolean => trainingId.startsWith('tr_ms_');

/** Signature d'un chemin où le domaine de la maturité spécialisée est ignoré. */
const signature = (r: Route): string =>
  r.steps
    .map((st) =>
      st.kind === 'training'
        ? isMs(st.trainingId) ? 'MS' : st.trainingId
        : `${st.access}|${st.requirementIds.join('+')}|${st.assumption ?? ''}|${st.status}`,
    )
    .join('>') + `|${r.yearsMin}|${r.yearsMax}`;

/** Regroupe les chemins qui ne diffèrent que par le domaine de la maturité spécialisée. */
function mergeMsSiblings(routes: Route[]): Route[] {
  const groups = new Map<string, Route[]>();
  for (const r of routes) {
    const k = signature(r);
    const g = groups.get(k);
    if (g) g.push(r);
    else groups.set(k, [r]);
  }
  const out: Route[] = [];
  for (const g of groups.values()) {
    const head = g[0];
    const domains = new Set(g.flatMap((r) => r.steps.filter((st): st is TrainingStep => st.kind === 'training' && isMs(st.trainingId)).map((st) => st.trainingId)));
    if (domains.size > 1) {
      for (const st of head.steps) if (st.kind === 'training' && isMs(st.trainingId)) st.anyMs = true;
    }
    out.push(head);
  }
  return out;
}

const cache = new Map<string, Route[]>();

/** Tous les chemins retenus d'une voie vers une filière, du meilleur au moins bon. */
export function routesByVariant(programmeId: string, def: VariantDef): Route[] {
  const key = `${def.id}|${def.startId}|${programmeId}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const routes = mergeMsSiblings(
    findPaths(M, def.startId, programmeId, { limit: 400 })
      .filter((p) => !p.steps.some((s) => s.trainingId && EXCLUDED.has(s.trainingId)))
      .filter(def.accepts)
      .map((p) => toRoute(p, def.id, def.startId, programmeId))
      .sort(compareWithinVariant),
  );
  cache.set(key, routes);
  return routes;
}

export interface ProgrammeRoutes {
  programmeId: string;
  /** Meilleur chemin de chaque voie disponible. */
  byVariant: Partial<Record<VariantId, Route>>;
  /** Chemin le plus court, toutes voies confondues. */
  best: Route | null;
}

export function routesFor(programmeId: string, s: Situation, lang: Lang): ProgrammeRoutes {
  const byVariant: Partial<Record<VariantId, Route>> = {};
  let best: Route | null = null;
  for (const def of variantsFor(s, lang)) {
    const r = routesByVariant(programmeId, def)[0];
    if (!r) continue;
    byVariant[def.id] = r;
    if (!best || compareRoutes(r, best) < 0) best = r;
  }
  return { programmeId, byVariant, best };
}

/** Chemin à afficher pour une filière selon la bascule « Et si » choisie. */
export function pickRoute(pr: ProgrammeRoutes, choice: VariantChoice): Route | null {
  return choice === 'auto' ? pr.best : pr.byVariant[choice] ?? null;
}

/** Autres chemins d'une même voie, sans doublon de règle d'admission (pour la fiche filière). */
export function alternativesFor(programmeId: string, s: Situation, lang: Lang, variant: VariantId, max = 3): Route[] {
  const def = variantsFor(s, lang).find((d) => d.id === variant);
  if (!def) return [];
  const seen = new Set<string>();
  const out: Route[] = [];
  for (const r of routesByVariant(programmeId, def).slice(1)) {
    const k = r.steps.map((st) => (st.kind === 'training' ? st.trainingId : st.requirementIds.join('+') + st.access + (st.assumption ?? ''))).join('>');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
    if (out.length >= max) break;
  }
  return out;
}
