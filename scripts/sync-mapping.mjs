// Copie le référentiel « et-si-mapping » dans src/mapping/ et écrit VERSION.json.
// Usage : node scripts/sync-mapping.mjs <chemin/vers/et-si-mapping>
//         (ou variable d'environnement ET_SI_MAPPING_DIR)
// Le dépôt de l'application ne modifie jamais ces fichiers : toute correction se fait
// dans le référentiel, puis on relance ce script et « npm run validate ».
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] ?? process.env.ET_SI_MAPPING_DIR;
if (!src || !existsSync(join(src, 'data', 'mapping.json'))) {
  console.error('Référentiel introuvable. Usage : node scripts/sync-mapping.mjs <chemin/vers/et-si-mapping>');
  process.exit(1);
}
const FILES = [
  'data/mapping.json',
  'data/profile-mapping.json',
  'engine/pathfinder.mjs',
  'engine/pathfinder.d.mts',
  'engine/matching.mjs',
  'engine/matching.d.mts',
  'engine/types.ts',
];
const dest = join(root, 'src', 'mapping');
const sha = {};
for (const f of FILES) {
  const to = join(dest, f);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(src, f), to);
  sha[f] = createHash('sha256').update(readFileSync(to)).digest('hex').slice(0, 16);
}
const m = JSON.parse(readFileSync(join(dest, 'data/mapping.json'), 'utf8'));
const pm = JSON.parse(readFileSync(join(dest, 'data/profile-mapping.json'), 'utf8'));
const version = {
  mapping: m.meta.version,
  profileMapping: pm.meta.version,
  generatedAt: m.meta.generatedAt,
  syncedAt: new Date().toISOString().slice(0, 10),
  sha256: sha,
};
writeFileSync(join(dest, 'VERSION.json'), JSON.stringify(version, null, 2) + '\n');
console.log(`Référentiel ${version.mapping} / ${version.profileMapping} copié dans src/mapping (${FILES.length} fichiers).`);
