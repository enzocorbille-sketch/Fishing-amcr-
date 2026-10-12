# Fishing-amcr-
CATBET Fishing

## Configuration du compte administrateur

Le Worker ne possède aucun administrateur par défaut. Créez d'abord le compte
administrateur avec `ADMIN_USERNAME` absent, puis définissez explicitement cette
variable dans la configuration Cloudflare avant le déploiement. Une fois la
variable active, ce pseudo est réservé et ne peut plus être enregistré par un
tiers. Sans cette variable, les routes d'administration restent désactivées.
