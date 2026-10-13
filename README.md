# Fishing-amcr-
CATBET Fishing

## Configuration du compte administrateur

Le Worker ne possède aucun administrateur par défaut. Créez d'abord le compte
administrateur avec `ADMIN_USERNAME` absent, puis définissez explicitement cette
variable dans la configuration Cloudflare avant le déploiement. Une fois la
variable active, ce pseudo est réservé et ne peut plus être enregistré par un
tiers. Sans cette variable, les routes d'administration restent désactivées.

Le compte développeur dispose aussi d'un journal d'activité serveur dans
l'interface d'administration. Il conserve les connexions, sauvegardes, dons,
restaurations et actions de gestion avec leur date, leur acteur, le joueur visé
et les détails de l'action.

## Organisation du frontend

Le frontend est maintenant séparé en fichiers lisibles :

- `public/index.html` : structure de la page ;
- `public/css/app.css` : styles ;
- `public/js/data/catalog/` : poissons, cannes, appâts, zones, coffres et données ;
- `public/js/core/game.js` : fonctionnement du jeu ;
- `public/js/data/events/` : données des futurs événements ;
- `public/js/systems/` : emplacement des prochains systèmes extraits.

Le guide de modification sans IA se trouve dans
`public/js/README.md`. Les clés de sauvegarde, les identifiants et le format
Cloudflare sont conservés.
