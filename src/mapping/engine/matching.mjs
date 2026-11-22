// Moteur de correspondance « envies et qualités » pour l'app « Et si… ».
// JavaScript pur, sans dépendance, exécutable dans le navigateur.
// Entrées : data/profile-mapping.json (pm) et data/mapping.json (m).
// Principe : un profil utilisateur (intérêts 0..1, qualités 0..1, conditions -1..1)
// est comparé aux profils de professions relevés sur orientation.ch.
// Le score mesure à quel point la personne aime ce que la profession demande ;
// il ne mesure ni une aptitude ni une chance d'admission.

const W = { interests: 0.6, qualities: 0.25, conditions: 0.15 };
const NEUTRAL = 0.5; // valeur supposée quand un intérêt ou une qualité n'a pas été questionné

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * Construit un profil à partir des réponses au questionnaire.
 * answers : { [itemId]: 0..3 } ; qualityAnswers : { [qualityItemId]: 0..3 }
 */
export function profileFromAnswers(pm, answers = {}, qualityAnswers = {}) {
  const acc = {}, cond = {};
  for (const item of pm.questionnaire.items) {
    const a = answers[item.id];
    if (a === undefined || a === null) continue;
    const v = a / 3;
    for (const [id, w] of Object.entries(item.interests)) {
      const val = w >= 0 ? v : 1 - v;
      const o = (acc[id] ??= { s: 0, w: 0 });
      o.s += val * Math.abs(w); o.w += Math.abs(w);
    }
    for (const [axis, sign] of Object.entries(item.conditions)) {
      const o = (cond[axis] ??= { s: 0, n: 0 });
      o.s += sign * (2 * v - 1); o.n += 1;
    }
  }
  const qacc = {};
  for (const item of pm.questionnaire.qualityItems) {
    const a = qualityAnswers[item.id];
    if (a === undefined || a === null) continue;
    for (const q of item.qualities) { const o = (qacc[q] ??= { s: 0, n: 0 }); o.s += a / 3; o.n += 1; }
  }
  return {
    interests: Object.fromEntries(Object.entries(acc).map(([k, o]) => [k, o.s / o.w])),
    qualities: Object.fromEntries(Object.entries(qacc).map(([k, o]) => [k, o.s / o.n])),
    conditions: Object.fromEntries(Object.entries(cond).map(([k, o]) => [k, Math.max(-1, Math.min(1, o.s / o.n))])),
  };
}

/**
 * Convertit les scores d'ActivityTag du jeu (src/engine/recommendation.ts) en intérêts.
 * tagScores : { concevoir: 3, analyser: 1, ... } ; valeurs normalisées sur le maximum.
 */
export function profileFromTags(pm, tagScores = {}) {
  const max = Math.max(0, ...Object.values(tagScores));
  const acc = {};
  if (max > 0) {
    for (const [tag, score] of Object.entries(tagScores)) {
      for (const [id, w] of Object.entries(pm.tagToInterests[tag] ?? {})) {
        const o = (acc[id] ??= { s: 0, w: 0 });
        o.s += (score / max) * w; o.w += w;
      }
    }
  }
  return { interests: Object.fromEntries(Object.entries(acc).map(([k, o]) => [k, clamp01(o.s / o.w)])), qualities: {}, conditions: {} };
}

/** Fusionne deux profils (ex. jeu + questionnaire). weightA dans [0, 1]. */
export function mergeProfiles(a, b, weightA = 0.5) {
  const mix = (x = {}, y = {}) => {
    const out = { ...x };
    for (const [k, v] of Object.entries(y)) out[k] = k in x ? weightA * x[k] + (1 - weightA) * v : v;
    return out;
  };
  return { interests: mix(a.interests, b.interests), qualities: mix(a.qualities, b.qualities), conditions: mix(a.conditions, b.conditions) };
}

function weightedMean(user, wanted) {
  // wanted : liste d'ids (poids 1) ou objet { id: poids }
  const entries = Array.isArray(wanted) ? wanted.map((id) => [id, 1]) : Object.entries(wanted);
  if (!entries.length) return { score: NEUTRAL, coverage: 0, matched: [] };
  let s = 0, w = 0, known = 0;
  const matched = [];
  for (const [id, wt] of entries) {
    const v = user[id];
    if (v !== undefined) { known += wt; if (v >= 0.66) matched.push(id); }
    s += (v ?? NEUTRAL) * wt; w += wt;
  }
  return { score: s / w, coverage: known / w, matched };
}

function conditionFit(user, prof) {
  const axes = Object.keys(prof).filter((a) => user[a] !== undefined);
  if (!axes.length) return { score: NEUTRAL, conflicts: [] };
  let s = 0;
  const conflicts = [];
  for (const a of axes) {
    const d = Math.abs(user[a] - prof[a]);
    s += 1 - d / 2;
    if (d >= 1.5) conflicts.push(a);
  }
  return { score: s / axes.length, conflicts };
}

function combine(i, q, c, hasConditions) {
  const wc = hasConditions ? W.conditions : 0;
  const total = W.interests + W.qualities + wc;
  return Math.round((100 * (W.interests * i.score + W.qualities * q.score + wc * c.score)) / total);
}

/** Correspondance entre un profil utilisateur et un profil de profession. */
export function matchProfile(pm, user, profile) {
  const i = weightedMean(user.interests, profile.interests);
  const q = weightedMean(user.qualities, profile.qualities);
  const c = conditionFit(user.conditions, profile.conditions);
  return {
    profileId: profile.id,
    label: profile.label,
    level: profile.level,
    score: combine(i, q, c, Object.keys(profile.conditions).length > 0),
    interestScore: Math.round(100 * i.score),
    qualityScore: Math.round(100 * q.score),
    coverage: Math.round(100 * (0.7 * i.coverage + 0.3 * q.coverage)),
    matchedInterests: i.matched,
    matchedQualities: q.matched,
    conditionConflicts: c.conflicts,
    constraints: profile.constraints,
    validationStatus: profile.validationStatus,
    sourceIds: profile.sourceIds,
  };
}

/** Classe les professions d'un niveau ('afp', 'cfc', 'hes' ou tableau). */
export function rankProfiles(pm, user, { levels = ['afp', 'cfc'], limit = 10 } = {}) {
  const lv = new Set(Array.isArray(levels) ? levels : [levels]);
  return pm.profiles.filter((p) => lv.has(p.level)).map((p) => matchProfile(pm, user, p))
    .sort((a, b) => b.score - a.score || b.coverage - a.coverage).slice(0, limit);
}

/** Classe les Bachelors HES à partir de leurs profils agrégés. */
export function rankProgrammes(pm, m, user, { limit = 10 } = {}) {
  const progs = new Map(m.programmes.map((p) => [p.id, p]));
  return pm.programmeProfiles.filter((pp) => pp.profileIds.length)
    .map((pp) => {
      const i = weightedMean(user.interests, pp.interests);
      const q = weightedMean(user.qualities, pp.qualities);
      const linked = pm.profiles.filter((p) => pp.profileIds.includes(p.id));
      // conditions : moyenne des profils liés
      const cond = {};
      for (const p of linked) for (const [a, v] of Object.entries(p.conditions)) cond[a] = (cond[a] ?? 0) + v / linked.length;
      const c = conditionFit(user.conditions, cond);
      const p = progs.get(pp.programmeId);
      return {
        programmeId: pp.programmeId, title: p.title, school: p.school,
        score: combine(i, q, c, Object.keys(cond).length > 0),
        matchedInterests: i.matched, matchedQualities: q.matched,
        professions: linked.map((x) => x.label),
        masters: p.nextProgrammeIds,
        validationStatus: pp.validationStatus,
      };
    })
    .sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Chaînon complet : envies -> CFC -> Bachelor HES.
 * Pour chaque CFC bien classé, liste les Bachelors où il figure dans la liste d'accès direct
 * (avec MP), et le score du Bachelor pour la même personne.
 */
export function bridges(pm, m, user, { limit = 5 } = {}) {
  const progScore = new Map(rankProgrammes(pm, m, user, { limit: 99 }).map((p) => [p.programmeId, p]));
  return rankProfiles(pm, user, { levels: ['cfc'], limit }).map((r) => {
    const prof = pm.profiles.find((p) => p.id === r.profileId);
    return {
      ...r,
      directAccess: prof.directAccessProgrammeIds
        .map((id) => ({ programmeId: id, title: progScore.get(id)?.title, programmeScore: progScore.get(id)?.score ?? null }))
        .sort((a, b) => (b.programmeScore ?? 0) - (a.programmeScore ?? 0)),
    };
  });
}

/** CFC qui mènent directement à un Bachelor, classés selon la personne. */
export function cfcRoutesTo(pm, user, programmeId) {
  return pm.profiles.filter((p) => p.level === 'cfc' && p.directAccessProgrammeIds.includes(programmeId))
    .map((p) => matchProfile(pm, user, p)).sort((a, b) => b.score - a.score);
}

/** Proximité (0..100) entre une profession et un Bachelor, indépendante de la personne. */
export function affinity(pm, profileId, programmeId) {
  const p = pm.profiles.find((x) => x.id === profileId);
  const pp = pm.programmeProfiles.find((x) => x.programmeId === programmeId);
  if (!p || !pp || !pp.profileIds.length) return null;
  const sim = (a, bObj) => {
    const b = Object.keys(bObj);
    const inter = a.filter((x) => b.includes(x)).length;
    const union = new Set([...a, ...b]).size;
    return union ? inter / union : 0;
  };
  return Math.round(100 * (0.6 * sim(p.interests, pp.interests) + 0.4 * sim(p.qualities, pp.qualities)));
}
