// Libellés des données du référentiel dans les trois langues.
// Le référentiel reste en français : ces tables habillent ses identifiants, sans le modifier.
// Les traductions DE et EN sont à relire (terminologie cantonale comprise).
import type { Lang } from './lang';
import { CREDENTIALS, PM, PROGRAMMES, REQUIREMENTS, TRAININGS } from '../domain/data';
import type { SchoolId } from '../mapping/engine/types';

type L3 = Record<Lang, string>;
const pick = (table: Record<string, L3>, id: string, lang: Lang, fallback: string): string => table[id]?.[lang] ?? table[id]?.fr ?? fallback;

const PROGRAMME: Record<string, L3> = {
  ba_heia_archi: { fr: 'Architecture', de: 'Architektur', en: 'Architecture' },
  ba_heia_chimie: { fr: 'Chimie', de: 'Chemie', en: 'Chemistry' },
  ba_heia_gc: { fr: 'Génie civil', de: 'Bauingenieurwesen', en: 'Civil Engineering' },
  ba_heia_ge: { fr: 'Génie électrique', de: 'Elektrotechnik', en: 'Electrical Engineering' },
  ba_heia_gm: { fr: 'Génie mécanique', de: 'Maschinentechnik', en: 'Mechanical Engineering' },
  ba_heia_isc: { fr: 'Informatique et systèmes de communication', de: 'Informatik und Kommunikationssysteme', en: 'Computer Science and Communication Systems' },
  ba_heg_ee: { fr: 'Économie d’entreprise', de: 'Betriebsökonomie', en: 'Business Administration' },
  ba_heds_si: { fr: 'Soins infirmiers', de: 'Pflege', en: 'Nursing' },
  ba_heds_osteo: { fr: 'Ostéopathie', de: 'Osteopathie', en: 'Osteopathy' },
  ba_hets_ts: { fr: 'Travail social', de: 'Soziale Arbeit', en: 'Social Work' },
};

/** Nom court d'une filière. Les Masters gardent leur intitulé officiel. */
export const programmeName = (id: string, lang: Lang): string => pick(PROGRAMME, id, lang, PROGRAMMES[id]?.title ?? id);

const SCHOOL_CODE: Record<SchoolId, L3> = {
  heia: { fr: 'HEIA-FR', de: 'HTA-FR', en: 'HEIA-FR' },
  heg: { fr: 'HEG-FR', de: 'HSW-FR', en: 'HEG-FR' },
  heds: { fr: 'HEdS-FR', de: 'HfG-FR', en: 'HEdS-FR' },
  hets: { fr: 'HETS-FR', de: 'HSA-FR', en: 'HETS-FR' },
};
const SCHOOL_NAME: Record<SchoolId, L3> = {
  heia: { fr: 'Haute école d’ingénierie et d’architecture de Fribourg', de: 'Hochschule für Technik und Architektur Freiburg', en: 'School of Engineering and Architecture of Fribourg' },
  heg: { fr: 'Haute école de gestion Fribourg', de: 'Hochschule für Wirtschaft Freiburg', en: 'School of Management Fribourg' },
  heds: { fr: 'Haute école de santé Fribourg', de: 'Hochschule für Gesundheit Freiburg', en: 'School of Health Sciences Fribourg' },
  hets: { fr: 'Haute école de travail social Fribourg', de: 'Hochschule für Soziale Arbeit Freiburg', en: 'School of Social Work Fribourg' },
};
export const schoolCode = (s: SchoolId, lang: Lang): string => SCHOOL_CODE[s][lang];
export const schoolName = (s: SchoolId, lang: Lang): string => SCHOOL_NAME[s][lang];

// --- Cartes « Est-ce que tu aimerais… » : texte complet (DE, EN) et forme courte pour les raisons.
const CARD: Record<string, { de: string; en: string; short: L3 }> = {
  q01: { de: 'einen Gegenstand auseinandernehmen, um zu verstehen, wie er funktioniert.', en: 'take an object apart to understand how it works.', short: { fr: 'démonter un objet pour le comprendre', de: 'einen Gegenstand auseinandernehmen', en: 'taking an object apart' } },
  q02: { de: 'mit deinen Händen etwas Konkretes herstellen (Holz, Metall, Modell).', en: 'make something real with your hands (wood, metal, a model).', short: { fr: 'fabriquer de tes mains', de: 'mit den Händen etwas herstellen', en: 'making things with your hands' } },
  q03: { de: 'einen Plan, ein Teil oder eine Einrichtung massgenau zeichnen.', en: 'draw a plan, a part or a layout to exact measurements.', short: { fr: 'dessiner un plan avec des mesures', de: 'einen Plan massgenau zeichnen', en: 'drawing a plan to scale' } },
  q04: { de: 'ein elektronisches Gerät anschliessen, reparieren oder programmieren.', en: 'connect, repair or program an electronic device.', short: { fr: 'réparer ou programmer un appareil', de: 'ein Gerät reparieren oder programmieren', en: 'repairing or programming a device' } },
  q05: { de: 'ein kleines Programm schreiben, eine Website erstellen oder eine Aufgabe am Computer automatisieren.', en: 'write a small program, build a website or automate a task on a computer.', short: { fr: 'programmer ou créer un site', de: 'programmieren oder eine Website erstellen', en: 'coding or building a website' } },
  q06: { de: 'ein Experiment durchführen, messen und die Ergebnisse sorgfältig notieren.', en: 'run an experiment, measure and note the results carefully.', short: { fr: 'faire une expérience et mesurer', de: 'ein Experiment durchführen und messen', en: 'running an experiment and measuring' } },
  q07: { de: 'eine knifflige Mathe- oder Logikaufgabe lösen.', en: 'solve a maths or logic problem that will not give in.', short: { fr: 'résoudre un problème de maths', de: 'eine Matheaufgabe lösen', en: 'solving a maths problem' } },
  q08: { de: 'einen Gegenstand, ein Plakat oder eine Stimmung erfinden, die es so noch nicht gibt.', en: 'invent an object, a poster or an atmosphere unlike anything that exists.', short: { fr: 'inventer un objet ou une affiche', de: 'etwas Neues gestalten', en: 'inventing an object or a poster' } },
  q09: { de: 'einen Klassenausflug organisieren: Budget, Zeiten, Anmeldungen.', en: 'organise a class outing: budget, timetable, sign-ups.', short: { fr: 'organiser une sortie', de: 'einen Ausflug organisieren', en: 'organising an outing' } },
  q10: { de: 'eine Gruppe anführen und entscheiden, wenn es nötig ist.', en: 'take the lead of a group and decide when a call has to be made.', short: { fr: 'prendre la tête d’un groupe', de: 'eine Gruppe anführen', en: 'leading a group' } },
  q11: { de: 'jemanden überzeugen, eine Idee oder ein Produkt verkaufen.', en: 'convince someone, sell an idea or a product.', short: { fr: 'convaincre, vendre une idée', de: 'überzeugen, eine Idee verkaufen', en: 'convincing people, selling an idea' } },
  q12: { de: 'einer Freundin oder einem Freund zuhören, dem es schlecht geht, und bei der Lösung helfen.', en: 'listen to a friend who is struggling and help them find a way forward.', short: { fr: 'écouter un·e ami·e qui va mal', de: 'jemandem zuhören, dem es schlecht geht', en: 'listening to a friend who is struggling' } },
  q13: { de: 'dich um jemanden kümmern, der krank, verletzt oder alt ist.', en: 'look after someone who is ill, injured or elderly.', short: { fr: 't’occuper de quelqu’un de malade', de: 'dich um kranke Menschen kümmern', en: 'looking after someone who is ill' } },
  q14: { de: 'Jüngeren etwas erklären und sehen, wie sie Fortschritte machen.', en: 'explain something to younger children and watch them improve.', short: { fr: 'expliquer à des plus jeunes', de: 'Jüngeren etwas erklären', en: 'explaining things to younger children' } },
  q15: { de: 'eine Aktivität oder ein Projekt für eine Gruppe oder ein Quartier leiten.', en: 'run an activity or a project for a group or a neighbourhood.', short: { fr: 'animer une activité pour un groupe', de: 'eine Aktivität für eine Gruppe leiten', en: 'running an activity for a group' } },
  q16: { de: 'mehrere Sprachen sprechen, dich mit Menschen von anderswo austauschen.', en: 'speak several languages, talk with people from elsewhere.', short: { fr: 'parler plusieurs langues', de: 'mehrere Sprachen sprechen', en: 'speaking several languages' } },
  q17: { de: 'Texte lesen oder schreiben, eine komplizierte Information zusammenfassen.', en: 'read or write texts, sum up complicated information.', short: { fr: 'lire et écrire des textes', de: 'Texte lesen und schreiben', en: 'reading and writing texts' } },
  q18: { de: 'verstehen, wie der menschliche Körper funktioniert.', en: 'understand how the human body works.', short: { fr: 'comprendre le corps humain', de: 'den menschlichen Körper verstehen', en: 'understanding the human body' } },
  q19: { de: 'draussen arbeiten, bei jedem Wetter.', en: 'work outdoors, whatever the weather.', short: { fr: 'travailler dehors', de: 'draussen arbeiten', en: 'working outdoors' } },
  q20: { de: 'dich bewegen, tragen, tagsüber körperlich aktiv sein.', en: 'move, carry things, be physically active during the day.', short: { fr: 'bouger pendant la journée', de: 'körperlich aktiv sein', en: 'being physically active' } },
  q21: { de: 'allein an einer Arbeit vorankommen, in deinem Tempo.', en: 'get on with a piece of work on your own, at your own pace.', short: { fr: 'avancer seul·e à ton rythme', de: 'allein im eigenen Tempo arbeiten', en: 'working alone at your own pace' } },
  q22: { de: 'Teil eines Teams sein, in dem jede Person ihre Rolle hat.', en: 'be part of a team where everyone has a role.', short: { fr: 'faire partie d’une équipe', de: 'Teil eines Teams sein', en: 'being part of a team' } },
  q23: { de: 'einer genauen Anleitung folgen und prüfen, ob alles stimmt.', en: 'follow precise instructions and check that everything is right.', short: { fr: 'suivre une marche à suivre précise', de: 'einer genauen Anleitung folgen', en: 'following precise instructions' } },
  q24: { de: 'Zahlen, Lager oder Bestellungen verwalten.', en: 'manage figures, stock or orders.', short: { fr: 'gérer des chiffres ou des stocks', de: 'Zahlen oder Lager verwalten', en: 'managing figures or stock' } },
  q25: { de: 'jeden Tag mit Kundschaft, Patientinnen und Patienten oder Publikum zu tun haben.', en: 'deal with customers, patients or the public every day.', short: { fr: 'être en contact avec du public', de: 'täglich mit Menschen zu tun haben', en: 'dealing with the public every day' } },
  q26: { de: 'etwas Grosses bauen oder renovieren: Haus, Strasse, Brücke.', en: 'build or renovate something big: a house, a road, a bridge.', short: { fr: 'bâtir quelque chose de grand', de: 'etwas Grosses bauen', en: 'building something big' } },
  q27: { de: 'eine Maschine oder eine automatisierte Anlage steuern oder einstellen.', en: 'operate or set up a machine or an automated system.', short: { fr: 'piloter ou régler une machine', de: 'eine Maschine steuern oder einstellen', en: 'operating or setting up a machine' } },
  q28: { de: 'dich um Tiere oder Pflanzen kümmern.', en: 'take care of animals or plants.', short: { fr: 'prendre soin d’animaux ou de plantes', de: 'dich um Tiere oder Pflanzen kümmern', en: 'taking care of animals or plants' } },
  q29: { de: 'für andere kochen, ein Rezept erfinden.', en: 'cook for others, invent a recipe.', short: { fr: 'préparer à manger pour d’autres', de: 'für andere kochen', en: 'cooking for others' } },
  q30: { de: 'oft den Ort wechseln: Baustellen, Kundschaft, verschiedene Standorte.', en: 'change places often: building sites, clients, different locations.', short: { fr: 'changer souvent de lieu', de: 'oft den Ort wechseln', en: 'changing places often' } },
};
const ITEM_TEXT = Object.fromEntries(PM.questionnaire.items.map((i) => [i.id, i.text]));
const lowerFirst = (s: string): string => (s ? s[0].toLowerCase() + s.slice(1) : s);

/** Texte d'une carte, à lire après « Est-ce que tu aimerais… ». */
export const cardText = (id: string, lang: Lang): string => (lang === 'fr' ? lowerFirst(ITEM_TEXT[id] ?? id) : CARD[id]?.[lang] ?? lowerFirst(ITEM_TEXT[id] ?? id));
export const cardShort = (id: string, lang: Lang): string => CARD[id]?.short[lang] ?? cardText(id, lang);

// --- Cartes « Mes forces »
const QUALITY: Record<string, { de: string; en: string }> = {
  s01: { de: 'Ich verstehe schnell, wie Dinge funktionieren.', en: 'I quickly understand how things work.' },
  s02: { de: 'Ich kann mir einen Gegenstand im Kopf von allen Seiten vorstellen.', en: 'I can picture an object in my head from every angle.' },
  s03: { de: 'Ich arbeite genau und kontrolliere meine Arbeit.', en: 'I am precise and I check my work.' },
  s04: { de: 'Ich organisiere mich gut und plane im Voraus.', en: 'I am well organised and plan ahead.' },
  s05: { de: 'Ich spüre, was andere fühlen.', en: 'I can sense what other people feel.' },
  s06: { de: 'Ich gehe leicht auf Menschen zu, die ich nicht kenne.', en: 'I find it easy to approach people I do not know.' },
  s07: { de: 'Ich bleibe ruhig, wenn es dringend wird.', en: 'I stay calm when things get urgent.' },
  s08: { de: 'Ich habe oft originelle Ideen.', en: 'I often have original ideas.' },
  s09: { de: 'Ich bin geschickt mit den Händen.', en: 'I am good with my hands.' },
  s10: { de: 'Ich lasse ein Problem nicht los, bevor es gelöst ist.', en: 'I do not let go of a problem until it is solved.' },
  s11: { de: 'Ich ergreife die Initiative und übernehme Verantwortung.', en: 'I take the initiative and take on responsibility.' },
  s12: { de: 'Ich bin körperlich ausdauernd.', en: 'I have physical stamina.' },
  s13: { de: 'Ich arbeite gut im Team.', en: 'I work well in a team.' },
  s14: { de: 'Mathe fällt mir leicht.', en: 'I am comfortable with maths.' },
  s15: { de: 'Ich mag Naturwissenschaften und bin gut darin.', en: 'I enjoy science and do well in it.' },
  s16: { de: 'Ich lerne Sprachen leicht.', en: 'I pick up languages easily.' },
  s17: { de: 'Ich schreibe leicht klare Texte.', en: 'I find it easy to write clear texts.' },
  s18: { de: 'Ich bin geduldig und höre zu.', en: 'I am patient and a good listener.' },
  s19: { de: 'Ich bin sorgfältig; Ordnung und Hygiene sind mir wichtig.', en: 'I am careful; tidiness and hygiene matter to me.' },
  s20: { de: 'Ich entdecke gern neue Technologien und finde mich schnell zurecht.', en: 'I enjoy discovering new technologies and adapt to them quickly.' },
  s21: { de: 'Ich kann gut mit abstrakten Ideen umgehen und zusammenfassen.', en: 'I reason easily about abstract ideas and can summarise.' },
  s22: { de: 'Ich bin höflich, diskret und freundlich im Empfang.', en: 'I am polite, discreet and welcoming.' },
  s23: { de: 'Ich behalte leicht, was ich lerne.', en: 'I easily remember what I learn.' },
  s24: { de: 'Ich zeichne gut und habe ein Gefühl für Formen und Farben.', en: 'I draw well and have an eye for shapes and colours.' },
  s25: { de: 'Ich verhandle und überzeuge gern.', en: 'I enjoy negotiating and convincing.' },
};
const QUALITY_TEXT = Object.fromEntries(PM.questionnaire.qualityItems.map((i) => [i.id, i.text]));
export const qualityText = (id: string, lang: Lang): string => (lang === 'fr' ? QUALITY_TEXT[id] ?? id : QUALITY[id]?.[lang] ?? QUALITY_TEXT[id] ?? id);

// --- Formations (étapes du sentier)
const TRAINING: Record<string, L3> = {
  tr_afp: { fr: 'Apprentissage AFP', de: 'Lehre EBA', en: 'Two-year apprenticeship (AFP)' },
  tr_afp_cfc: { fr: 'Complément vers le CFC', de: 'Verkürzte Lehre zum EFZ', en: 'Shortened apprenticeship to the CFC' },
  tr_cfc: { fr: 'Apprentissage CFC', de: 'Lehre EFZ', en: 'Apprenticeship (CFC)' },
  tr_cfc_mp1: { fr: 'Apprentissage CFC avec maturité intégrée', de: 'Lehre EFZ mit integrierter Berufsmaturität (BM 1)', en: 'Apprenticeship (CFC) with integrated vocational baccalaureate' },
  tr_mp2: { fr: 'Maturité professionnelle après le CFC', de: 'Berufsmaturität nach der Lehre (BM 2)', en: 'Vocational baccalaureate after the apprenticeship' },
  tr_ec: { fr: 'École de commerce', de: 'Handelsmittelschule', en: 'Full-time commercial school' },
  tr_emf: { fr: 'École des métiers de Fribourg (EMF)', de: 'Berufsfachschule Freiburg (EMF)', en: 'Fribourg trade school (EMF)' },
  tr_essg: { fr: 'École professionnelle santé-social (ESSG)', de: 'Berufsfachschule Soziales-Gesundheit (ESSG)', en: 'Health and social care vocational school (ESSG)' },
  tr_eikon: { fr: 'eikon, école d’arts appliqués', de: 'eikon, Berufsfachschule für Gestaltung', en: 'eikon, school of applied arts' },
  tr_ecg: { fr: 'École de culture générale (ECG)', de: 'Fachmittelschule (FMS)', en: 'Upper-secondary specialised school (ECG)' },
  tr_ms: { fr: 'Maturité spécialisée', de: 'Fachmaturität', en: 'Specialised baccalaureate' },
  tr_ms_sante: { fr: 'Maturité spécialisée santé', de: 'Fachmaturität Gesundheit', en: 'Specialised baccalaureate in health' },
  tr_ms_scexp: { fr: 'Maturité spécialisée sciences expérimentales (pilote)', de: 'Fachmaturität Naturwissenschaften (Pilotprojekt)', en: 'Specialised baccalaureate in experimental sciences (pilot)' },
  tr_ms_ts: { fr: 'Maturité spécialisée travail social', de: 'Fachmaturität Soziale Arbeit', en: 'Specialised baccalaureate in social work' },
  tr_ms_ped: { fr: 'Maturité spécialisée pédagogie', de: 'Fachmaturität Pädagogik', en: 'Specialised baccalaureate in education' },
  tr_ecg_cfc: { fr: 'CFC après le certificat ECG', de: 'Lehre EFZ nach dem FMS-Ausweis', en: 'Apprenticeship after the ECG certificate' },
  tr_gym: { fr: 'Collège (gymnase)', de: 'Kollegium (Gymnasium)', en: 'Collège (academic upper-secondary school)' },
  tr_es: { fr: 'École supérieure (ES)', de: 'Höhere Fachschule (HF)', en: 'Professional college (ES)' },
  tr_mc_sante: { fr: 'Modules complémentaires santé', de: 'Zusatzmodule Gesundheit', en: 'Complementary health modules' },
  tr_asd: { fr: 'Dossier d’admission (dès 25 ans)', de: 'Aufnahmedossier (ab 25 Jahren)', en: 'Admission portfolio (from age 25)' },
};
export const trainingLabel = (id: string, lang: Lang, anyMs = false): string => pick(TRAINING, anyMs ? 'tr_ms' : id, lang, TRAININGS[id]?.label ?? id);

// --- Titres obtenus
const CREDENTIAL: Record<string, L3> = {
  cr_afp: { fr: 'AFP', de: 'EBA', en: 'AFP certificate' },
  cr_cfc: { fr: 'CFC', de: 'EFZ', en: 'CFC (Federal VET Diploma)' },
  cr_cfc_mp: { fr: 'CFC et maturité professionnelle', de: 'EFZ und Berufsmaturität', en: 'CFC and vocational baccalaureate' },
  cr_ecg_sante: { fr: 'Certificat ECG santé', de: 'FMS-Ausweis Gesundheit', en: 'ECG certificate (health)' },
  cr_ecg_ts: { fr: 'Certificat ECG travail social', de: 'FMS-Ausweis Soziale Arbeit', en: 'ECG certificate (social work)' },
  cr_ecg_ped: { fr: 'Certificat ECG pédagogie', de: 'FMS-Ausweis Pädagogik', en: 'ECG certificate (education)' },
  cr_ecg: { fr: 'Certificat ECG', de: 'FMS-Ausweis', en: 'ECG certificate' },
  cr_ms: { fr: 'Maturité spécialisée', de: 'Fachmaturität', en: 'Specialised baccalaureate' },
  cr_ms_sante: { fr: 'Maturité spécialisée santé', de: 'Fachmaturität Gesundheit', en: 'Specialised baccalaureate in health' },
  cr_ms_scexp: { fr: 'Maturité spécialisée sciences expérimentales', de: 'Fachmaturität Naturwissenschaften', en: 'Specialised baccalaureate in experimental sciences' },
  cr_ms_ts: { fr: 'Maturité spécialisée travail social', de: 'Fachmaturität Soziale Arbeit', en: 'Specialised baccalaureate in social work' },
  cr_ms_ped: { fr: 'Maturité spécialisée pédagogie', de: 'Fachmaturität Pädagogik', en: 'Specialised baccalaureate in education' },
  cr_ecg_cfc: { fr: 'Certificat ECG et CFC', de: 'FMS-Ausweis und EFZ', en: 'ECG certificate and CFC' },
  cr_mat_gym: { fr: 'Maturité gymnasiale', de: 'Gymnasiale Maturität', en: 'Academic baccalaureate' },
  cr_es: { fr: 'Diplôme ES', de: 'HF-Diplom', en: 'ES diploma' },
  cr_mc_sante: { fr: 'Attestation des modules complémentaires', de: 'Bestätigung der Zusatzmodule', en: 'Complementary modules certificate' },
  cr_asd: { fr: 'Dossier jugé recevable', de: 'Dossier zugelassen', en: 'Portfolio accepted' },
};
export const credentialLabel = (id: string, lang: Lang, generic = false): string => {
  const key = generic && id.startsWith('cr_ms_') ? 'cr_ms' : generic && /^cr_ecg_(sante|ts|ped)$/.test(id) ? 'cr_ecg' : id;
  return pick(CREDENTIAL, key, lang, CREDENTIALS[id]?.label ?? id);
};

// --- Exigences
const REQUIREMENT: Record<string, L3> = {
  EMT_1AN: { fr: 'une année d’expérience du monde du travail dans le domaine', de: 'ein Jahr Arbeitswelterfahrung im Fachbereich', en: 'one year of work experience in the field' },
  ANNEE_PASSERELLE: { fr: 'l’année passerelle de la HEIA-FR', de: 'das Passerellejahr der HTA-FR', en: 'the HEIA-FR bridging year' },
  PIBS: { fr: 'le Bachelor intégré à la pratique (PiBS) : quatre ans au lieu de trois, avec un contrat de stage en entreprise', de: 'das praxisintegrierte Bachelorstudium (PiBS): vier statt drei Jahre, mit einem Praktikumsvertrag in einem Unternehmen', en: 'the practice-integrated Bachelor (PiBS): four years instead of three, with a company internship contract' },
  STAGE_ARCHI: { fr: 'une année de stage dans un bureau d’architecture reconnu', de: 'ein Jahr Praktikum in einem anerkannten Architekturbüro', en: 'a one-year internship in a recognised architecture office' },
  COMPL_MATH_PHYS: { fr: 'des compléments en mathématiques et en physique', de: 'Ergänzungen in Mathematik und Physik', en: 'additional courses in maths and physics' },
  PRATIQUE_ECO_1AN: { fr: 'une année de pratique professionnelle dans le domaine de l’économie', de: 'ein Jahr Berufspraxis im Bereich Wirtschaft', en: 'one year of professional practice in business' },
  EMPLOI_50: { fr: 'pour la voie en emploi : une activité d’au moins 50 % dans le domaine', de: 'für das berufsbegleitende Studium: eine Tätigkeit von mindestens 50 % im Fachbereich', en: 'for the work-study route: a job of at least 50% in the field' },
  EXP_SOCIAL_20: { fr: '20 semaines d’expérience dans le travail social', de: '20 Wochen Erfahrung in der Sozialen Arbeit', en: '20 weeks’ experience in social work' },
  EXP_40_DONT_20: { fr: '40 semaines d’expérience, dont 20 dans le travail social', de: '40 Wochen Erfahrung, davon 20 in der Sozialen Arbeit', en: '40 weeks’ experience, 20 of them in social work' },
  REGULATION: { fr: 'la procédure de régulation (places limitées)', de: 'das Regulierungsverfahren (begrenzte Plätze)', en: 'the regulation procedure (limited places)' },
  B2_FR: { fr: 'le français au niveau B2', de: 'Französisch auf Niveau B2', en: 'French at B2 level' },
  ASD_25: { fr: '25 ans révolus et un parcours jugé équivalent', de: 'vollendetes 25. Altersjahr und ein gleichwertiger Werdegang', en: 'being 25 or over with a background judged equivalent' },
  EXAMEN_ADMISSION: { fr: 'un examen d’admission', de: 'eine Aufnahmeprüfung', en: 'an entrance exam' },
  SELECTION_DOSSIER: { fr: 'une sélection sur dossier, dans la limite des places', de: 'eine Auswahl «sur dossier» im Rahmen der Plätze', en: 'selection by portfolio, subject to places' },
  ANGLAIS_B2: { fr: 'l’anglais au niveau B2', de: 'Englisch auf Niveau B2', en: 'English at B2 level' },
  STAGE_8_SEM: { fr: 'un stage de 8 semaines', de: 'ein Praktikum von 8 Wochen', en: 'an 8-week internship' },
  EMPLOI_SOINS_40_60: { fr: 'pour la voie en emploi : une activité de 40 à 60 % dans une institution de soins', de: 'für das berufsbegleitende Studium: eine Tätigkeit von 40 bis 60 % in einer Pflegeinstitution', en: 'for the work-study route: a 40 to 60% job in a care institution' },
};
export const requirementLabel = (id: string, lang: Lang): string => pick(REQUIREMENT, id, lang, REQUIREMENTS[id]?.label ?? id);

// --- Hypothèses (qualificatifs des règles)
const QUALIFIER: Record<string, L3> = {
  cfc_liste_filiere: { fr: 'si ton CFC figure dans la liste de la filière', de: 'wenn dein EFZ auf der Liste des Studiengangs steht', en: 'if your CFC is on the programme’s list' },
  cfc_hors_liste: { fr: 'si ton CFC ne figure pas dans la liste de la filière', de: 'wenn dein EFZ nicht auf der Liste des Studiengangs steht', en: 'if your CFC is not on the programme’s list' },
  cfc_ase: { fr: 'avec le CFC d’assistant·e socio-éducatif·ve', de: 'mit dem EFZ Fachfrau/Fachmann Betreuung', en: 'with the social care worker CFC (ASE)' },
  cfc_sante_mp_sante_social: { fr: 'avec un CFC du domaine de la santé et une maturité professionnelle santé-social', de: 'mit einem EFZ im Gesundheitsbereich und der Berufsmaturität Gesundheit und Soziales', en: 'with a health-sector CFC and a vocational baccalaureate in health and social care' },
  mp_economie_services: { fr: 'avec une maturité professionnelle économie et services', de: 'mit der Berufsmaturität Wirtschaft und Dienstleistungen', en: 'with a vocational baccalaureate in business and services' },
  es_domaine: { fr: 'si ton diplôme ES est du même domaine', de: 'wenn dein HF-Diplom aus demselben Fachbereich stammt', en: 'if your ES diploma is in the same field' },
  es_autre_domaine: { fr: 'si ton diplôme ES est d’un autre domaine', de: 'wenn dein HF-Diplom aus einem anderen Fachbereich stammt', en: 'if your ES diploma is in another field' },
  es_sante: { fr: 'avec un diplôme ES du domaine de la santé', de: 'mit einem HF-Diplom im Gesundheitsbereich', en: 'with an ES diploma in health' },
  es_social: { fr: 'avec un diplôme ES du domaine social', de: 'mit einem HF-Diplom im Sozialbereich', en: 'with an ES diploma in the social field' },
};
export const qualifierLabel = (id: string, lang: Lang): string => pick(QUALIFIER, id, lang, id);

// --- Voies (bascules « Et si »)
const VARIANT: Record<string, { chip: L3; via: L3 }> = {
  auto: { chip: { fr: 'le plus court', de: 'der kürzeste Weg', en: 'the shortest way' }, via: { fr: 'le chemin le plus court', de: 'den kürzesten Weg', en: 'the shortest way' } },
  apprentissage: { chip: { fr: 'l’apprentissage', de: 'die Lehre', en: 'an apprenticeship' }, via: { fr: 'l’apprentissage', de: 'die Lehre', en: 'an apprenticeship' } },
  ecole_metiers: { chip: { fr: 'une école de métiers', de: 'eine Berufsfachschule in Vollzeit', en: 'a full-time trade school' }, via: { fr: 'une école de métiers', de: 'eine Berufsfachschule in Vollzeit', en: 'a full-time trade school' } },
  ecg: { chip: { fr: 'l’ECG', de: 'die FMS', en: 'the ECG' }, via: { fr: 'l’ECG', de: 'die FMS', en: 'the ECG' } },
  college: { chip: { fr: 'le collège', de: 'das Kollegium', en: 'the collège' }, via: { fr: 'le collège', de: 'das Kollegium', en: 'the collège' } },
  cfc_mp: { chip: { fr: 'un CFC et la maturité professionnelle', de: 'EFZ und Berufsmaturität', en: 'a CFC and the vocational baccalaureate' }, via: { fr: 'un CFC avec la maturité professionnelle', de: 'ein EFZ mit Berufsmaturität', en: 'a CFC with the vocational baccalaureate' } },
  cfc_mp2: { chip: { fr: 'un CFC, puis la maturité', de: 'EFZ, dann Berufsmaturität', en: 'a CFC, then the baccalaureate' }, via: { fr: 'la maturité professionnelle après le CFC', de: 'die Berufsmaturität nach dem EFZ', en: 'the vocational baccalaureate after the CFC' } },
  ecg_sante: { chip: { fr: 'le certificat ECG santé', de: 'FMS-Ausweis Gesundheit', en: 'the ECG certificate (health)' }, via: { fr: 'le certificat ECG santé', de: 'den FMS-Ausweis Gesundheit', en: 'the ECG certificate (health)' } },
  ecg_ts: { chip: { fr: 'le certificat ECG travail social', de: 'FMS-Ausweis Soziale Arbeit', en: 'the ECG certificate (social work)' }, via: { fr: 'le certificat ECG travail social', de: 'den FMS-Ausweis Soziale Arbeit', en: 'the ECG certificate (social work)' } },
  ecg_ped: { chip: { fr: 'le certificat ECG pédagogie', de: 'FMS-Ausweis Pädagogik', en: 'the ECG certificate (education)' }, via: { fr: 'le certificat ECG pédagogie', de: 'den FMS-Ausweis Pädagogik', en: 'the ECG certificate (education)' } },
  maturite: { chip: { fr: 'la maturité gymnasiale', de: 'gymnasiale Maturität', en: 'the academic baccalaureate' }, via: { fr: 'la maturité gymnasiale', de: 'die gymnasiale Maturität', en: 'the academic baccalaureate' } },
  dossier: { chip: { fr: 'un dossier, dès 25 ans', de: 'ein Dossier, ab 25 Jahren', en: 'a portfolio, from age 25' }, via: { fr: 'l’admission sur dossier', de: 'die Aufnahme «sur dossier»', en: 'admission by portfolio' } },
  es: { chip: { fr: 'un diplôme ES', de: 'ein HF-Diplom', en: 'an ES diploma' }, via: { fr: 'un diplôme ES', de: 'ein HF-Diplom', en: 'an ES diploma' } },
};
export const variantChip = (id: string, lang: Lang): string => VARIANT[id]?.chip[lang] ?? id;
export const variantVia = (id: string, lang: Lang): string => VARIANT[id]?.via[lang] ?? id;

// --- Type de classe
const CLASS: Record<string, L3> = {
  eb: { fr: 'Classe EB (exigences de base)', de: 'Realklasse', en: 'Basic-requirements class (EB)' },
  g: { fr: 'Classe G (générale)', de: 'Sekundarklasse', en: 'General class (G)' },
  pg: { fr: 'Classe PG (prégymnasiale)', de: 'Progymnasialklasse', en: 'Pre-gymnasium class (PG)' },
};
export const classLabel = (id: string, lang: Lang): string => CLASS[id]?.[lang] ?? id;

/** Identifiants couverts par les tables, pour les tests. */
export const LABEL_TABLES = { PROGRAMME, CARD, QUALITY, TRAINING, CREDENTIAL, REQUIREMENT, QUALIFIER, VARIANT };

// --- Conditions d'entrée dans une formation (texte du référentiel -> DE, EN)
const CONDITION: Record<string, { de: string; en: string }> = {
  'Selon résultats et examen d\'admission MP': { de: 'Je nach Noten und Aufnahmeprüfung für die Berufsmaturität', en: 'Depending on results and the vocational baccalaureate entrance exam' },
  '20 points sans note inférieure à 4,5, sinon examen': { de: '20 Punkte ohne Note unter 4,5, sonst Prüfung', en: '20 points with no mark below 4.5, otherwise an exam' },
  '19 points sans note inférieure à 4, sinon examen': { de: '19 Punkte ohne Note unter 4, sonst Prüfung', en: '19 points with no mark below 4, otherwise an exam' },
  'Résultats appropriés (FMS)': { de: 'Entsprechende Leistungen (FMS)', en: 'Suitable results (FMS)' },
  '20 points sans note inférieure à 4,5': { de: '20 Punkte ohne Note unter 4,5', en: '20 points with no mark below 4.5' },
  'Résultats appropriés et conditions cantonales': { de: 'Entsprechende Leistungen und kantonale Bedingungen', en: 'Suitable results and cantonal conditions' },
  'MP d\'un autre domaine': { de: 'Berufsmaturität einer anderen Richtung', en: 'Vocational baccalaureate in another field' },
};
export const conditionLabel = (text: string, lang: Lang): string => (lang === 'fr' ? text : CONDITION[text]?.[lang] ?? text);
