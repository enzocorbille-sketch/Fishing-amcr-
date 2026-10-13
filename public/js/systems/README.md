# Systèmes de jeu

Ce dossier est réservé aux prochaines extractions de logique :

- `fishing.js` : moteur de pêche ;
- `shop.js` : affichage et navigation de la boutique (déjà extrait) ;
- `actions.js` : actions du joueur et achats ;
- `progression.js` : boss, heure dorée, prestige, quêtes, succès et Halloween ;
- `ui.js` : affichage des écrans et navigation ;
- `prestige.js` : prestige et réinitialisation ;
- `quests.js` : quêtes ;
- `weather.js` : météo ;
- `inventory.js` : inventaire et coffres.

Les noms historiques `prestige.js`, `quests.js`, `weather.js` et
`inventory.js` restent documentés comme prochaines spécialisations. Pour le
moment, leurs fonctions sont regroupées dans `progression.js` afin de garder
les dépendances simples et l'ordre de chargement sûr.

`actions.js` modifie la sauvegarde via `Act.buyRod`, `Act.buyBait`,
`Act.buyZone` et `Act.buyEventRod`. `shop.js` ne modifie pas directement la
sauvegarde.

Les autres systèmes restent dans `js/core/game.js` afin de terminer la
migration progressivement, sans changer l'ordre d'exécution ni casser les
sauvegardes.
