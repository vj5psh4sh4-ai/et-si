// Métiers CFC nommés comme étapes du sentier (décision 2) et entrée par le métier.
// Les listes du référentiel reprennent les intitulés de plusieurs sources : un même CFC y figure
// sous plusieurs graphies. La mise en forme se fait ici, sans toucher au référentiel.
import { cfcRoutesTo } from '../mapping/engine/matching.mjs';
import { findPaths } from '../mapping/engine/pathfinder.mjs';
import type { AccessType, UserProfile } from '../mapping/engine/types';
import { BACHELOR_IDS, M, PM, REQUIREMENTS, RULES } from './data';
import { CFC_QUALIFIERS } from './routes';

const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Retire les mentions de date ou de domaine entre parenthèses et le suffixe « CFC ». */
export function cleanCfcLabel(label: string): string {
  return label
    .replace(/\s*\((?:à partir|jusqu|architecture,)[^)]*\)/gi, '')
    .replace(/\s+CFC$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Clé de regroupement : forme masculine, sans accents ni ponctuation. */
export function cfcKey(label: string): string {
  let s = cleanCfcLabel(label).replace(/\s*\([^)]*\)/g, '');
  // « Laborantin·e en physique » -> « Laborantin en physique »
  s = s.replace(/·[\p{L}·]+/gu, '');
  // « Monteur / Monteuse automaticien » ou « Laborantin/Laborantine » -> forme masculine + suite
  const m = s.match(/^(.+?)\s*\/\s*(.+)$/);
  if (m) {
    const masc = m[1].trim();
    const femWords = m[2].trim().split(/\s+/);
    const mascWords = masc.split(/\s+/);
    // Les mots de la forme féminine au-delà de ceux de la forme masculine sont la suite commune.
    s = [masc, ...femWords.slice(mascWords.length)].join(' ');
  }
  return fold(s).replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Préfère la graphie inclusive courte (« Laborantin·e ») à la forme double. */
const displayRank = (label: string): number => (label.includes('·') ? 0 : label.includes('/') ? 2 : 1);

export interface CfcEntry {
  key: string;
  label: string;
  /** Filières dont la liste d'accès direct contient ce CFC. */
  directProgrammeIds: string[];
  /** Vrai si la liste d'une de ces filières n'est pas annoncée comme complète. */
  fromIncompleteList: boolean;
}

function buildIndex(): CfcEntry[] {
  const byKey = new Map<string, CfcEntry>();
  const add = (raw: string, programmeId: string | null, incomplete: boolean) => {
    const key = cfcKey(raw);
    if (!key) return;
    const label = cleanCfcLabel(raw);
    let e = byKey.get(key);
    if (!e) {
      e = { key, label, directProgrammeIds: [], fromIncompleteList: false };
      byKey.set(key, e);
    } else if (displayRank(label) < displayRank(e.label) || (displayRank(label) === displayRank(e.label) && label.length < e.label.length)) {
      e.label = label;
    }
    if (programmeId && !e.directProgrammeIds.includes(programmeId)) e.directProgrammeIds.push(programmeId);
    if (incomplete) e.fromIncompleteList = true;
  };
  for (const [programmeId, list] of Object.entries(M.cfcLists)) {
    for (const raw of list.cfc) add(raw, programmeId, !list.complete);
  }
  // Les profils de métiers relevés sur orientation.ch complètent les listes (accès croisés).
  for (const p of PM.profiles) {
    if (p.level !== 'cfc') continue;
    add(p.label, null, false);
    for (const programmeId of p.directAccessProgrammeIds) add(p.label, programmeId, false);
  }
  for (const e of byKey.values()) e.directProgrammeIds.sort((a, b) => BACHELOR_IDS.indexOf(a) - BACHELOR_IDS.indexOf(b));
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

export const CFC_INDEX: CfcEntry[] = buildIndex();
const CFC_BY_KEY = new Map(CFC_INDEX.map((e) => [e.key, e]));
export const cfcByKey = (key: string): CfcEntry | undefined => CFC_BY_KEY.get(key);

/** Nombre d'intitulés bruts dans les listes du référentiel, doublons de graphie compris. */
export const RAW_CFC_COUNT: number = Object.values(M.cfcLists).reduce((n, l) => n + l.cfc.length, 0);

export function searchCfc(query: string, limit = 12): CfcEntry[] {
  const q = fold(query).replace(/[^a-z0-9]+/g, ' ').trim();
  if (!q) return [];
  const words = q.split(' ');
  const scored: { e: CfcEntry; rank: number }[] = [];
  for (const e of CFC_INDEX) {
    if (!words.every((w) => e.key.includes(w))) continue;
    scored.push({ e, rank: e.key.startsWith(q) ? 0 : e.key.split(' ').some((k) => k.startsWith(words[0])) ? 1 : 2 });
  }
  return scored.sort((a, b) => a.rank - b.rank || a.e.label.localeCompare(b.e.label, 'fr')).slice(0, limit).map((x) => x.e);
}

/** Liste complète et dédoublonnée des CFC qui ouvrent directement une filière. */
export function cfcListFor(programmeId: string): { labels: string[]; complete: boolean; note: string | null; sourceId: string | null } {
  const list = M.cfcLists[programmeId];
  const labels = CFC_INDEX.filter((e) => e.directProgrammeIds.includes(programmeId)).map((e) => e.label);
  return { labels, complete: list?.complete ?? false, note: list?.note ?? null, sourceId: list?.sourceId ?? null };
}

/**
 * Quelques CFC à nommer sur le sentier d'une filière : ceux qui ressemblent le plus aux envies exprimées.
 * Le moteur ne décrit que 31 métiers CFC ; le reste de la liste reste accessible sur la fiche.
 */
export function cfcExamplesFor(programmeId: string, user: UserProfile, max = 3): string[] {
  const ranked = cfcRoutesTo(PM, user, programmeId).map((r) => cleanCfcLabel(r.label));
  const out: string[] = [];
  for (const label of ranked) {
    if (!out.includes(label)) out.push(label);
    if (out.length >= max) return out;
  }
  for (const label of cfcListFor(programmeId).labels) {
    if (out.length >= max) break;
    if (!out.some((l) => cfcKey(l) === cfcKey(label))) out.push(label);
  }
  return out;
}

export interface CfcDoor {
  programmeId: string;
  kind: 'direct' | 'complement';
  access: AccessType;
  ruleId: string;
  requirementIds: string[];
  /** Formations à ajouter après le CFC avec maturité (ex. modules complémentaires santé). */
  trainingIds: string[];
  extraYearsMin: number;
}

/**
 * Filières ouvertes par un CFC accompagné d'une maturité professionnelle :
 * directement si le CFC figure dans la liste de la filière, sinon avec un complément.
 */
export function doorsForCfc(entry: CfcEntry): CfcDoor[] {
  const doors: CfcDoor[] = [];
  for (const programmeId of BACHELOR_IDS) {
    const listed = entry.directProgrammeIds.includes(programmeId);
    const paths = findPaths(M, 'cr_cfc_mp', programmeId, { limit: 200 }).filter(
      (p) => !p.steps.some((s) => s.trainingId === 'tr_es' || s.trainingId === 'tr_dubs'),
    );
    let best: CfcDoor | null = null;
    for (const p of paths) {
      const adm = p.steps[p.steps.length - 1];
      const rule = RULES[adm.ruleId ?? ''];
      if (!rule) continue;
      const needsList = !!rule.qualifier && CFC_QUALIFIERS.has(rule.qualifier);
      const offList = !!rule.qualifier && rule.qualifier.endsWith('hors_liste');
      // On part d'un CFC précis : les règles liées à un autre critère (type de maturité, diplôme ES) sont écartées.
      if (rule.qualifier && !needsList && !offList) continue;
      if ((needsList && !listed) || (offList && listed)) continue;
      const trainingIds = p.steps.filter((s) => s.type === 'training').map((s) => s.trainingId!);
      const door: CfcDoor = {
        programmeId,
        kind: listed && needsList && !trainingIds.length ? 'direct' : 'complement',
        access: p.access,
        ruleId: rule.id,
        requirementIds: rule.requirementIds,
        trainingIds,
        extraYearsMin: p.yearsBeforeEntry,
      };
      const rank = (d: CfcDoor) =>
        (d.kind === 'direct' ? 0 : 10) + d.extraYearsMin * 2 + d.requirementIds.reduce((n, id) => n + (REQUIREMENTS[id]?.addsYearsToStudies ?? 0), 0);
      if (!best || rank(door) < rank(best)) best = door;
    }
    if (best) doors.push(best);
  }
  return doors.sort((a, b) => (a.kind === b.kind ? a.extraYearsMin - b.extraYearsMin : a.kind === 'direct' ? -1 : 1));
}
