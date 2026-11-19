import { Mission } from '../types';

export const DISCOVERY_CARDS = [
  { id: 'comprendre', label: 'Comprendre comment ça fonctionne', tags: ['analyser', 'construire'] },
  { id: 'aider', label: 'Aider une personne', tags: ['accompagner', 'ecouter'] },
  { id: 'inventer', label: 'Inventer ou fabriquer', tags: ['concevoir', 'construire'] },
  { id: 'organiser', label: 'Organiser un projet', tags: ['organiser', 'coordonner'] },
  { id: 'lieux', label: 'Imaginer des lieux', tags: ['concevoir', 'construire'] },
  { id: 'sante', label: 'Comprendre la santé', tags: ['soigner', 'analyser'] },
  { id: 'numerique', label: 'Créer avec le numérique', tags: ['concevoir', 'analyser'] },
  { id: 'collectif', label: 'Améliorer la vie collective', tags: ['ecouter', 'accompagner'] },
] as const;

export const OBJECTIVE_OPTIONS = [
  { id: 'soigner', label: 'Soigner', tags: ['soigner', 'ecouter'] },
  { id: 'technique', label: 'Concevoir des solutions techniques', tags: ['concevoir', 'construire'] },
  { id: 'accompagner', label: 'Accompagner des personnes', tags: ['accompagner', 'ecouter'] },
  { id: 'gerer', label: 'Développer ou gérer une activité', tags: ['organiser', 'coordonner'] },
  { id: 'espaces', label: 'Concevoir des espaces', tags: ['concevoir', 'construire'] },
  { id: 'autre', label: 'Autre / je ne sais pas', tags: ['analyser', 'ecouter'] },
] as const;

export const IDEA_ANGLES = [
  { id: 'besoins', label: 'Comprendre les besoins', tags: ['ecouter', 'analyser'] },
  { id: 'conception', label: 'Concevoir une solution', tags: ['concevoir', 'construire'] },
  { id: 'accompagnement', label: 'Accompagner les personnes', tags: ['accompagner', 'soigner'] },
  { id: 'organisation', label: 'Organiser sa réalisation', tags: ['organiser', 'coordonner'] },
  { id: 'libre', label: 'Exploration libre', tags: ['ecouter', 'concevoir'] },
] as const;

export const MISSIONS: Mission[] = [
  {
    id: 'lieu-se-retrouver',
    title: 'Un lieu pour se retrouver',
    intro:
      'Un espace de ton quartier est inutilisé. Une équipe veut en faire un lieu où les jeunes se sentent bien. Tu rejoins le projet.',
    illustrationId: 'lieu',
    tags: ['ecouter', 'concevoir', 'organiser', 'soigner'],
    scene: {
      id: 'lieu-s1',
      prompt: 'Par quoi aimerais-tu commencer ?',
      choices: [
        {
          id: 'lieu-ecouter',
          label: 'Écouter les futurs usagers',
          description: 'Aller à la rencontre des jeunes du quartier avant de dessiner quoi que ce soit.',
          activityLabel: 'Écouter les futurs usagers',
          tags: ['ecouter', 'accompagner'],
          trackId: 'hets',
          microActivity: {
            type: 'pick_questions',
            prompt: 'Choisis deux questions à poser en priorité aux jeunes du quartier :',
            targetCount: 2,
            options: [
              { id: 'q1', label: 'À quel moment de la semaine aurais-tu envie de venir ici ?' },
              { id: 'q2', label: 'Qu’est-ce qui te donnerait envie d’y rester ou au contraire d’en partir ?' },
              { id: 'q3', label: 'Qui devrait décider des règles de vie du lieu ?' },
              { id: 'q4', label: 'Quelles activités manquent aujourd’hui dans le quartier ?' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'q3',
            alt: 'En interrogeant la façon de décider des règles, tu ouvres une vraie discussion sur la confiance et la participation. Il reste à imaginer un cadre qui inclut aussi les plus discrets.',
            default: 'Tu as privilégié l’écoute des personnes qui utiliseront le lieu. Ton équipe comprend mieux leurs attentes. Il reste à transformer ces attentes en décisions concrètes.',
          },
        },
        {
          id: 'lieu-espaces',
          label: 'Imaginer les espaces',
          description: 'Réfléchir à l’aménagement, à la lumière et aux différents usages possibles.',
          activityLabel: 'Imaginer les espaces',
          tags: ['concevoir', 'construire'],
          trackId: 'heia',
          microActivity: {
            type: 'rank_priorities',
            prompt: 'Classe ces trois priorités d’aménagement de la plus importante (1) à la moins urgente (3) :',
            options: [
              { id: 'p1', label: 'Des zones calmes et des zones animées bien séparées' },
              { id: 'p2', label: 'Un mobilier modulable pour changer d’usage facilement' },
              { id: 'p3', label: 'Une entrée accueillante et accessible à toutes et tous' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'p3',
            alt: 'En plaçant l’accessibilité en tête, tu repenses la circulation dès la porte d’entrée. Cela réduit un peu la surface libre, mais rend le lieu immédiatement lisible.',
            default: 'Ton classement met l’accent sur la polyvalence des usages. L’équipe voit mieux comment faire cohabiter calme et animation, mais devra composer avec le budget mobilier.',
          },
        },
        {
          id: 'lieu-organiser',
          label: 'Organiser le projet',
          description: 'Arbitrer le budget de départ et clarifier comment le lieu va tenir dans la durée.',
          activityLabel: 'Organiser le projet',
          tags: ['organiser', 'coordonner'],
          trackId: 'heg',
          microActivity: {
            type: 'allocate_tokens',
            prompt: 'Répartis exactement 6 jetons de ressources entre ces trois postes :',
            totalTokens: 6,
            options: [
              { id: 't1', label: 'Aménagement et matériel' },
              { id: 't2', label: 'Animation et présence humaine' },
              { id: 't3', label: 'Communication et ouverture au quartier' },
            ],
          },
          consequences: {
            altTriggerOptionId: 't2',
            alt: 'Tu as misé fortement sur la présence humaine. Le lieu démarre avec un mobilier simple, mais l’accueil et la régularité sont assurés dès le premier mois.',
            default: 'Tu as cherché un équilibre entre matériel, accueil et visibilité. Cet arbitrage permet de lancer une version test, tout en gardant la question du financement à long terme ouverte.',
          },
        },
        {
          id: 'lieu-bienetre',
          label: 'Explorer le bien-être',
          description: 'Observer comment l’environnement agit sur le repos, le bruit et la santé.',
          activityLabel: 'Explorer le bien-être',
          tags: ['soigner', 'analyser'],
          trackId: 'heds',
          microActivity: {
            type: 'select_constraints',
            prompt: 'Sélectionne deux éléments à examiner en priorité pour le bien-être dans le lieu :',
            targetCount: 2,
            options: [
              { id: 'c1', label: 'L’acoustique et le niveau de bruit en fin de journée' },
              { id: 'c2', label: 'La qualité de l’air, la lumière naturelle et la température' },
              { id: 'c3', label: 'La présence d’un espace de pause sans écrans' },
              { id: 'c4', label: 'L’accès à de l’eau et à une petite restauration saine' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'c1',
            alt: 'Ton attention au bruit révèle un point souvent oublié : un lieu trop sonore fatigue vite et exclut certains jeunes. Il faudra prévoir des matériaux simples pour absorber les sons.',
            default: 'Tu relies concrètement l’environnement physique au bien-être quotidien. L’équipe découvre que la santé se joue aussi dans des détails d’aménagement.',
          },
        },
      ],
    },
  },
  {
    id: 'autonomie-quotidien',
    title: 'Gagner en autonomie au quotidien',
    intro:
      'Une personne qui sort de réadaptation souhaite retrouver plus d’autonomie chez elle. Plusieurs regards peuvent l’aider.',
    illustrationId: 'autonomie',
    tags: ['soigner', 'concevoir', 'accompagner'],
    scene: {
      id: 'auto-s1',
      prompt: 'Sous quel angle veux-tu contribuer ?',
      choices: [
        {
          id: 'auto-soins',
          label: 'Comprendre les gestes du quotidien',
          description: 'Identifier les moments fatigants et les repères de santé à respecter.',
          activityLabel: 'Comprendre les gestes du quotidien',
          tags: ['soigner', 'ecouter'],
          trackId: 'heds',
          microActivity: {
            type: 'pick_questions',
            prompt: 'Choisis deux questions pour mieux comprendre le quotidien de la personne :',
            targetCount: 2,
            options: [
              { id: 'aq1', label: 'Quel moment de la journée te demande le plus d’énergie ?' },
              { id: 'aq2', label: 'Quel geste aimerais-tu absolument réussir seule en premier ?' },
              { id: 'aq3', label: 'Qu’est-ce qui te rassure quand tu te déplaces chez toi ?' },
              { id: 'aq4', label: 'Comment se passent tes temps de repos ?' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'aq2',
            alt: 'En partant de son objectif personnel, tu redonnes du sens aux exercices. L’accompagnement devient plus motivant, même si certaines étapes prendront du temps.',
            default: 'Tu repères les pics de fatigue et les facteurs rassurants. Cela aide à doser l’effort plutôt que de tout vouloir résoudre en une semaine.',
          },
        },
        {
          id: 'auto-technique',
          label: 'Adapter un objet ou un outil',
          description: 'Concevoir une aide simple, fiable et facile à utiliser sans stigmatiser.',
          activityLabel: 'Adapter un objet ou un outil',
          tags: ['concevoir', 'construire'],
          trackId: 'heia',
          microActivity: {
            type: 'select_constraints',
            prompt: 'Choisis deux contraintes techniques à vérifier avant de prototyper :',
            targetCount: 2,
            options: [
              { id: 'ac1', label: 'Prise en main possible avec une seule main' },
              { id: 'ac2', label: 'Entretien et réparation faciles à la maison' },
              { id: 'ac3', label: 'Objet discret qui ne ressemble pas à du matériel médical' },
              { id: 'ac4', label: 'Coût de fabrication raisonnable' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'ac3',
            alt: 'En intégrant la discrétion dès le départ, tu évites un écueil classique : un objet efficace sur le papier mais jamais utilisé par gêne.',
            default: 'Tes contraintes guident un prototype sobre et robuste. Il reste à le faire tester en situation réelle pour repérer les petits blocages.',
          },
        },
        {
          id: 'auto-entourage',
          label: 'Soutenir le lien avec l’entourage',
          description: 'Clarifier le rôle des proches et des services locaux sans retirer l’autonomie.',
          activityLabel: 'Soutenir le lien avec l’entourage',
          tags: ['accompagner', 'coordonner'],
          trackId: 'hets',
          microActivity: {
            type: 'rank_priorities',
            prompt: 'Classe ces trois appuis du plus prioritaire (1) au moins urgent (3) :',
            options: [
              { id: 'ap1', label: 'Clarifier ce que la personne veut faire seule vs avec aide' },
              { id: 'ap2', label: 'Mettre en lien les proches pour éviter l’épuisement d’une seule personne' },
              { id: 'ap3', label: 'Repérer les activités de quartier accessibles dès maintenant' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'ap1',
            alt: 'Poser clairement la frontière entre aide et autonomie évite bien des malentendus. Les proches savent mieux quand intervenir… et quand laisser faire.',
            default: 'Tu penses le retour à domicile comme un écosystème humain. Cela soulage l’entourage et garde la personne reliée à sa vie sociale.',
          },
        },
      ],
    },
  },
  {
    id: 'service-campus',
    title: 'Un service utile sur le campus',
    intro:
      'Des étudiant·e·s veulent lancer un service de prêt de matériel et d’entraide. Tu aides à le faire exister.',
    illustrationId: 'campus',
    tags: ['organiser', 'concevoir', 'ecouter'],
    scene: {
      id: 'campus-s1',
      prompt: 'Quelle partie du projet t’attire le plus ?',
      choices: [
        {
          id: 'campus-modele',
          label: 'Structurer le fonctionnement',
          description: 'Définir comment gérer le stock, le temps des bénévoles et la continuité.',
          activityLabel: 'Structurer le fonctionnement',
          tags: ['organiser', 'coordonner'],
          trackId: 'heg',
          microActivity: {
            type: 'allocate_tokens',
            prompt: 'Répartis 6 jetons d’effort pour lancer le service sur un semestre :',
            totalTokens: 6,
            options: [
              { id: 'ct1', label: 'Règles simples de prêt et suivi du stock' },
              { id: 'ct2', label: 'Partenariats pour récupérer du matériel' },
              { id: 'ct3', label: 'Communication sur le campus' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'ct2',
            alt: 'En sécurisant des partenaires dès le début, tu démarres avec un stock varié. Il faudra maintenant rendre le prêt fluide pour que le matériel circule vraiment.',
            default: 'Tu poses des bases claires pour éviter que le service ne s’essouffle après trois semaines. Reste à tester si les règles sont assez simples pour les usagers.',
          },
        },
        {
          id: 'campus-numerique',
          label: 'Concevoir l’outil numérique',
          description: 'Imaginer une interface légère pour réserver sans créer une usine à gaz.',
          activityLabel: 'Concevoir l’outil numérique',
          tags: ['concevoir', 'analyser'],
          trackId: 'heia',
          microActivity: {
            type: 'rank_priorities',
            prompt: 'Classe ces trois qualités de l’outil de la plus cruciale (1) à la moins urgente (3) :',
            options: [
              { id: 'cp1', label: 'Réserver un objet en moins de 30 secondes sur mobile' },
              { id: 'cp2', label: 'Voir immédiatement si l’objet est disponible ou en réparation' },
              { id: 'cp3', label: 'Respecter la vie privée avec un minimum de données demandées' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'cp3',
            alt: 'En plaçant la sobriété des données en tête, tu gagnes la confiance des étudiant·e·s et tu simplifies la maintenance technique.',
            default: 'Tu privilégies la rapidité et la clarté d’usage. L’outil a de bonnes chances d’être adopté, à condition que la mise à jour du stock reste facile côté équipe.',
          },
        },
        {
          id: 'campus-inclusion',
          label: 'Rendre le service vraiment accessible',
          description: 'Vérifier que celles et ceux qui en ont le plus besoin osent l’utiliser.',
          activityLabel: 'Rendre le service vraiment accessible',
          tags: ['ecouter', 'accompagner'],
          trackId: 'hets',
          microActivity: {
            type: 'select_constraints',
            prompt: 'Sélectionne deux freins à lever en priorité :',
            targetCount: 2,
            options: [
              { id: 'cc1', label: 'La gêne de demander de l’aide devant d’autres personnes' },
              { id: 'cc2', label: 'Les horaires d’ouverture incompatibles avec les jobs étudiants' },
              { id: 'cc3', label: 'Le jargon administratif ou des cautions trop élevées' },
              { id: 'cc4', label: 'Le manque d’information pour les nouveaux arrivants' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'cc1',
            alt: 'Tu mets le doigt sur un frein invisible : le regard des autres. Un accueil banalisé et chaleureux change totalement la fréquentation du service.',
            default: 'Tu lèves des obstacles très concrets qui auraient exclu une partie du public. Le service devient plus juste et plus utile dès son ouverture.',
          },
        },
      ],
    },
  },
  {
    id: 'evenement-rassemble',
    title: 'Un événement qui rassemble',
    intro:
      'Ta commune organise une journée ouverte mêlant découvertes, ateliers et rencontres. Tu intègres l’équipe d’organisation.',
    illustrationId: 'evenement',
    tags: ['coordonner', 'organiser', 'soigner', 'accompagner'],
    scene: {
      id: 'evt-s1',
      prompt: 'Quel rôle as-tu envie d’essayer ?',
      choices: [
        {
          id: 'evt-coord',
          label: 'Coordonner le programme et la logistique',
          description: 'Faire tenir les horaires, les imprévus et le budget sans perdre le sens de la journée.',
          activityLabel: 'Coordonner le programme et la logistique',
          tags: ['organiser', 'coordonner'],
          trackId: 'heg',
          microActivity: {
            type: 'allocate_tokens',
            prompt: 'Répartis 6 jetons pour sécuriser le jour J :',
            totalTokens: 6,
            options: [
              { id: 'et1', label: 'Plan B météo et logistique' },
              { id: 'et2', label: 'Briefing et coordination des bénévoles' },
              { id: 'et3', label: 'Signalétique et accueil du public' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'et2',
            alt: 'Des bénévoles bien briefés savent réagir vite face aux imprévus. L’ambiance reste sereine même quand le programme prend dix minutes de retard.',
            default: 'Ton arbitrage limite les gros couacs matériels. La journée tourne de façon fluide, et l’équipe garde de l’énergie pour profiter des rencontres.',
          },
        },
        {
          id: 'evt-sante',
          label: 'Veiller au confort et à la prévention',
          description: 'Préparer les points d’eau, les zones de calme et les bons réflexes de prévention.',
          activityLabel: 'Veiller au confort et à la prévention',
          tags: ['soigner', 'analyser'],
          trackId: 'heds',
          microActivity: {
            type: 'select_constraints',
            prompt: 'Choisis deux points de prévention à préparer en priorité :',
            targetCount: 2,
            options: [
              { id: 'ec1', label: 'Points d’ombre, d’eau et places assises pour tous les âges' },
              { id: 'ec2', label: 'Repères clairs en cas de malaise ou de petit bobo' },
              { id: 'ec3', label: 'Espace calme pour les personnes sensibles à la foule' },
              { id: 'ec4', label: 'Information claire sur les allergènes aux stands repas' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'ec3',
            alt: 'Créer une zone calme permet à des familles et des personnes vite surstimulées de rester plus longtemps. La prévention devient un vrai facteur d’accueil.',
            default: 'Ton travail reste discret quand tout va bien, mais il sécurise toute la journée. Les organisateurs mesurent combien prévention et convivialité vont ensemble.',
          },
        },
        {
          id: 'evt-liens',
          label: 'Créer des rencontres entre générations',
          description: 'Imaginer des formats où les gens se parlent vraiment au lieu de juste passer.',
          activityLabel: 'Créer des rencontres entre générations',
          tags: ['ecouter', 'accompagner'],
          trackId: 'hets',
          microActivity: {
            type: 'pick_questions',
            prompt: 'Choisis deux questions brise-glace à afficher sur les tables de rencontre :',
            targetCount: 2,
            options: [
              { id: 'eq1', label: 'Quel endroit de la région te fait du bien ?' },
              { id: 'eq2', label: 'Quelle compétence aimerais-tu apprendre ou transmettre ?' },
              { id: 'eq3', label: 'Quel souvenir gardes-tu d’un projet fait en groupe ?' },
              { id: 'eq4', label: 'Qu’est-ce qui t’a surpris positivement cette année ?' },
            ],
          },
          consequences: {
            altTriggerOptionId: 'eq2',
            alt: 'La question sur la transmission déclenche des échanges inattendus entre jeunes et seniors. Plusieurs participants repartent avec l’envie de prolonger l’expérience.',
            default: 'Les questions simples abaissent la barrière de la timidité. L’événement dépasse le simple passage pour devenir un vrai moment de lien.',
          },
        },
      ],
    },
  },
];
