import { ExplorationTrack, PathwayNode, SituationId } from '../types';

export const SITUATION_LABELS: Record<SituationId, string> = {
  co: 'Au CO / à l’école obligatoire',
  apprentissage: 'En apprentissage',
  college: 'Au collège / gymnase',
  ecg: 'À l’ECG',
  autre: 'Dans une autre situation',
  non_precise: 'Non précisée',
};

export const REFLECTION_LABELS = {
  decouvre: 'Je découvre',
  hesite: 'J’hésite',
  objectif: 'J’ai un objectif',
  idee: 'J’ai une idée à réaliser',
};

export const EXPLORATION_TRACKS: ExplorationTrack[] = [
  {
    id: 'heia',
    title: 'Concevoir et comprendre des solutions',
    school: 'HEIA-FR',
    summary:
      'Imaginer des espaces, des systèmes techniques ou numériques en composant avec des contraintes concrètes.',
    skills: [
      'Analyser un problème technique ou spatial',
      'Prototyper et tester des solutions',
      'Arbitrer entre usages, faisabilité et ressources',
    ],
    tags: ['concevoir', 'construire', 'analyser'],
    nextExperience: 'Visiter une journée portes ouvertes ou un atelier de découverte technique.',
    validationStatus: 'demo',
    sourceUrl: null,
    reviewedAt: null,
  },
  {
    id: 'heg',
    title: 'Organiser et développer des activités',
    school: 'HEG-FR',
    summary:
      'Structurer un projet, répartir des ressources, coordonner des équipes et rendre un service viable.',
    skills: [
      'Planifier et prioriser sous contrainte',
      'Comprendre les besoins d’un public ou d’une organisation',
      'Expliquer et défendre des choix de gestion',
    ],
    tags: ['organiser', 'coordonner', 'analyser'],
    nextExperience: 'Échanger avec un·e étudiant·e ou observer un projet associatif/d’entreprise.',
    validationStatus: 'demo',
    sourceUrl: null,
    reviewedAt: null,
  },
  {
    id: 'heds',
    title: 'Explorer les soins et la santé',
    school: 'HEdS-FR',
    summary:
      'Relier environnement, prévention, bien-être et accompagnement de la santé au quotidien.',
    skills: [
      'Observer les facteurs qui influencent la santé',
      'Adapter un accompagnement à la personne',
      'Collaborer avec plusieurs professionnels du soin',
    ],
    tags: ['soigner', 'ecouter', 'analyser'],
    nextExperience: 'Demander un stage d’observation ou assister à une séance d’information santé.',
    validationStatus: 'demo',
    sourceUrl: null,
    reviewedAt: null,
  },
  {
    id: 'hets',
    title: 'Accompagner et soutenir la participation',
    school: 'HETS-FR',
    summary:
      'Écouter les personnes, faciliter la vie collective et soutenir l’autonomie dans des situations variées.',
    skills: [
      'Mener une écoute active et inclusive',
      'Faciliter la participation d’un groupe',
      'Construire des solutions avec les personnes concernées',
    ],
    tags: ['ecouter', 'accompagner', 'coordonner'],
    nextExperience: 'Rencontrer un·e professionnel·le du travail social ou participer à un projet local.',
    validationStatus: 'demo',
    sourceUrl: null,
    reviewedAt: null,
  },
];

export function buildPathwayForSituation(
  situation: SituationId,
  track: ExplorationTrack
): PathwayNode[] {
  const step1BySituation: Record<SituationId, { title: string; detail: string }> = {
    co: {
      title: 'Explorer le secondaire II',
      detail: 'Comparer les voies possibles après l’école obligatoire (apprentissage, ECG, collège).',
    },
    apprentissage: {
      title: 'Valoriser ton apprentissage',
      detail: 'Vérifier le lien entre ton domaine actuel et une éventuelle maturité professionnelle.',
    },
    college: {
      title: 'Relier ta formation générale à la pratique',
      detail: 'Identifier si une expérience pratique ou une année préparatoire est demandée.',
    },
    ecg: {
      title: 'Explorer les prolongements après l’ECG',
      detail: 'Vérifier les options de maturité spécialisée ou de compléments pratiques.',
    },
    autre: {
      title: 'Faire le point sur ton parcours',
      detail: 'Recenser tes titres, expériences et éventuelles équivalences avec un conseiller.',
    },
    non_precise: {
      title: 'Clarifier ton point de départ',
      detail: 'Choisir une situation de départ ci-dessus pour afficher des étapes plus parlantes.',
    },
  };

  return [
    {
      id: `${track.id}-n1`,
      stepLabel: 'Situation actuelle',
      title: SITUATION_LABELS[situation],
      detail: 'Point de départ déclaré dans cette exploration.',
      validationStatus: 'demo',
      sourceUrl: null,
      reviewedAt: null,
    },
    {
      id: `${track.id}-n2`,
      stepLabel: 'Prochaine étape à explorer',
      title: step1BySituation[situation].title,
      detail: step1BySituation[situation].detail,
      validationStatus: 'to_review',
      sourceUrl: null,
      reviewedAt: null,
    },
    {
      id: `${track.id}-n3`,
      stepLabel: 'Titre ou expérience à vérifier',
      title: 'Conditions à vérifier',
      detail:
        'Les prérequis exacts (maturité, pratique professionnelle, procédures) dépendent de chaque filière.',
      validationStatus: 'to_review',
      sourceUrl: null,
      reviewedAt: null,
    },
    {
      id: `${track.id}-n4`,
      stepLabel: 'Formation supérieure envisagée',
      title: `${track.school} — ${track.title}`,
      detail: 'Piste illustrative à confirmer sur le site officiel de l’école ou en séance d’information.',
      validationStatus: 'demo',
      sourceUrl: null,
      reviewedAt: null,
    },
  ];
}
