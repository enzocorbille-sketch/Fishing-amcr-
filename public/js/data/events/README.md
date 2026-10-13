# Données des événements

Place ici les données propres aux événements saisonniers :

```text
public/js/data/events/
├── halloween.js
├── noel.js
└── paques.js
```

Un fichier d'événement doit définir ses constantes avant le chargement de
`js/core/game.js`. Ne supprime jamais les identifiants numériques déjà utilisés
par Halloween : les inventaires et les sauvegardes les utilisent.
