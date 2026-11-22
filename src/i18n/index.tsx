import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { fr, type Key } from './fr';
import { de } from './de';
import { en } from './en';
import { isLang, type Lang } from './lang';

export type { Lang } from './lang';
export type { Key } from './fr';

const DICTS: Record<Lang, Record<Key, string>> = { fr, de, en };

export type Vars = Record<string, string | number>;
export type TFn = (key: Key, vars?: Vars) => string;

/** Typographie française : espace insécable avant ? ! : ; » et après «, pour éviter un signe seul en début de ligne. */
const frenchSpaces = (s: string) => s.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');

export function translate(lang: Lang, key: Key, vars?: Vars): string {
  const raw = DICTS[lang][key] ?? fr[key] ?? key;
  const out = vars ? raw.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`)) : raw;
  return lang === 'fr' ? frenchSpaces(out) : out;
}

/** Signes de liaison : espace insécable avant le signe en français, signe collé en allemand et en anglais. */
export const colon = (lang: Lang): string => (lang === 'fr' ? '\u00a0: ' : ': ');
export const semi = (lang: Lang): string => (lang === 'fr' ? '\u00a0; ' : '; ');

/** Durée lisible : « 3 à 4 ans », « 4 ans », « 4,5 ans ». Jamais un pourcentage. */
export function formatYears(lang: Lang, min: number, max: number = min): string {
  const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', lang === 'en' ? '.' : ','));
  // En français, le pluriel commence à deux : « 0,5 an », « 1,5 an », « 2 ans ».
  const single = lang === 'fr' ? min < 2 : min === 1;
  if (min === max) return translate(lang, single ? 'app.years.one' : 'app.years.many', { n: num(min) });
  return translate(lang, 'app.years.range', { a: num(min), b: num(max) });
}

/** Liste lisible : « a, b et c ». */
export function formatList(lang: Lang, items: string[], word: 'app.and' | 'app.or' = 'app.and'): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${translate(lang, word)} ${items[items.length - 1]}`;
}

export function formatDate(lang: Lang, iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CH' : lang === 'de' ? 'de-CH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Langue de départ : ?lang=, puis choix enregistré, puis langue du navigateur, sinon français. */
export function detectLang(search: string, stored: string | null, navLang: string | undefined): Lang {
  const q = new URLSearchParams(search).get('lang');
  if (isLang(q)) return q;
  if (isLang(stored)) return stored;
  const nav = (navLang ?? '').slice(0, 2).toLowerCase();
  return isLang(nav) ? nav : 'fr';
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
}

const Ctx = createContext<I18n>({ lang: 'fr', setLang: () => undefined, t: (k, v) => translate('fr', k, v) });

export const I18nProvider: React.FC<{ lang: Lang; setLang: (l: Lang) => void; children: React.ReactNode }> = ({ lang, setLang, children }) => {
  const t = useCallback<TFn>((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useI18n = (): I18n => useContext(Ctx);
