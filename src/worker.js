// CATBET Fishing — API comptes + sauvegarde (Cloudflare Worker + D1)
const enc = new TextEncoder();
const SESSION_MS = 90 * 24 * 3600 * 1000;
const MAX_SAVE = 200000; // octets max pour une sauvegarde
const MAX_FAILS = 8, FAIL_WINDOW = 15 * 60 * 1000;
const BACKUP_EVERY = 30 * 60 * 1000, BACKUP_KEEP = 5;

// --- Contrôles anti-triche (volontairement larges : mieux vaut laisser passer que bloquer un vrai joueur) ---
// À régler ici si tu ajoutes des fonctionnalités qui donnent de l'XP ou des pièces en dehors de la pêche.
const CHEST_PRICE = [250, 1e3, 5e3, 25e3, 1e5, 5e5, 2e6, 1e7];
const LIMITS = {
  maxCasts: 3e6, // lancers maximum sur un compte
  xpPerCast: 1800, // XP maximum gagnée par lancer (poisson Ultra)
  minCastSeconds: 0.6, // durée minimale d'un lancer (délai d'attente minimum du jeu)
  slackCasts: 60, // marge de lancers pour les décalages d'horloge
  wealthPerCast: 1e11, // richesse maximale (pièces + stock + coffres) par lancer : très large
};
function wealth(d) {
  let w = +d.c || 0;
  for (const k in d.inv || {}) w += +(d.inv[k] && d.inv[k].v) || 0;
  for (const t in d.chests || {}) w += (+d.chests[t] || 0) * (CHEST_PRICE[t] || 0);
  return w;
}
// renvoie null si la sauvegarde est plausible, sinon la raison du refus
function implausible(next, prev, elapsedMs, force) {
  const casts = +next.casts || 0, xp = +next.xp || 0, w = wealth(next);
  if (casts > LIMITS.maxCasts) return 'casts';
  if (xp > casts * LIMITS.xpPerCast) return 'xp';
  if (!isFinite(w) || w > 150 + casts * LIMITS.wealthPerCast) return 'richesse';
  if (prev && !force) {
    const dc = casts - (+prev.casts || 0);
    if (dc < 0) return 'casts';
    if (dc > elapsedMs / (LIMITS.minCastSeconds * 1000) + LIMITS.slackCasts) return 'rythme';
    if (xp - (+prev.xp || 0) > dc * LIMITS.xpPerCast) return 'xp';
  }
  return null;
}

// --- Code de récupération : 20 caractères (≈100 bits), affiché une seule fois au joueur ---
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 caractères, sans I, O, 0, 1
function newRecoveryCode() {
  const b = crypto.getRandomValues(new Uint8Array(20));
  const c = [...b].map((x) => CODE_CHARS[x % 32]).join('');
  return c.match(/.{5}/g).join('-');
}
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z2-9]/g, '');
const codeHash = (username, code) => sha256(username.toLowerCase() + ':' + normCode(code));

const J = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => Uint8Array.from(s.match(/../g) || [], (h) => parseInt(h, 16));
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  // 100 000 itérations = maximum accepté par Cloudflare Workers
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256));
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function readJson(req, limit = 4096) {
  const text = await req.text();
  if (text.length > limit) throw new Error('too big');
  return JSON.parse(text || '{}');
}

async function newSession(env, userId) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  await env.DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(now).run();
  await env.DB.prepare('INSERT INTO sessions(token_hash, user_id, expires) VALUES(?,?,?)')
    .bind(await sha256(token), userId, now + SESSION_MS)
    .run();
  return token;
}

async function authUser(req, env) {
  const m = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.get('Authorization') || '');
  if (!m) return null;
  const row = await env.DB.prepare(
    'SELECT s.user_id AS id, u.username AS username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires > ?'
  )
    .bind(await sha256(m[1]), Date.now())
    .first();
  return row || null;
}

async function loadSave(env, userId) {
  const row = await env.DB.prepare('SELECT data, updated FROM saves WHERE user_id = ?').bind(userId).first();
  return row ? { data: JSON.parse(row.data), updated: row.updated } : { data: null, updated: 0 };
}

async function checkPassword(env, username, password) {
  const user = await env.DB.prepare('SELECT id, username, salt, hash FROM users WHERE username = ?').bind(username).first();
  // même coût de calcul que le compte existe ou non (évite de révéler les pseudos par le temps de réponse)
  const salt = user ? unhex(user.salt) : new Uint8Array(16);
  const h = await pbkdf2(password, salt);
  return user && same(h, user.hash) ? user : null;
}

async function tooManyFails(env, u) {
  const f = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_fail WHERE username = ? AND ts > ?').bind(u, Date.now() - FAIL_WINDOW).first();
  return f.n >= MAX_FAILS;
}
async function addFail(env, u) {
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM login_fail WHERE ts < ?').bind(now - FAIL_WINDOW),
    env.DB.prepare('INSERT INTO login_fail(username, ts) VALUES(?,?)').bind(u, now),
  ]);
}

async function register(req, env) {
  const b = await readJson(req);
  const u = String(b.username || '').trim();
  const p = String(b.password || '');
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(u)) return J({ error: 'Pseudo : 3 à 20 caractères (lettres, chiffres, _ ou -).' }, 400);
  if (p.length < 8 || p.length > 128) return J({ error: 'Mot de passe : 8 caractères minimum.' }, 400);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const h = await pbkdf2(p, salt);
  let r;
  try {
    var recovery = newRecoveryCode();
    r = await env.DB.prepare('INSERT INTO users(username, salt, hash, recovery_hash, created) VALUES(?,?,?,?,?)')
      .bind(u, hex(salt), h, await codeHash(u, recovery), Date.now())
      .run();
  } catch (e) {
    if (String(e.message || e).includes('UNIQUE')) return J({ error: 'Ce pseudo est déjà pris.' }, 409);
    throw e;
  }
  const token = await newSession(env, r.meta.last_row_id);
  return J({ token, username: u, data: null, updated: 0, recovery });
}

async function login(req, env) {
  const b = await readJson(req);
  const u = String(b.username || '').trim().slice(0, 20);
  const p = String(b.password || '').slice(0, 128);
  if (await tooManyFails(env, u)) return J({ error: 'Trop d\'essais. Réessaie dans 15 minutes.' }, 429);
  const user = await checkPassword(env, u, p);
  if (!user) {
    await addFail(env, u);
    return J({ error: 'Pseudo ou mot de passe incorrect.' }, 401);
  }
  await env.DB.prepare('DELETE FROM login_fail WHERE username = ?').bind(u).run();
  const token = await newSession(env, user.id);
  const s = await loadSave(env, user.id);
  return J({ token, username: user.username, data: s.data, updated: s.updated });
}

async function recover(req, env) {
  const b = await readJson(req);
  const u = String(b.username || '').trim().slice(0, 20);
  const p = String(b.password || '');
  if (p.length < 8 || p.length > 128) return J({ error: 'Nouveau mot de passe : 8 caractères minimum.' }, 400);
  if (await tooManyFails(env, u)) return J({ error: 'Trop d\'essais. Réessaie dans 15 minutes.' }, 429);
  const user = await env.DB.prepare('SELECT id, username, recovery_hash FROM users WHERE username = ?').bind(u).first();
  const h = await codeHash(u, b.code);
  if (!user || !user.recovery_hash || !same(h, user.recovery_hash)) {
    await addFail(env, u);
    return J({ error: 'Pseudo ou code de récupération incorrect.' }, 401);
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const recovery = newRecoveryCode(); // le code utilisé est remplacé par un nouveau
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET salt = ?, hash = ?, recovery_hash = ? WHERE id = ?').bind(hex(salt), await pbkdf2(p, salt), await codeHash(user.username, recovery), user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM login_fail WHERE username = ?').bind(u),
  ]);
  const token = await newSession(env, user.id);
  const s = await loadSave(env, user.id);
  return J({ token, username: user.username, data: s.data, updated: s.updated, recovery });
}

async function newCodeFor(req, env, user) {
  const b = await readJson(req);
  if (!(await checkPassword(env, user.username, String(b.password || '').slice(0, 128)))) return J({ error: 'Mot de passe incorrect.' }, 401);
  const recovery = newRecoveryCode();
  await env.DB.prepare('UPDATE users SET recovery_hash = ? WHERE id = ?').bind(await codeHash(user.username, recovery), user.id).run();
  return J({ recovery });
}

// copie de secours de la sauvegarde qui va être remplacée (au plus une toutes les 30 min, 5 conservées)
async function backup(env, userId, data, always) {
  const now = Date.now();
  const last = await env.DB.prepare('SELECT MAX(ts) AS ts FROM save_backups WHERE user_id = ?').bind(userId).first();
  if (!always && last && last.ts && now - last.ts < BACKUP_EVERY) return;
  await env.DB.prepare('INSERT INTO save_backups(user_id, data, ts) VALUES(?,?,?)').bind(userId, data, now).run();
  await env.DB.prepare('DELETE FROM save_backups WHERE user_id = ? AND id NOT IN (SELECT id FROM save_backups WHERE user_id = ? ORDER BY ts DESC, id DESC LIMIT ?)')
    .bind(userId, userId, BACKUP_KEEP)
    .run();
}

async function listBackups(env, user) {
  const rows = await env.DB.prepare('SELECT id, ts, data FROM save_backups WHERE user_id = ? ORDER BY ts DESC, id DESC').bind(user.id).all();
  const list = (rows.results || []).map((r) => {
    let d = {};
    try { d = JSON.parse(r.data); } catch (e) {}
    return { id: r.id, ts: r.ts, xp: d.xp || 0, c: d.c || 0, casts: d.casts || 0 };
  });
  return J({ list });
}

async function restore(req, env, user) {
  const b = await readJson(req);
  const row = await env.DB.prepare('SELECT data FROM save_backups WHERE id = ? AND user_id = ?').bind(+b.id || 0, user.id).first();
  if (!row) return J({ error: 'Sauvegarde introuvable.' }, 404);
  const cur = await env.DB.prepare('SELECT data, updated FROM saves WHERE user_id = ?').bind(user.id).first();
  if (cur) await backup(env, user.id, cur.data, true); // la partie actuelle est elle-même conservée
  const now = Math.max(Date.now(), (cur ? cur.updated : 0) + 1);
  await env.DB.prepare('INSERT INTO saves(user_id, data, updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated = excluded.updated')
    .bind(user.id, row.data, now)
    .run();
  return J({ data: JSON.parse(row.data), updated: now });
}

async function putSave(req, env, user) {
  let b;
  try {
    b = await readJson(req, MAX_SAVE + 2000);
  } catch (e) {
    return J({ error: 'Sauvegarde trop grosse ou invalide.' }, 413);
  }
  const data = b.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return J({ error: 'Sauvegarde invalide.' }, 400);
  for (const k of ['c', 'xp', 'casts']) {
    if (k in data && (typeof data[k] !== 'number' || !isFinite(data[k]) || data[k] < 0)) {
      return J({ error: 'Sauvegarde invalide.' }, 400);
    }
  }
  const json = JSON.stringify(data);
  if (json.length > MAX_SAVE) return J({ error: 'Sauvegarde trop grosse.' }, 413);

  const cur = await env.DB.prepare('SELECT data, updated FROM saves WHERE user_id = ?').bind(user.id).first();
  const now = Math.max(Date.now(), (cur ? cur.updated : 0) + 1);
  let prev = null;
  if (cur) { try { prev = JSON.parse(cur.data); } catch (e) {} }
  const base = +b.base || 0;
  // un autre appareil a sauvegardé entre-temps : on renvoie sa version (conflit) avant tout autre contrôle
  if (cur && !b.force && cur.updated !== base) return J({ conflict: true, data: prev, updated: cur.updated }, 409);
  const why = implausible(data, prev, cur ? now - cur.updated : 0, !!b.force);
  if (why) return J({ error: 'Sauvegarde refusée (valeurs invraisemblables : ' + why + ').', refused: true }, 422);
  let ok;
  if (!cur) {
    ok = (await env.DB.prepare('INSERT OR IGNORE INTO saves(user_id, data, updated) VALUES(?,?,?)').bind(user.id, json, now).run()).meta.changes === 1;
  } else if (b.force) {
    ok = (await env.DB.prepare('UPDATE saves SET data = ?, updated = ? WHERE user_id = ?').bind(json, now, user.id).run()).meta.changes === 1;
  } else {
    // mise à jour atomique : ne passe que si personne d'autre n'a sauvegardé depuis la dernière synchro de cet appareil
    ok = (await env.DB.prepare('UPDATE saves SET data = ?, updated = ? WHERE user_id = ? AND updated = ?').bind(json, now, user.id, base).run()).meta.changes === 1;
  }
  if (!ok) {
    const s = await loadSave(env, user.id);
    return J({ conflict: true, data: s.data, updated: s.updated }, 409);
  }
  if (cur) await backup(env, user.id, cur.data, !!b.force);
  return J({ ok: true, updated: now });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS ? env.ASSETS.fetch(req) : new Response('Not found', { status: 404 });
    }
    try {
      const route = req.method + ' ' + url.pathname;
      if (route === 'POST /api/register') return await register(req, env);
      if (route === 'POST /api/login') return await login(req, env);
      if (route === 'POST /api/recover') return await recover(req, env);

      const user = await authUser(req, env);
      if (!user) return J({ error: 'Non connecté.' }, 401);

      if (route === 'GET /api/save') return J(await loadSave(env, user.id));
      if (route === 'PUT /api/save') return await putSave(req, env, user);
      if (route === 'GET /api/backups') return await listBackups(env, user);
      if (route === 'POST /api/restore') return await restore(req, env, user);
      if (route === 'POST /api/recovery-code') return await newCodeFor(req, env, user);
      if (route === 'POST /api/logout') {
        const tok = (req.headers.get('Authorization') || '').slice(7);
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(tok)).run();
        return J({ ok: true });
      }
      if (route === 'DELETE /api/account') {
        const b = await readJson(req);
        const ok = await checkPassword(env, user.username, String(b.password || '').slice(0, 128));
        if (!ok) return J({ error: 'Mot de passe incorrect.' }, 401);
        await env.DB.batch([
          env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
          env.DB.prepare('DELETE FROM saves WHERE user_id = ?').bind(user.id),
          env.DB.prepare('DELETE FROM save_backups WHERE user_id = ?').bind(user.id),
          env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
        ]);
        return J({ ok: true });
      }
      return J({ error: 'Introuvable.' }, 404);
    } catch (e) {
      return J({ error: 'Erreur serveur.' }, 500);
    }
  },
};
