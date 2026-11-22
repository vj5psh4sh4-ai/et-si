// Moteur de chemins « Et si… » : énumère les voies d'un point de départ vers un programme.
// JavaScript pur (ESM), utilisable tel quel dans Vite/TS (allowJs) ou à porter en .ts.

const ACCESS_RANK = { direct: 0, conditionnel: 1, sur_dossier: 2 };

/**
 * @param {import('./types').Mapping} m
 * @param {string} fromId  Stage.id ou Credential.id
 * @param {string} targetId Programme.id
 * @param {{ maxDepth?: number, limit?: number }} [opts]
 */
export function findPaths(m, fromId, targetId, opts = {}) {
  const maxDepth = opts.maxDepth ?? 7;
  const limit = opts.limit ?? 12;
  const prog = Object.fromEntries(m.programmes.map((p) => [p.id, p]));
  const reqs = Object.fromEntries(m.requirements.map((r) => [r.id, r]));
  const out = [];

  /** @param {string} node @param {object} st */
  function walk(node, st) {
    if (st.steps.length > maxDepth * 2) return;
    // 1. Règles d'admission depuis ce nœud
    for (const r of m.admissionRules) {
      if (r.credentialId !== node || r.access === 'non_admis') continue;
      if (st.visited.has(r.programmeId)) continue;
      const assumptions = [...st.assumptions];
      if (r.qualifier) {
        const tagged = `${r.qualifier}:${r.programmeId}`;
        const granted = st.qualifiers.has(r.qualifier) || st.qualifiers.has(tagged);
        const fallback = r.qualifier.endsWith('hors_liste') || r.qualifier.endsWith('autre_domaine');
        if (st.fixedCfc) {
          // CFC connu : on applique la règle exacte, sans hypothèse
          const listed = st.qualifiers.has(`cfc_liste_filiere:${r.programmeId}`);
          if (fallback ? listed : !granted) continue;
        } else if (!granted) {
          assumptions.push(r.qualifier);
        }
      }
      const extra = r.requirementIds.reduce((s, id) => s + (reqs[id]?.addsYearsBeforeEntry ?? 0), 0);
      const access = worst(st.access, r.access);
      const step = { type: 'admission', ruleId: r.id, programmeId: r.programmeId, requirementIds: r.requirementIds };
      if (r.programmeId === targetId) {
        out.push({
          steps: [...st.steps, step],
          yearsBeforeEntry: st.years + extra,
          access,
          assumptions,
          validationStatus: worstStatus([...st.statuses, r.validationStatus]),
        });
      } else if (prog[r.programmeId]?.degree === 'bachelor' && prog[targetId]?.degree === 'master') {
        // Poursuite : le Bachelor devient titre d'entrée du Master
        const p = prog[r.programmeId];
        const studyExtra = r.requirementIds.reduce((s, id) => s + (reqs[id]?.addsYearsToStudies ?? 0), 0);
        walk(p.id, {
          ...st,
          steps: [...st.steps, step],
          years: st.years + extra + p.durationYears + studyExtra,
          access, assumptions,
          statuses: [...st.statuses, r.validationStatus],
          visited: new Set([...st.visited, p.id]),
        });
      }
    }
    // 2. Formations depuis ce nœud
    for (const t of m.trainings) {
      const entry = t.entryFrom.find((e) => e.from === node);
      if (!entry) continue;
      for (const c of t.credentialIds) {
        if (st.visited.has(c)) continue;
        walk(c, {
          ...st,
          steps: [...st.steps, { type: 'training', trainingId: t.id, credentialId: c, condition: entry.condition ?? null }],
          years: st.years + t.durationYears.min,
          qualifiers: new Set([...st.qualifiers, ...t.grantsQualifiers]),
          fixedCfc: st.fixedCfc || !!t.fixedCfc,
          statuses: [...st.statuses, t.validationStatus],
          visited: new Set([...st.visited, c]),
        });
      }
    }
  }

  walk(fromId, {
    steps: [], years: 0, fixedCfc: false, access: 'direct', assumptions: [], qualifiers: new Set(), statuses: [], visited: new Set([fromId]),
  });

  // Élagage : un chemin qui prolonge un chemin déjà direct et sans hypothèse est inutile.
  const trainSeq = (p) => p.steps.filter((s) => s.type === 'training').map((s) => s.trainingId);
  const clean = out.filter((p) => p.access === 'direct' && !p.assumptions.length).map(trainSeq);
  const pruned = out.filter((p) => {
    const seq = trainSeq(p);
    return !clean.some((c) => c.length < seq.length && c.every((t, i) => seq[i] === t));
  });

  // Dédoublonnage par séquence de formations + règle finale
  const seen = new Set();
  return pruned
    .sort((a, b) => a.yearsBeforeEntry - b.yearsBeforeEntry
      || ACCESS_RANK[a.access] - ACCESS_RANK[b.access]
      || a.assumptions.length - b.assumptions.length
      || a.steps.length - b.steps.length)
    .filter((p) => {
      const k = p.steps.map((s) => s.trainingId ?? s.ruleId).join('>');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}

/** Débouchés d'un programme, groupés par niveau. */
export function careersFor(m, programmeId) {
  const occ = Object.fromEntries(m.occupations.map((o) => [o.id, o]));
  const groups = {};
  for (const po of m.programmeOccupations) {
    if (po.programmeId !== programmeId) continue;
    (groups[po.level] ??= []).push({ ...occ[po.occupationId], status: po.validationStatus, sourceIds: po.sourceIds });
  }
  return groups;
}

function worst(a, b) {
  return ACCESS_RANK[a] >= ACCESS_RANK[b] ? a : b;
}
function worstStatus(list) {
  if (list.includes('demo')) return 'demo';
  if (list.includes('to_review')) return 'to_review';
  return 'validated';
}
