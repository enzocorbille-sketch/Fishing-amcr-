# Organisation du jeu

Le jeu fonctionne avec des scripts classiques chargés dans cet ordre par
`index.html` :

1. `data/game-data.js` : raretés, poissons, cannes, appâts, zones, coffres,
   météo, artefacts et données Halloween.
2. `systems/shop.js` : affichage et navigation de la boutique.
3. `systems/fishing.js` : moteur de pêche et combats.
4. `systems/actions.js` : actions du joueur et achats.
5. `systems/progression.js` : boss, prestige, quêtes, succès et Halloween.
6. `systems/ui.js` : affichage des écrans et navigation.
7. `core/state.js` et `core/compatibility.js` : état local et migrations
   compatibles avec les anciennes sauvegardes.
8. `core/cloud.js` : connexion, synchronisation et administration Cloudflare.
9. `core/game.js` : outils partagés et démarrage du jeu.

Les variables restent globales volontairement pour préserver le comportement
actuel et les anciennes sauvegardes.

## Modifier les poissons

Ouvre `data/game-data.js`, puis cherche `const FISH`.

Une entrée suit ce format :

```js
["Nom du poisson", "", valeurMin, valeurMax, zone, couleurHaut, couleurBas, rond]
```

- `zone` : `null` pour toutes les zones, sinon l'identifiant de la zone.
- `couleurHaut` et `couleurBas` : couleurs du poisson.
- `rond` : `1` pour une forme ronde, `0` pour une forme classique.

## Modifier les événements

Les données Halloween sont actuellement dans `data/game-data.js` et la logique
de l'événement est dans `core/game.js`, dans la section `ÉVÉNEMENT HALLOWEEN`.
Pour ajouter un événement futur, crée d'abord ses données dans un fichier
`data/events/<nom>.js`, puis charge-le avant `core/game.js` dans `index.html`.

## Modifier la boutique

La présentation de la boutique se trouve dans `systems/shop.js`. Les achats
restent dans `core/game.js`, dans `Act.buyRod`, `Act.buyBait`, `Act.buyZone`
et `Act.buyEventRod`, afin de conserver un seul chemin de modification de la
sauvegarde.

## Modifier la pêche

La logique principale se trouve dans `core/game.js`, section `MOTEUR DE PÊCHE`.
`Engine.cast()` lance la ligne, `Engine.bite()` déclenche la touche,
`Engine.reel()` effectue le tirage et `Engine.land()` enregistre la prise.

## Règle importante pour les sauvegardes

Ne change pas la clé `catbet-fishing-v3`, les noms de propriétés de `fresh()`,
ni les identifiants numériques des poissons, cannes, coffres et appâts sans
prévoir une migration. Les comptes Cloudflare utilisent le même objet de
sauvegarde.

Après chaque modification, vérifie :

```powershell
node --check public\js\data\game-data.js
node --check public\js\core\game.js
git diff --check
```
