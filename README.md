# Et si…

Prototype de jeu d'orientation autour des quatre hautes écoles de la HES-SO Fribourg (HEIA-FR, HEG-FR, HEdS-FR, HETS-FR). Les jeunes rejoignent des projets, essaient des rôles et découvrent des pistes de formation à partir de ce qu'ils ont aimé faire.

## Lancer en local

```bash
npm install
npm run dev      # développement
npm run build    # build de production (dist/)
npm run preview  # aperçu du build
```

## v0.2 — ce qui change

- Nouvelle identité graphique : papier clair, encre, jaune des panneaux de randonnée suisses, typographies Bricolage Grotesque et Figtree, illustrations SVG par mission.
- Accueil avec paysage préalpin et promesse claire ; onboarding en trois étapes avec indicateur de progression.
- Carte des missions (au lieu d'onglets) avec mission suggérée et progression des rôles.
- Mission en quatre étapes visibles : choisir un rôle, agir, voir le résultat, bifurquer. Le ressenti est demandé avant de continuer.
- Mes chemins : pistes sous forme de panneaux, raisons explicites, parcours indicatif avec « Conditions à vérifier », comparaison de deux chemins, pistes à garder manuellement.
- Mon carnet : résumé copiable et imprimable, questions à vérifier, prochaine action, confirmation avant de recommencer ou supprimer.
- Mode démo isolé : il n'écrase plus l'exploration réelle.
- Navigation mobile en bas d'écran, focus clavier visible, mouvements réduits respectés.
- Libellés neutres (« Camille », écriture inclusive), suppression des statuts techniques visibles.

## Limites connues

- Données des écoles illustratives : « Association illustrative à valider avec les écoles ».
- Aucune condition d'admission n'est vérifiée.
- Sauvegarde uniquement dans le navigateur (localStorage), pas de compte ni de serveur.

Voir `FLOWS.md` pour la liste des parcours à retester après chaque modification.
