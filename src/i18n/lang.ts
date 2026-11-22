export type Lang = 'fr' | 'de' | 'en';
export const LANGS: Lang[] = ['fr', 'de', 'en'];
export const isLang = (x: unknown): x is Lang => x === 'fr' || x === 'de' || x === 'en';
