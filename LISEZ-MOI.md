# CATBET Fishing — version en ligne (Cloudflare uniquement)

Contenu : `public/index.html` (le jeu), `src/worker.js` (l'API : comptes, sauvegarde), `schema.sql` (la base D1), `wrangler.toml` (la config).
Aucun service extérieur : tout tourne sur Cloudflare.

## Mise en ligne (une seule fois)
Il faut un compte Cloudflare gratuit et Node.js. Dans ce dossier :

1. `npx wrangler login`
2. `npx wrangler d1 create catbet` : copie le `database_id` affiché dans `wrangler.toml` (à la place de `REMPLACE_PAR_TON_ID`).
3. `npx wrangler d1 execute catbet --remote --file=schema.sql`
4. `npx wrangler deploy`

Wrangler affiche l'adresse du jeu. Pour tester sur ton PC avant : `npx wrangler d1 execute catbet --local --file=schema.sql` puis `npx wrangler dev`.

Si tu avais déjà déployé la première version (sans code de récupération), lance à la place de l'étape 3 : `npx wrangler d1 execute catbet --remote --file=migration-v1.sql`. Les comptes déjà créés pourront se générer un code depuis leur fenêtre de compte.

## Mettre à jour le jeu plus tard
Remplace `public/index.html` puis `npx wrangler deploy`. Les comptes et sauvegardes ne bougent pas.

## Comment ça marche
- **Compte :** pseudo + mot de passe (haché). Au moment de créer le compte, le jeu affiche un **code de récupération** (20 caractères) une seule fois. Mot de passe oublié → « Mot de passe oublié ? », pseudo + code + nouveau mot de passe. Le code utilisé est remplacé par un nouveau, et tous les appareils connectés sont déconnectés. Sans le mot de passe ET sans le code, le compte est perdu.
- **Sauvegardes de secours :** à chaque reset ou remplacement de la partie, et au plus toutes les 30 min en jouant, le serveur garde la version précédente (5 conservées). Bouton « Sauvegardes précédentes » dans la fenêtre de compte.
- **Contrôles anti-triche** (dans `src/worker.js`, bloc `LIMITS`) : le serveur refuse une sauvegarde si l'XP dépasse ce qu'on peut gagner avec le nombre de lancers, si le nombre de lancers augmente plus vite que le jeu ne le permet, ou si les pièces sont absurdes. La partie en ligne reste alors propre et le joueur est prévenu.
- **Plusieurs appareils :** à la synchronisation, la partie la plus avancée (par XP) est gardée.

## Ajouter le système de compte à une autre version du jeu
Le jeu fourni est la v11 (heure dorée sous la prise). Pour une autre version, reprendre depuis `public/index.html` :
1. la fonction `save` (ajout de `S.ver=1;S._t=Date.now();` et de `Cloud.dirty()`),
2. le bouton `#acc` dans `<header>`,
3. la règle CSS `input.in{…}`,
4. tout le bloc « 6b. COMPTE EN LIGNE » placé avant « 7. DÉMARRAGE »,
5. `Cloud.init();` juste après `UI.render();` en fin de script, et `Cloud.force=1;` dans `Act.reset`.

## Limites à connaître
- **Triche :** la progression est calculée dans le navigateur. Les contrôles bloquent les valeurs absurdes (« 999 milliards de pièces ») mais pas une triche lente et soignée. Les contrôles de pièces sont volontairement larges, car les quêtes et les coffres donnent des pièces en dehors de la pêche. Seul un jeu où le serveur décide de chaque lancer, achat et vente supprimerait la triche (grosse réécriture).
- **Si tu ajoutes une fonctionnalité qui donne de l'XP** (hors poisson) ou beaucoup plus de lancers par seconde : adapte `LIMITS` dans `src/worker.js`, sinon les vrais joueurs seront refusés.
- **Offre gratuite Cloudflare :** je ne suis pas certain que le hachage des mots de passe passe sous la limite de temps CPU du plan gratuit. Si la connexion échoue avec une erreur de temps CPU, il faut passer au plan payant ou alléger ce calcul.
