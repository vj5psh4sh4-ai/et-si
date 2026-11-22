# Et si…

Prototype d'exploration autour des quatre hautes écoles de la HES-SO Fribourg (HEIA-FR, HEG-FR, HEdS-FR, HETS-FR). Douze cartes, trois réponses possibles, et un panneau indicateur montre trois filières avec le chemin qui y mène depuis la situation du visiteur.

Ce n'est ni un test d'orientation ni un outil d'admission. Aucune note, aucun pourcentage et aucun classement ne sont montrés au visiteur.

Version en ligne : https://et-si-bkmt.onrender.com

## Lancer en local

```bash
npm install
npm run dev        # développement
npm run validate   # contrôle du référentiel (données et profils)
npm test           # tests unitaires (vitest)
npm run build      # validation, puis build de production (dist/)
npm run preview    # aperçu du build
```

`npm run build` lance d'abord `npm run validate`. Si le référentiel est incohérent, le build s'arrête.

## v0.3.1 : ce qui change

- Parcours express : point de départ (CO 9H, 10H, 11H, apprentissage, collège, ECG, adulte), douze cartes « Non / Peut-être / Oui », puis le panneau. Arrêt possible dès la neuvième carte.
- Panneau : trois lames, plus une piste « Et si… » à côté. Chaque lame affiche un temps de marche en années, jamais un pourcentage. Les raisons reprennent les mots du visiteur.
- Sentier : étapes depuis la situation du visiteur jusqu'au Bachelor, avec les métiers CFC nommés, les compléments à prévoir et, pour le CO, une année de rentrée au plus tôt.
- Variantes « Et si tu passais par… » : le plus court, l'apprentissage, une école de métiers, l'ECG, le collège.
- Portes : les dix Bachelors depuis la situation du visiteur. Aucune voie ne ferme l'accès, seul le temps de marche change.
- Partir d'un métier : recherche parmi les CFC du référentiel, puis les filières ouvertes ensuite.
- Fiche filière : durée, formes d'études, langues, chemins, débouchés, questions à poser, sources datées.
- Emporter : lien et code QR qui contiennent les réponses elles-mêmes (aucun identifiant, aucun serveur), carte A6 à imprimer, carte A6 vierge.
- Mode stand pour tablette, mode animateur pour le personnel.
- Français, allemand, anglais. Les missions, les débouchés et les noms de CFC restent en français pour l'instant.
- Les missions de la v0.2 restent disponibles et nourrissent le même panneau.

## Réglages par l'adresse

| Paramètre | Effet |
|---|---|
| `?stand=1` | Mode stand : écran d'appel, rien n'est enregistré sur la tablette, bouton « Terminer et effacer », remise à zéro après 45 secondes sans geste (avertissement de 10 secondes). |
| `?idle=NN` | Délai d'inactivité du mode stand en secondes (5 au minimum). |
| `?lang=fr` `?lang=de` `?lang=en` | Langue de départ. En mode stand, la tablette revient à cette langue après chaque visiteur. |
| `?animateur=1` | Affiche sous le panneau un tableau de travail réservé au personnel (notes internes, couverture). Ces chiffres ne sont jamais montrés aux visiteurs. |

Exemple pour une tablette germanophone : `https://et-si-bkmt.onrender.com/?stand=1&lang=de`

## Réglages au build

| Variable | Effet |
|---|---|
| `VITE_SHOW_DEMO=0` | Masque les éléments au statut « démo » (le questionnaire par cartes). Par défaut ils sont visibles avec la mention « Version de test ». |
| `VITE_PUBLIC_URL` | Adresse publique utilisée dans les liens et les codes QR. Par défaut, l'adresse de la page ouverte. |

Tant que l'adresse publique n'est pas fixée, ne pas imprimer de cartes A6 avec code QR en série : un changement d'adresse rendrait les codes illisibles. La carte vierge ne contient pas de code.

## Données

- `src/mapping/` : copie du référentiel (voies d'accès, filières, débouchés, intérêts, qualités, cartes) avec sa version dans `VERSION.json`.
- `npm run sync:mapping` : recopie le référentiel depuis les fichiers du projet (usage local).
- Statuts : « validated » s'affiche avec sa source, « to_review » avec la mention « Information à confirmer auprès de l'école », « demo » avec la mention « Version de test ».
- Pondérations (valeurs des trois réponses, poids des cartes face aux missions, liens cartes-filières) : propositions à relire avec les écoles et à tester auprès des jeunes.

## Limites connues

- Les associations entre cartes et filières ne sont pas validées par les écoles.
- Une partie des règles d'admission reste à relire. Le prototype ne vérifie aucune admission individuelle.
- Les traductions allemande et anglaise sont à relire.
- Sauvegarde uniquement dans le navigateur (localStorage), pas de compte ni de serveur.
- Pas de mode hors ligne complet : le premier chargement demande une connexion.

Voir `FLOWS.md` pour la liste des parcours à retester après chaque modification, et `state.md` pour l'état du projet.
