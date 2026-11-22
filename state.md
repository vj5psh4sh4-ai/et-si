# Et si… : état du projet

Dernière mise à jour : 23 novembre 2026 (Europe/Zurich)
Responsable : Ugo Pfenninger

## 1. État courant

| Élément | Valeur |
|---|---|
| Version en ligne | 0.3.1, lue dans le pied de page du site le 23 novembre 2026 |
| Adresse | https://et-si-bkmt.onrender.com |
| Commit en production | `76fc107` sur `main` (v0.3.1 complète : `5eb6ab1` puis correctif `76fc107`) |
| Dépôt | https://github.com/vj5psh4sh4-ai/et-si |
| Hébergement | Render, site statique `srv-dbvmgl7lk1mc73e6fbdg`, déploiement automatique à chaque push sur `main` |
| Build | `npm run build` (validation du référentiel, `tsc`, Vite) |
| Persistance | localStorage du navigateur, clé `et_si_v01_notebook`, schéma 2. Aucun serveur, aucun compte, aucune IA |
| Référentiel embarqué | version 0.1.0+0.1.0 du 22 novembre 2026, copié dans `src/mapping/` |

Ce fichier est tenu dans le dépôt (`state.md`) et recopié dans les fichiers du projet Perplexity. Les commits qui ne touchent que ce fichier portent `[skip render]` pour ne pas relancer de déploiement.

Les quatre états à distinguer :

- Préparé localement : rien en attente.
- Poussé sur GitHub : v0.3.1, commits `5eb6ab1` et `76fc107`.
- En ligne : v0.3.1, vérifiée sur l'adresse Render (voir section 6).
- Recetté sur matériel réel : rien. Aucun test sur tablette, téléphone ou imprimante physiques.

## 2. Méthode et décisions à préserver

Contraintes de départ (brief v0.1), toujours valables :

1. React, TypeScript, Vite. Sauvegarde locale uniquement. Pas de backend, pas d'API, pas d'IA.
2. Aucun faux bouton : tout ce qui est cliquable fait quelque chose.
3. Aucune note, aucun pourcentage, aucun classement montré au visiteur.
4. Mentions visibles : « Information à confirmer auprès de l'école », « Version de test », « Ce n'est ni un test d'orientation ni un outil d'admission ».
5. Accessibilité : clavier, focus visible, mouvements réduits respectés, mobile dès 375 px.

Décisions du 22 novembre 2026 pour la v0.3.1 :

| N° | Question | Décision |
|---|---|---|
| 1 | Montre-t-on un pourcentage au visiteur ? | Non. Le temps de marche suffit pour l'instant. |
| 2 | Les métiers CFC apparaissent-ils nommément comme étapes du sentier ? | Oui. |
| 3 | Demande-t-on l'année scolaire pour afficher une date ? | Oui. |
| 4 | Quel dispositif au stand ? | Deux tablettes en mode stand, reprise sur téléphone par code QR, cartes A6 à imprimer possibles. Wifi disponible. Présence d'un écran : pas encore connue. |
| 5 | Que montre-t-on à Start si la relecture n'est pas terminée ? | Pas de réponse. Par défaut : tout est montré avec sa mention. |
| 6 | Allemand à Start ? | Oui, allemand et anglais. |
| 7 | Reste-t-on sans serveur ? | À décider. Par défaut : sans serveur, sur l'adresse Render actuelle. |

Façon de travailler :

8. Tout en français, titres compris. Français de Suisse (septante, huitante, nonante). Ton sobre, pas de tiret cadratin, pas de superlatifs creux.
9. Computer peut committer et pousser sur `main` pour ce projet (autorisation donnée pour la v0.2 puis la v0.3.1). L'auteur du commit reste le compte GitHub d'Ugo.
10. Résultats intermédiaires, arrêt après deux échecs sur le même problème.
11. Le référentiel se modifie dans les fichiers du projet (`et-si-mapping/`), puis se recopie avec `npm run sync:mapping`. Ne pas l'éditer à la main dans `src/mapping/`.

## 3. Charte et conventions

| Sujet | Convention |
|---|---|
| Stack | React 18, TypeScript 5, Vite 5, vitest 2, lucide-react, qrcode-generator |
| Typographies | Bricolage Grotesque (titres), Figtree (texte), servies depuis le site |
| Couleurs | Papier clair, encre, jaune des panneaux de randonnée. Une couleur par école sur la pointe des lames |
| Vocabulaire | Panneau, lame, sentier, temps de marche, porte, carnet |
| Langues | `src/i18n/fr.ts`, `de.ts`, `en.ts` : mêmes clés et mêmes variables dans les trois fichiers (testé) |
| Typographie | Espace insécable avant `? ! : ;` en français, signe collé en allemand et en anglais |
| Écrans | home, situation, cards, panel, doors, sheet, cfc, share, character, start, entry, hub, mission, notebook, about |
| Réglages par l'adresse | `?stand=1`, `?idle=NN`, `?lang=fr|de|en`, `?animateur=1` |
| Réglages au build | `VITE_SHOW_DEMO=0`, `VITE_PUBLIC_URL` |

## 4. Guides et documentation

| Document | État |
|---|---|
| `README.md` | À jour pour la v0.3.1 (commandes, réglages, limites) |
| `FLOWS.md` | Liste des parcours à retester, section v0.3.1 ajoutée |
| Proposition v0.3 | `et-si-v03/et-si-v03-proposition.md` dans les fichiers du projet |
| Guide pour le personnel du stand | À écrire |

## 5. Travaux effectués

### v0.3.1 (22 et 23 novembre 2026)

| Lot | État | Livraison et preuve |
|---|---|---|
| Référentiel embarqué et validé avant chaque build | En ligne | `scripts/validate-mapping.mjs`, `scripts/validate-profile.mjs`, `src/mapping/` |
| Parcours express : point de départ, douze cartes à trois réponses, arrêt possible dès la neuvième | En ligne | `Situation.tsx`, `Cards.tsx`, `domain/profile.ts`, tests `profile.test.ts` |
| Panneau : trois lames et une piste « Et si… », temps de marche, raisons reprises des réponses | En ligne | `Panel.tsx`, `Signpost.tsx` |
| Sentiers depuis la situation, CFC nommés, année de rentrée au plus tôt, variantes par voie | En ligne | `domain/routes.ts`, tests `routes.test.ts` |
| Portes (dix Bachelors) et type de classe facultatif | En ligne | `Doors.tsx` |
| Entrée par le métier CFC | En ligne | `Cfc.tsx`, `domain/cfc.ts`, tests `cfc.test.ts` |
| Fiche filière avec débouchés, questions, sources datées | En ligne | `Sheet.tsx` |
| Emporter : lien et code QR sans serveur, carte A6, carte A6 vierge | En ligne | `Share.tsx`, `A6Card.tsx`, `QrCode.tsx`, `domain/share.ts`, tests `share.test.ts` |
| Mode stand et mode animateur | En ligne | `App.tsx`, `domain/policy.ts` |
| Français, allemand, anglais | En ligne | `src/i18n/`, tests `i18n.test.ts` |
| Carnet schéma 2 et migration du carnet v0.2 | En ligne | `Notebook.tsx`, `domain/notebook.ts` |
| Missions v0.2 reliées au même panneau | En ligne | `Missions.tsx` |

Points d'attention :

- Un lien ou un code QR contient les réponses elles-mêmes (environ 60 caractères), pas un identifiant. Il dépend de l'adresse du site : changer d'adresse rend les codes déjà imprimés illisibles.
- En mode stand, la tablette revient à la langue de son adresse (`?lang=`) après chaque visiteur.
- En cas d'égalité, le panneau affiche jusqu'à cinq lames et le signale.
- Le mode animateur montre des notes internes. Il est réservé au personnel.

### v0.2 (19 novembre 2026)

Refonte graphique, carte des missions, mission en quatre étapes, carnet imprimable, mode démo isolé. Commit `8b2cb85`.

### v0.1 (19 novembre 2026)

Premier prototype. Commit `1a5296e`.

## 6. Recette : résultats acquis

Contrôles automatiques (dernier passage sur `76fc107`) :

- `npx tsc --noEmit` : sans erreur.
- `npx vitest run` : 53 tests sur 53, cinq fichiers.
- `npm run validate` : 141 règles d'admission (39 validées, 102 à relire), 147 débouchés (65 validés, 82 à relire), 53 sources, 37 intérêts, 76 qualités, 44 profils, 30 cartes d'envies et 25 cartes de qualités. Index de 147 métiers CFC distincts.
- `npm run build` : réussi. JavaScript 567 kB (145 kB compressé), CSS 63 kB.

Contrôles dans Chromium piloté (Playwright), sans erreur de console :

| Parcours | Résultat |
|---|---|
| Accueil, point de départ, douze cartes au clavier (touches 1, 2, 3) et au toucher, panneau | Conforme à 1280 × 860, 1024 × 768, 390 × 800 et 375 × 760 |
| Variantes « Et si tu passais par… », année de rentrée | Conforme |
| Portes, recherche d'un CFC, détail du métier, fiche filière | Conforme, sans débordement horizontal sur mobile |
| Emporter : lien, code QR, copie du lien | Conforme. Le code QR du site en ligne a été décodé et rend bien le lien |
| Ouverture d'un lien dans un autre navigateur : bandeau, « Garder ce panneau ici », « Fermer sans garder », lien illisible | Conforme |
| Carnet : contenu, copie du résumé, impression A4 sur une page | Conforme |
| Carte A6 : panneau à trois lames, panneau à quatre lames, carte vierge, version allemande | Une page de 105 × 148 mm à chaque fois |
| Missions à 375 px, jusqu'au résumé, retour au panneau | Conforme |
| Mode démo : rien n'est enregistré | Conforme |
| Mode stand : écran d'appel, allemand, avertissement d'inactivité, remise à zéro, « Terminer et effacer », aucun enregistrement | Conforme (essai avec `?idle=6`) |
| Mode animateur | Tableau affiché sous le panneau |
| Allemand et anglais | Écrans principaux parcourus |
| Mouvements réduits | Lames visibles, aucune animation |
| Clavier | Ordre de tabulation et contour de focus conformes sur l'accueil |
| Reprise d'un carnet v0.2 | L'application démarre et reprend le pseudonyme, la question et l'idée |
| Build avec `VITE_SHOW_DEMO=0` | Démarre sans erreur, le questionnaire et l'onglet Panneau disparaissent |

Contrôles sur le site en ligne (https://et-si-bkmt.onrender.com) : version 0.3.1 affichée, parcours express au toucher, panneau sans pourcentage, lien de partage sur l'adresse Render, réouverture du lien dans un autre navigateur, mode stand en allemand, code QR décodé.

Contrôlé plus tôt dans la session, non rejoué après les dernières corrections : flèche gauche pour revenir à la carte précédente, bouton « Arrêter ici » dès la neuvième carte.

Non vérifié :

- Safari sur iPad et sur iPhone, Chrome sur Android. Tous les contrôles ont été faits dans Chromium.
- Lecture du code QR par l'appareil photo d'un vrai téléphone, à la distance et à la lumière du stand.
- Impression réelle de la carte A6 sur une imprimante, marges et découpe comprises.
- Comportement avec un wifi faible ou coupé. Le premier chargement demande une connexion.
- Relecture des traductions allemande et anglaise par une personne de langue maternelle.
- Essai auprès de jeunes de 13 à 16 ans.

## 7. Backlog ouvert et reliquats

### Décisions attendues

| ID | Priorité | Demande | Réception attendue |
|---|---|---|---|
| D5 | Haute | Que montre-t-on à Start si la relecture des écoles n'est pas terminée ? | Réponse d'Ugo. Si « masquer » : build avec `VITE_SHOW_DEMO=0` et accueil à ajuster (voir T6) |
| D7 | Haute | Reste-t-on sans serveur, et sur quelle adresse définitive ? | Adresse fixée avant toute impression de cartes avec code QR |
| D4b | Moyenne | Y aura-t-il un écran au stand ? | Réponse d'Ugo, puis éventuel mode vitrine |

### Contenu et validation

| ID | Priorité | Demande | Réception attendue |
|---|---|---|---|
| C1 | Haute | Relecture par les écoles des 102 règles d'admission et des 82 débouchés au statut « à relire » | Statuts passés à « validated » dans le référentiel, puis `npm run sync:mapping` |
| C2 | Haute | Validation des liens entre cartes et filières, et des pondérations (réponses 0, 1,5 et 3 ; poids des cartes 0,6 face aux missions) | Accord des écoles, essais avec des jeunes |
| C3 | Moyenne | Relecture des traductions allemande et anglaise | Fichiers `de.ts` et `en.ts` relus |
| C4 | Moyenne | Traduction des missions, des débouchés, des noms de CFC et des notes de filière | Aujourd'hui en français seulement, avec une mention |

### Technique et stand

| ID | Priorité | Demande | Réception attendue |
|---|---|---|---|
| T1 | Haute | Essai sur les deux tablettes du stand et sur des téléphones réels (Safari, Chrome) | Parcours express, code QR, mode stand |
| T2 | Haute | Essai d'impression de la carte A6 | Une carte lisible, code QR lu par un téléphone |
| T3 | Moyenne | Guide d'une page pour le personnel du stand | Adresses des tablettes, mode animateur, que dire au visiteur |
| T4 | Moyenne | Fonctionnement hors ligne après le premier chargement | Service worker ou application installée sur la tablette |
| T5 | Basse | Découpage du JavaScript (567 kB) | Premier affichage plus rapide sur réseau mobile |
| T6 | Basse | Accueil du build sans éléments démo : le bouton principal et la première entrée mènent tous deux aux portes | Accueil dédié si la décision D5 est « masquer » |

### Hors périmètre de la v0.3.1

Statistiques locales du stand, balises QR aux postes de démonstration, vue à deux avec un parent, mode classe, écran vitrine.
