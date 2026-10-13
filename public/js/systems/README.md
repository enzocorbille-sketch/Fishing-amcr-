# Systèmes de jeu

Ce dossier est réservé aux prochaines extractions de logique :

- `fishing.js` : moteur de pêche ;
- `shop.js` : affichage et navigation de la boutique (déjà extrait) ;
- `prestige.js` : prestige et réinitialisation ;
- `quests.js` : quêtes ;
- `weather.js` : météo ;
- `inventory.js` : inventaire et coffres.

La logique d'achat reste dans `core/game.js` (`Act.buyRod`, `Act.buyBait`,
`Act.buyZone` et `Act.buyEventRod`) : `shop.js` ne modifie pas directement la
sauvegarde.

Les autres systèmes restent dans `js/core/game.js` afin de terminer la
migration progressivement, sans changer l'ordre d'exécution ni casser les
sauvegardes.
