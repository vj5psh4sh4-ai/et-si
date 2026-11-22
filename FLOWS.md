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

## Requested change v0.3.1 (build « référentiel et parcours Start »)
Décisions : pas de pourcentage (tri par temps de marche), CFC nommés comme étapes, année scolaire demandée pour afficher une date, 2 tablettes en mode stand + reprise sur téléphone par code QR + carte A6, allemand et anglais.

Flux à vérifier en plus de ceux de la v0.2 :
- Parcours express : Accueil → « Tu es où ? » (9H, 10H, 11H, apprentissage, collège, ECG, adulte, ne pas préciser) → 12 cartes à 3 réponses (clic, touches 1 2 3) → panneau
- Panneau : lames triées par temps de marche, raisons « Parce que tu as aimé », lame pointillée d'une autre école, date « au plus tôt » si 9H à 11H, aucune note ni pourcentage
- Bascules « Et si » : apprentissage, école de métiers, ECG, collège ; le sentier et les durées changent
- Toutes les portes : 10 Bachelors, sélecteur de type de classe facultatif
- Fiche filière : chemins par famille avec CFC nommés, conditions, débouchés, masters, questions à poser, sources
- Entrée par le métier : recherche d'un CFC, accès direct puis avec complément
- Emporter : code QR et lien ; le lien rouvre le même panneau dans un autre navigateur ; « Garder ce panneau ici »
- Carnet schéma 2 : migration d'un carnet v0.2, réponses conservées, panneau recalculé
- Missions : les retours alimentent le panneau ; résumé de mission lisible à 375 px
- Mode stand (?stand=1) : rien n'est enregistré, remise à zéro après 45 s, « Terminer et effacer »
- Mode animateur (?animateur=1) : chiffres de travail visibles pour le personnel seulement
- Langues : FR, DE, EN (?lang=) ; missions en français avec mention
- Impression A6 du panneau ; carte A6 vierge
