# Organisation du jeu

Le jeu fonctionne avec des scripts classiques chargés dans cet ordre par
`index.html` :

1. `data/catalog/` : catalogue des raretés, poissons, cannes, appâts, zones,
   météo, enchantements, artefacts et coffres.
2. `systems/shop.js` : affichage et navigation de la boutique.
3. `systems/fishing.js` : moteur de pêche et combats.
4. `systems/actions.js` : actions du joueur et achats.
5. `systems/inventory.js` : vente, coffres, favoris et remise à zéro.
6. `systems/prestige.js` : boss, heure dorée et prestige.
7. `systems/quests.js` : quêtes récurrentes.
8. `systems/achievements.js` : favoris, succès et trophées.
9. `data/events/halloween.js` : quêtes et boutique Halloween.
10. `systems/ui.js` et `systems/ui/` : navigation, scène et écrans.
11. `core/state.js` et `core/compatibility.js` : état local et migrations
   compatibles avec les anciennes sauvegardes.
12. `core/cloud.js` : connexion, synchronisation, classement et administration
    Cloudflare.
13. `core/game.js` : outils partagés et démarrage du jeu.

Les variables restent globales volontairement pour préserver le comportement
actuel et les anciennes sauvegardes.

## Modifier les poissons

Ouvre `data/catalog/tiers-fish.js`, puis cherche `var FISH`.

## Modifier l'interface

- `systems/ui.js` : navigation, barre du haut et résultats de pêche ;
- `systems/ui/scene.js` : scène de pêche et illustrations SVG ;
- `systems/ui/views.js` : boutique, bonus, quêtes, inventaire, succès,
  prestige, classement et index.

## Modifier le compte en ligne

- `core/cloud.js` : synchronisation principale et fenêtre de compte ;
- `core/cloud/auth.js` : connexion, inscription et déconnexion ;
- `core/cloud/admin.js` : outils développeur et dons ;
- `core/cloud/leaderboard.js` : classement.

Une entrée suit ce format :

```js
["Nom du poisson", "", valeurMin, valeurMax, zone, couleurHaut, couleurBas, rond]
```

- `zone` : `null` pour toutes les zones, sinon l'identifiant de la zone.
- `couleurHaut` et `couleurBas` : couleurs du poisson.
- `rond` : `1` pour une forme ronde, `0` pour une forme classique.

## Modifier les événements

Les données Halloween sont dans `data/events/halloween.js`.
Pour ajouter un événement futur, crée d'abord ses données dans un fichier
`data/events/<nom>.js`, puis charge-le avant `core/game.js` dans `index.html`.

## Modifier la boutique

La présentation de la boutique se trouve dans `systems/shop.js`. Les achats
restent dans `core/game.js`, dans `Act.buyRod`, `Act.buyBait`, `Act.buyZone`
et `Act.buyEventRod`, afin de conserver un seul chemin de modification de la
sauvegarde.

## Modifier la pêche

La logique principale se trouve dans `systems/fishing.js`.
`Engine.cast()` lance la ligne, `Engine.bite()` déclenche la touche,
`Engine.reel()` effectue le tirage et `Engine.land()` enregistre la prise.

## Règle importante pour les sauvegardes

Ne change pas la clé `catbet-fishing-v3`, les noms de propriétés de `fresh()`,
ni les identifiants numériques des poissons, cannes, coffres et appâts sans
prévoir une migration. Les comptes Cloudflare utilisent le même objet de
sauvegarde.

Après chaque modification, vérifie :

```powershell
node --check public\js\data\catalog\game-data.js
node --check public\js\core\game.js
git diff --check
```
