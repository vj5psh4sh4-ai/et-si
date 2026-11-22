// Contrôle d'intégrité de data/profile-mapping.json et test du moteur de correspondance.
// Usage : node scripts/validate-profile.mjs  (copie adaptée du référentiel, sans écriture de fichier)
import { readFileSync } from 'node:fs';
import { profileFromAnswers, profileFromTags, mergeProfiles, rankProfiles, rankProgrammes, bridges, cfcRoutesTo, affinity } from '../src/mapping/engine/matching.mjs';

const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const pm = read('../src/mapping/data/profile-mapping.json');
const m = read('../src/mapping/data/mapping.json');
const errors = [];
const TAGS = new Set(['ecouter', 'accompagner', 'concevoir', 'analyser', 'organiser', 'soigner', 'construire', 'coordonner']);
const STATUS = new Set(['demo', 'to_review', 'validated']);
const AXES = new Set(pm.conditions.map((c) => c.id));
const ints = new Set(pm.interests.map((x) => x.id)), quals = new Set(pm.qualities.map((x) => x.id));
const srcs = new Set([...pm.sources.map((s) => s.id), ...m.sources.map((s) => s.id)]);
const progs = new Set(m.programmes.map((p) => p.id));

const uniq = (arr, name) => { const s = new Set(); for (const x of arr) { if (s.has(x.id)) errors.push(`${name}: id en double ${x.id}`); s.add(x.id); } };
uniq(pm.interests, 'interests'); uniq(pm.qualities, 'qualities'); uniq(pm.profiles, 'profiles'); uniq(pm.sources, 'sources');
if (pm.interests.length !== 37) errors.push(`37 intérêts attendus, ${pm.interests.length}`);
if (pm.qualities.length !== 76) errors.push(`76 qualités attendues, ${pm.qualities.length}`);
for (const s of pm.sources) if (!/^https:\/\//.test(s.url)) errors.push(`source ${s.id}: URL invalide`);
for (const i of pm.interests) {
  i.activityTags.forEach((t) => TAGS.has(t) || errors.push(`${i.id}: tag inconnu ${t}`));
  Object.keys(i.conditions).forEach((a) => AXES.has(a) || errors.push(`${i.id}: axe inconnu ${a}`));
}
for (const p of pm.profiles) {
  p.interests.forEach((x) => ints.has(x) || errors.push(`${p.id}: intérêt inconnu ${x}`));
  [...p.qualities, ...p.constraints].forEach((x) => quals.has(x) || errors.push(`${p.id}: qualité inconnue ${x}`));
  [...p.programmeIds, ...p.directAccessProgrammeIds].forEach((x) => progs.has(x) || errors.push(`${p.id}: programme inconnu ${x}`));
  p.sourceIds.forEach((x) => srcs.has(x) || errors.push(`${p.id}: source inconnue ${x}`));
  if (!STATUS.has(p.validationStatus)) errors.push(`${p.id}: statut invalide`);
  if (!p.interests.length) errors.push(`${p.id}: aucun intérêt`);
  if (p.level === 'hes' && !p.programmeIds.length) errors.push(`${p.id}: profession HES sans programme`);
}
for (const b of m.programmes.filter((p) => p.degree === 'bachelor'))
  if (!pm.programmeProfiles.find((pp) => pp.programmeId === b.id && pp.profileIds.length)) errors.push(`${b.id}: Bachelor sans profil`);
for (const it of pm.questionnaire.items) Object.keys(it.interests).forEach((x) => ints.has(x) || errors.push(`${it.id}: intérêt inconnu ${x}`));
for (const it of pm.questionnaire.qualityItems) it.qualities.forEach((x) => quals.has(x) || errors.push(`${it.id}: qualité inconnue ${x}`));
// tout intérêt utilisé par un profil doit être questionné
const asked = new Set(pm.questionnaire.items.flatMap((it) => Object.keys(it.interests)));
for (const p of pm.profiles) p.interests.forEach((x) => asked.has(x) || errors.push(`${p.id}: intérêt ${x} jamais questionné`));
// les CFC listés pour un programme dans mapping.json doivent retrouver ce programme
for (const [prog, list] of Object.entries(m.cfcLists)) if (!pm.profiles.some((p) => p.directAccessProgrammeIds.includes(prog))) errors.push(`${prog}: aucun CFC relié`);

// ------------------------------------------------------------ personas de test
const all = (v) => Object.fromEntries(pm.questionnaire.items.map((i) => [i.id, v]));
const allQ = (v) => Object.fromEntries(pm.questionnaire.qualityItems.map((i) => [i.id, v]));
const personas = {
  'Léa, aime soigner et le contact': {
    answers: { ...all(1), q12: 3, q13: 3, q18: 3, q25: 3, q14: 2, q22: 3, q06: 2, q20: 2, q01: 0, q04: 0, q26: 0, q27: 0 },
    qualities: { ...allQ(1), s05: 3, s07: 3, s18: 3, s13: 3, s19: 3, s09: 2, s15: 2 },
  },
  'Noah, aime fabriquer et comprendre la technique': {
    answers: { ...all(1), q01: 3, q02: 3, q04: 3, q27: 3, q03: 2, q07: 2, q23: 2, q12: 0, q13: 0, q14: 0, q17: 0, q25: 0 },
    qualities: { ...allQ(1), s01: 3, s03: 3, s09: 3, s10: 2, s14: 2, s20: 3 },
  },
  'Inès, aime organiser, chiffres et langues': {
    answers: { ...all(1), q09: 3, q10: 3, q11: 3, q16: 3, q24: 3, q05: 2, q22: 2, q25: 2, q02: 0, q19: 0, q20: 0, q26: 0 },
    qualities: { ...allQ(1), s04: 3, s11: 3, s14: 3, s16: 3, s25: 3, s06: 3, s17: 2 },
  },
  'Malik, aime dessiner, bâtir et travailler dehors': {
    answers: { ...all(1), q03: 3, q08: 3, q26: 3, q19: 3, q30: 2, q02: 2, q22: 2, q05: 1, q13: 0, q24: 0 },
    qualities: { ...allQ(1), s02: 3, s08: 3, s24: 3, s12: 2, s13: 2, s11: 2 },
  },
};
const lab = Object.fromEntries([...pm.interests, ...pm.qualities].map((x) => [x.id, x.label]));
const out = {};
for (const [name, p] of Object.entries(personas)) {
  const u = profileFromAnswers(pm, p.answers, p.qualities);
  const cfc = rankProfiles(pm, u, { levels: ['afp', 'cfc'], limit: 5 });
  const hes = rankProgrammes(pm, m, u, { limit: 4 });
  const br = bridges(pm, m, u, { limit: 3 });
  out[name] = {
    cfc: cfc.map((r) => ({ label: r.label, score: r.score, raisons: r.matchedInterests.slice(0, 3).map((x) => lab[x]) })),
    hes: hes.map((r) => ({ programmeId: r.programmeId, title: r.title, score: r.score })),
    ponts: br.map((b) => ({ cfc: b.label, score: b.score, acces: b.directAccess.slice(0, 3).map((d) => `${d.title} (${d.programmeScore})`) })),
  };
}
// cohérence attendue des personas
const top = (n) => out[n].hes[0].programmeId;
if (!out['Léa, aime soigner et le contact'].hes.slice(0, 2).some((h) => h.programmeId === 'ba_heds_si')) errors.push('persona Léa : Soins infirmiers absent des 2 premiers');
if (!['ba_heia_gm', 'ba_heia_ge', 'ba_heia_isc'].includes(top('Noah, aime fabriquer et comprendre la technique'))) errors.push(`persona Noah : 1er programme ${top('Noah, aime fabriquer et comprendre la technique')}`);
if (top('Inès, aime organiser, chiffres et langues') !== 'ba_heg_ee') errors.push(`persona Inès : 1er programme ${top('Inès, aime organiser, chiffres et langues')}`);
if (!['ba_heia_archi', 'ba_heia_gc'].includes(top('Malik, aime dessiner, bâtir et travailler dehors'))) errors.push(`persona Malik : 1er programme ${top('Malik, aime dessiner, bâtir et travailler dehors')}`);

// pont jeu -> intérêts
const fromGame = profileFromTags(pm, { soigner: 3, accompagner: 2, ecouter: 1 });
const gameTop = rankProgrammes(pm, m, fromGame, { limit: 1 })[0].programmeId;
if (!['ba_heds_si', 'ba_heds_osteo', 'ba_hets_ts'].includes(gameTop)) errors.push(`jeu soigner : 1er programme ${gameTop}`);
const merged = mergeProfiles(fromGame, profileFromAnswers(pm, personas['Léa, aime soigner et le contact'].answers), 0.3);
if (!Object.keys(merged.interests).length) errors.push('fusion vide');
// accès direct vers GM : les CFC techniques remontent pour Noah
const noah = profileFromAnswers(pm, personas['Noah, aime fabriquer et comprendre la technique'].answers);
const gmRoutes = cfcRoutesTo(pm, noah, 'ba_heia_gm');
if (!gmRoutes.length) errors.push('aucun CFC vers GM');
out['CFC vers Génie mécanique (Noah)'] = gmRoutes.slice(0, 5).map((r) => `${r.label} (${r.score})`);

// matrice d'affinité (indépendante de la personne)
const bach = m.programmes.filter((p) => p.degree === 'bachelor').map((p) => p.id);
out.affinite = Object.fromEntries(pm.profiles.filter((p) => p.level !== 'hes').map((p) => [p.id, Object.fromEntries(bach.map((b) => [b, affinity(pm, p.id, b)]))]));
// (pas d'écriture de fichier dans le dépôt de l'application)

if (errors.length) { console.error('ERREURS\n' + errors.join('\n')); process.exit(1); }
console.log(`OK : ${pm.interests.length} intérêts, ${pm.qualities.length} qualités, ${pm.profiles.length} profils, ${pm.questionnaire.items.length}+${pm.questionnaire.qualityItems.length} items`);
for (const [n, v] of Object.entries(out)) if (n !== 'affinite') console.log(n, JSON.stringify(v));
