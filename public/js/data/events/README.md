# Données des événements

Place ici les données propres aux événements saisonniers :

```text
public/js/data/events/
├── noel.js
└── paques.js
```

Halloween n'est pas encore extrait : ses données sont encore dans
`data/game-data.js` et sa logique est dans `core/game.js`. Les fichiers
`noel.js` et `paques.js` sont des emplacements prévus, pas des fonctionnalités
actives.

Un fichier d'événement doit définir ses constantes avant le chargement de
`js/core/game.js`. Ne supprime jamais les identifiants numériques déjà utilisés
par un événement : les inventaires et les sauvegardes les utilisent.
