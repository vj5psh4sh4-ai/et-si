// Contrôle d'intégrité de data/mapping.json et test du moteur de chemins.
// Usage : node scripts/validate-mapping.mjs (copie adaptée du référentiel, lancée avant chaque build)
import { readFileSync } from 'node:fs';
import { findPaths, careersFor } from '../src/mapping/engine/pathfinder.mjs';

const m = JSON.parse(readFileSync(new URL('../src/mapping/data/mapping.json', import.meta.url), 'utf8'));
const errors = [];
const ids = (arr) => new Set(arr.map((x) => x.id));
const src = ids(m.sources), stages = ids(m.stages), creds = ids(m.credentials);
const progs = ids(m.programmes), reqs = ids(m.requirements), occs = ids(m.occupations);
const TAGS = new Set(['ecouter', 'accompagner', 'concevoir', 'analyser', 'organiser', 'soigner', 'construire', 'coordonner']);
const STATUS = new Set(['demo', 'to_review', 'validated']);

for (const col of ['sources', 'stages', 'credentials', 'trainings', 'requirements', 'programmes', 'admissionRules', 'occupations']) {
  const seen = new Set();
  for (const x of m[col]) { if (seen.has(x.id)) errors.push(`${col}: id en double ${x.id}`); seen.add(x.id); }
}
const checkSrc = (where, list) => list.forEach((s) => src.has(s) || errors.push(`${where}: source inconnue ${s}`));
for (const s of m.sources) if (!/^https:\/\//.test(s.url)) errors.push(`source ${s.id}: URL invalide`);
for (const t of m.trainings) {
  t.entryFrom.forEach((e) => stages.has(e.from) || creds.has(e.from) || errors.push(`${t.id}: entrée inconnue ${e.from}`));
  t.credentialIds.forEach((c) => creds.has(c) || errors.push(`${t.id}: titre inconnu ${c}`));
  t.grantsQualifiers.forEach((q) => { const p = q.split(':')[1]; if (p && !progs.has(p)) errors.push(`${t.id}: programme inconnu ${p}`); });
  if (!STATUS.has(t.validationStatus)) errors.push(`${t.id}: statut invalide`);
  checkSrc(t.id, t.sourceIds);
}
for (const p of m.programmes) {
  p.activityTags.forEach((a) => TAGS.has(a) || errors.push(`${p.id}: tag inconnu ${a}`));
  p.nextProgrammeIds.forEach((n) => progs.has(n) || errors.push(`${p.id}: suite inconnue ${n}`));
  checkSrc(p.id, p.sourceIds);
  if (!m.admissionRules.some((r) => r.programmeId === p.id)) errors.push(`${p.id}: aucune règle d'admission`);
  if (!m.programmeOccupations.some((o) => o.programmeId === p.id)) errors.push(`${p.id}: aucun débouché`);
}
for (const r of m.admissionRules) {
  if (!progs.has(r.programmeId)) errors.push(`${r.id}: programme inconnu`);
  if (!creds.has(r.credentialId) && !progs.has(r.credentialId)) errors.push(`${r.id}: titre inconnu ${r.credentialId}`);
  r.requirementIds.forEach((q) => reqs.has(q) || errors.push(`${r.id}: exigence inconnue ${q}`));
  if (!r.sourceIds.length) errors.push(`${r.id}: sans source`);
  checkSrc(r.id, r.sourceIds);
}
for (const r of m.requirements) checkSrc(r.id, r.sourceIds);
for (const po of m.programmeOccupations) {
  if (!progs.has(po.programmeId) || !occs.has(po.occupationId)) errors.push(`débouché ${po.occupationId}: référence inconnue`);
  if (po.validationStatus === 'validated' && !po.sourceIds.length) errors.push(`${po.occupationId}: validé sans source`);
  checkSrc(po.occupationId, po.sourceIds);
}
for (const [p, l] of Object.entries(m.cfcLists)) { if (!progs.has(p)) errors.push(`cfcLists: ${p}`); checkSrc(`cfc ${p}`, [l.sourceId]); }
for (const e of m.examplePaths) {
  if (!progs.has(e.programmeId)) errors.push(`${e.id}: programme inconnu`);
  e.steps.forEach((s) => stages.has(s) || creds.has(s) || m.trainings.some((t) => t.id === s) || errors.push(`${e.id}: étape inconnue ${s}`));
}

// Test du moteur : chaque Bachelor doit être atteignable depuis une classe du CO.
const bachelors = m.programmes.filter((p) => p.degree === 'bachelor');
for (const b of bachelors) {
  const fromG = findPaths(m, 'co_g', b.id);
  if (!fromG.length) errors.push(`moteur: ${b.id} inaccessible depuis co_g`);
}
for (const p of m.programmes.filter((x) => x.degree === 'master')) {
  if (!findPaths(m, 'co_pg', p.id).length) errors.push(`moteur: ${p.id} inaccessible depuis co_pg`);
}
// Les chemins types doivent être retrouvés par le moteur ; sa durée (borne basse) ne doit pas dépasser celle annoncée.
for (const e of m.examplePaths) {
  const found = findPaths(m, e.steps[0], e.programmeId, { limit: 200 });
  const trainings = e.steps.filter((s) => s.startsWith('tr_'));
  const match = found.find((p) => {
    const t = p.steps.filter((s) => s.type === 'training').map((s) => s.trainingId);
    return t.join('>') === trainings.join('>');
  });
  if (!match) errors.push(`${e.id}: chemin type non retrouvé par le moteur`);
  else if (match.yearsBeforeEntry > e.minYearsBeforeEntry) {
    errors.push(`${e.id}: durée moteur ${match.yearsBeforeEntry} > ${e.minYearsBeforeEntry}`);
  }
}

const stat = (arr) => arr.reduce((a, x) => ((a[x.validationStatus] = (a[x.validationStatus] ?? 0) + 1), a), {});
console.log('Règles :', m.admissionRules.length, stat(m.admissionRules));
console.log('Débouchés :', m.programmeOccupations.length, stat(m.programmeOccupations));
console.log('Exemple co_g → ba_heds_si :');
for (const p of findPaths(m, 'co_g', 'ba_heds_si', { limit: 4 })) {
  console.log(' ', p.yearsBeforeEntry, 'an(s)', p.access, p.steps.map((s) => s.trainingId ?? s.ruleId).join(' > '), p.assumptions.length ? `(si ${p.assumptions.join(', ')})` : '');
}
console.log('Débouchés ba_hets_ts :', Object.fromEntries(Object.entries(careersFor(m, 'ba_hets_ts')).map(([k, v]) => [k, v.length])));
if (errors.length) { console.error(`\n${errors.length} erreur(s) :\n- ` + errors.join('\n- ')); process.exit(1); }
console.log('\nOK : mapping cohérent.');
