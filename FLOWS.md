# Main flows (v0.1 → v0.2 regression checks)

## Accueil
- Start: /
- Expect: titre « Et si… », boutons « Commencer », « Voir une démo », « Reprendre mon exploration » si sauvegarde

## Personnage
- Steps: Commencer → choisir un avatar, une couleur, saisir un pseudonyme → Continuer (ou Passer cette étape)
- Expect: aperçu mis à jour, écran « Point de départ »

## Point de départ
- Steps: choisir situation + réflexion → continuer
- Expect: écran porte d'entrée

## Trois portes d'entrée
- « Je découvre » : 3 cartes max, « Lancer ma première mission », « Surprends-moi »
- « J'ai un objectif » : bouton désactivé tant qu'aucun objectif
- « J'ai une idée » : texte 300 car. max, angle obligatoire

## Mission
- Steps: choisir un rôle → microactivité (questions / classement / jetons / contraintes) → conséquence → ressenti → bifurcation
- Expect: conséquence alternative selon l'option déclencheuse ; 3 sorties (continuer, autre rôle, chemins)
- Les 4 missions accessibles

## Chemins
- Expect: max 3 pistes avec explication ; état vide si rien d'apprécié ; changer la situation modifie l'étape 2 ; comparaison de 2 chemins ; garder / retirer une piste ; mentions « Association illustrative à valider » et « Conditions à vérifier »

## Carnet
- Expect: profil, idée, activités, pistes, questions (ajout), prochaine action, Copier, Imprimer, Recommencer, Supprimer
- Rechargement : carnet restauré ; Supprimer : retour accueil sans sauvegarde

## Démo
- Voir une démo → pistes de démo visibles ; v0.2 : ne doit pas écraser la sauvegarde réelle

## Requested change v0.2
- Mise en page et graphisme soignés (desktop + 375 px), parcours utilisateur plus clair (progression, hub missions, bifurcation explicite)
