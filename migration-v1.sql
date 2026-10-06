-- À lancer UNE fois seulement si tu as déjà déployé la première version (sans code de récupération) :
-- npx wrangler d1 execute catbet --remote --file=migration-v1.sql
ALTER TABLE users ADD COLUMN recovery_hash TEXT;
CREATE TABLE IF NOT EXISTS save_backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_backups_user ON save_backups(user_id, ts);
