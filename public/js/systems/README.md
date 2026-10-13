# Systèmes de jeu

Ce dossier est réservé aux prochaines extractions de logique :

- `fishing.js` : moteur de pêche ;
- `shop.js` : affichage et navigation de la boutique (déjà extrait) ;
- `actions.js` : actions du joueur et achats ;
- `ui.js` : affichage des écrans et navigation ;
- `prestige.js` : prestige et réinitialisation ;
- `quests.js` : quêtes horaires, quotidiennes et hebdomadaires ;
- `achievements.js` : favoris, succès et trophées ;
- `data/events/halloween.js` : quêtes et boutique Halloween ;
- la météo est dans `data/catalog/game-data.js`, car elle ne contient que des données
  et son affichage est appelé depuis `ui.js` ;
- `inventory.js` : vente, coffres, favoris et remise à zéro.

`actions.js` modifie la sauvegarde via `Act.buyRod`, `Act.buyBait`,
`Act.buyZone` et `Act.buyEventRod`. `shop.js` ne modifie pas directement la
sauvegarde.

Les autres systèmes restent dans `js/core/game.js` afin de terminer la
migration progressivement, sans changer l'ordre d'exécution ni casser les
sauvegardes.
