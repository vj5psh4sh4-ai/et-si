// Lien à emporter : le code QR contient les réponses, pas un identifiant. Rien ne passe par un serveur.
// Format : #p=<base64url> ; suite de bits décrite ci-dessous, version 1.
import type { ActivityFeedback, CardChoice, FeedbackValue, SavedNotebook, SituationId } from '../types';
import type { Lang } from '../i18n/lang';
import { MISSIONS } from '../data/missions';
import { BACHELOR_IDS } from './data';
import { DEFAULT_PROFILE, freshNotebook } from './notebook';
import { ITEM_IDS, MISSION_ACTIVITY_IDS, QUALITY_ITEM_IDS } from './profile';
import { ALL_VARIANTS } from './routes';

const VERSION = 1;
const SITUATIONS: SituationId[] = ['non_precise', 'co', 'apprentissage', 'college', 'ecg', 'autre'];
const LANG_CODES: Lang[] = ['fr', 'de', 'en'];
const CLASS_TYPES = [null, 'eb', 'g', 'pg'] as const;
const FEEDBACKS: (FeedbackValue | null)[] = [null, 'refaire', 'en_vrai', 'autre_chose', 'ne_sais_pas'];
const VARIANTS = ['auto', ...ALL_VARIANTS];
const MAX_NAME_BYTES = 31;

class BitWriter {
  private bytes: number[] = [];
  private cur = 0;
  private n = 0;
  write(value: number, bits: number) {
    for (let i = bits - 1; i >= 0; i--) {
      this.cur = (this.cur << 1) | ((value >> i) & 1);
      if (++this.n === 8) {
        this.bytes.push(this.cur);
        this.cur = 0;
        this.n = 0;
      }
    }
  }
  finish(): Uint8Array {
    if (this.n) this.bytes.push(this.cur << (8 - this.n));
    return Uint8Array.from(this.bytes);
  }
}

class BitReader {
  private pos = 0;
  constructor(private bytes: Uint8Array) {}
  read(bits: number): number {
    let v = 0;
    for (let i = 0; i < bits; i++) {
      const byte = this.bytes[this.pos >> 3];
      if (byte === undefined) throw new Error('lien tronqué');
      v = (v << 1) | ((byte >> (7 - (this.pos & 7))) & 1);
      this.pos++;
    }
    return v;
  }
}

const toBase64Url = (bytes: Uint8Array): string => {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string): Uint8Array => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

export interface SharePayload {
  lang: Lang;
  notebook: SavedNotebook;
}

/** Encode les réponses et les choix d'un carnet. Les textes libres (idée, questions) ne voyagent pas. */
export function encodeShare(nb: SavedNotebook, lang: Lang, includeName = true): string {
  const w = new BitWriter();
  w.write(VERSION, 4);
  w.write(Math.max(0, SITUATIONS.indexOf(nb.profile.situation)), 3);
  w.write(nb.profile.schoolYear ? nb.profile.schoolYear - 8 : 0, 2);
  w.write(Math.max(0, CLASS_TYPES.indexOf(nb.profile.classType)), 2);
  w.write(Math.max(0, LANG_CODES.indexOf(lang)), 2);
  w.write(Math.max(0, VARIANTS.indexOf(nb.variant)), 4);
  w.write(ITEM_IDS.length, 6);
  for (const id of ITEM_IDS) w.write(nb.answers[id] === undefined ? 0 : nb.answers[id] + 1, 2);
  w.write(QUALITY_ITEM_IDS.length, 6);
  for (const id of QUALITY_ITEM_IDS) w.write(nb.qualityAnswers[id] === undefined ? 0 : nb.qualityAnswers[id] + 1, 2);
  w.write(MISSION_ACTIVITY_IDS.length, 5);
  for (const id of MISSION_ACTIVITY_IDS) {
    const f = [...nb.feedbacks].reverse().find((x) => x.choiceId === id);
    w.write(f ? Math.max(0, FEEDBACKS.indexOf(f.feedback)) : 0, 3);
  }
  w.write(BACHELOR_IDS.length, 5);
  for (const id of BACHELOR_IDS) w.write(nb.savedProgrammeIds.includes(id) ? 1 : 0, 1);
  const name = includeName ? new TextEncoder().encode(nb.profile.nickname.trim()).slice(0, MAX_NAME_BYTES) : new Uint8Array();
  w.write(name.length, 5);
  name.forEach((b) => w.write(b, 8));
  return toBase64Url(w.finish());
}

function feedbackEntry(choiceId: string, feedback: FeedbackValue): ActivityFeedback | null {
  for (const m of MISSIONS) {
    const c = m.scene.choices.find((x) => x.id === choiceId);
    if (!c) continue;
    return {
      missionId: m.id,
      missionTitle: m.title,
      choiceId,
      activityLabel: c.activityLabel,
      tags: c.tags,
      trackId: c.trackId,
      feedback,
      consequenceShown: c.consequences.default,
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

/** Décode un lien. Renvoie null si le lien est illisible ou d'une version inconnue. */
export function decodeShare(code: string): SharePayload | null {
  try {
    const r = new BitReader(fromBase64Url(code.trim()));
    if (r.read(4) !== VERSION) return null;
    const situation = SITUATIONS[r.read(3)] ?? 'non_precise';
    const year = r.read(2);
    const classType = CLASS_TYPES[r.read(2)] ?? null;
    const lang = LANG_CODES[r.read(2)] ?? 'fr';
    const variant = VARIANTS[r.read(4)] ?? 'auto';
    const answers: Record<string, CardChoice> = {};
    const nItems = r.read(6);
    for (let i = 0; i < nItems; i++) {
      const v = r.read(2);
      if (v && ITEM_IDS[i]) answers[ITEM_IDS[i]] = (v - 1) as CardChoice;
    }
    const qualityAnswers: Record<string, CardChoice> = {};
    const nQual = r.read(6);
    for (let i = 0; i < nQual; i++) {
      const v = r.read(2);
      if (v && QUALITY_ITEM_IDS[i]) qualityAnswers[QUALITY_ITEM_IDS[i]] = (v - 1) as CardChoice;
    }
    const feedbacks: ActivityFeedback[] = [];
    const nMissions = r.read(5);
    for (let i = 0; i < nMissions; i++) {
      const fb = FEEDBACKS[r.read(3)];
      const entry = fb && MISSION_ACTIVITY_IDS[i] ? feedbackEntry(MISSION_ACTIVITY_IDS[i], fb) : null;
      if (entry) feedbacks.push(entry);
    }
    const savedProgrammeIds: string[] = [];
    const nProg = r.read(5);
    for (let i = 0; i < nProg; i++) if (r.read(1) && BACHELOR_IDS[i]) savedProgrammeIds.push(BACHELOR_IDS[i]);
    const nameLen = r.read(5);
    const nameBytes = new Uint8Array(nameLen);
    for (let i = 0; i < nameLen; i++) nameBytes[i] = r.read(8);
    const nickname = new TextDecoder('utf-8', { fatal: false }).decode(nameBytes).replace(/[\u0000-\u001f\ufffd]/g, '').slice(0, 24);
    const notebook: SavedNotebook = {
      ...freshNotebook({
        ...DEFAULT_PROFILE,
        nickname,
        situation,
        schoolYear: year ? ((year + 8) as 9 | 10 | 11) : null,
        classType,
      }),
      answers,
      qualityAnswers,
      feedbacks,
      savedProgrammeIds,
      variant,
    };
    return { lang, notebook };
  } catch {
    return null;
  }
}

/** Lit « #p=… » dans l'adresse courante. */
export function readShareHash(hash: string): string | null {
  const m = hash.match(/[#&]p=([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

export function shareUrl(base: string, code: string): string {
  return `${base.replace(/[#?].*$/, '').replace(/\/+$/, '')}/#p=${code}`;
}
