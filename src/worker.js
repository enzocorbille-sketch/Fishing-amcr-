// CATBET Fishing — API comptes + sauvegarde (Cloudflare Worker + D1)
const enc = new TextEncoder();
const SESSION_MS = 90 * 24 * 3600 * 1000;
const MAX_SAVE = 200000; // octets max pour une sauvegarde
const MAX_FAILS = 8, FAIL_WINDOW = 15 * 60 * 1000;
const BACKUP_EVERY = 30 * 60 * 1000, MANUAL_KEEP = 5; // 1 sauvegarde automatique, 5 manuelles

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
// 1) Valeurs impossibles : la sauvegarde est REFUSÉE (renvoie la raison, sinon null)
function invalid(next, al) {
  const casts = +next.casts || 0, xp = +next.xp || 0, w = wealth(next);
  if (casts > LIMITS.maxCasts) return 'casts';
  if (xp > casts * LIMITS.xpPerCast + al.xp) return 'xp';
  if (!isFinite(w) || w > 150 + casts * LIMITS.wealthPerCast + al.c) return 'richesse';
  return null;
}
// 2) Progression suspecte : la sauvegarde est ACCEPTÉE mais le compte est SIGNALÉ pour l'admin
//    (jamais de blocage : deux appareils qui divergent ou une reprise après une longue pause restent légitimes)
function suspicious(next, prev, elapsedMs, al) {
  if (!prev) return null;
  const casts = +next.casts || 0, xp = +next.xp || 0;
  const dc = casts - (+prev.casts || 0);
  if (dc > elapsedMs / (LIMITS.minCastSeconds * 1000) + LIMITS.slackCasts) return 'rythme (+' + dc + ' lancers en ' + Math.round(elapsedMs / 1000) + ' s)';
  if (dc >= 0 && !al.xp && xp - (+prev.xp || 0) > dc * LIMITS.xpPerCast) return 'xp trop rapide';
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
  return J({ token, username: u, data: null, updated: 0, recovery, admin: isAdmin(env, { username: u }) });
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
  return J({ token, username: user.username, data: s.data, updated: s.updated, admin: isAdmin(env, user) });
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
  return J({ token, username: user.username, data: s.data, updated: s.updated, recovery, admin: isAdmin(env, user) });
}

async function newCodeFor(req, env, user) {
  const b = await readJson(req);
  if (!(await checkPassword(env, user.username, String(b.password || '').slice(0, 128)))) return J({ error: 'Mot de passe incorrect.' }, 401);
  const recovery = newRecoveryCode();
  await env.DB.prepare('UPDATE users SET recovery_hash = ? WHERE id = ?').bind(await codeHash(user.username, recovery), user.id).run();
  return J({ recovery });
}

// Sauvegarde AUTOMATIQUE : une seule par compte (remplacée par la suivante), au plus toutes les 30 min,
// et toujours juste avant qu'une sauvegarde soit remplacée de force (reset, restauration).
async function autoBackup(env, userId, data, always) {
  const now = Date.now();
  const last = await env.DB.prepare("SELECT MAX(ts) AS ts FROM save_backups WHERE user_id = ? AND kind = 'auto'").bind(userId).first();
  if (!always && last && last.ts && now - last.ts < BACKUP_EVERY) return;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM save_backups WHERE user_id = ? AND kind = 'auto'").bind(userId),
    env.DB.prepare("INSERT INTO save_backups(user_id, data, ts, kind) VALUES(?,?,?, 'auto')").bind(userId, data, now),
  ]);
}

// Sauvegarde MANUELLE : 5 au maximum, la plus ancienne est supprimée quand une nouvelle arrive.
async function manualBackup(env, userId) {
  const cur = await env.DB.prepare('SELECT data FROM saves WHERE user_id = ?').bind(userId).first();
  if (!cur) return false;
  await env.DB.prepare("INSERT INTO save_backups(user_id, data, ts, kind) VALUES(?,?,?, 'manual')").bind(userId, cur.data, Date.now()).run();
  await env.DB.prepare("DELETE FROM save_backups WHERE user_id = ? AND kind = 'manual' AND id NOT IN (SELECT id FROM save_backups WHERE user_id = ? AND kind = 'manual' ORDER BY ts DESC, id DESC LIMIT ?)")
    .bind(userId, userId, MANUAL_KEEP)
    .run();
  return true;
}

async function backupsOf(env, userId) {
  const rows = await env.DB.prepare('SELECT id, ts, kind, data FROM save_backups WHERE user_id = ? ORDER BY ts DESC, id DESC').bind(userId).all();
  return (rows.results || []).map((r) => {
    let d = {};
    try { d = JSON.parse(r.data); } catch (e) {}
    return { id: r.id, ts: r.ts, kind: r.kind, xp: d.xp || 0, c: d.c || 0, casts: d.casts || 0 };
  });
}

// remplace la sauvegarde d'un joueur par une de ses copies ; la sauvegarde remplacée devient la sauvegarde automatique
async function restoreFor(env, userId, backupId) {
  const row = await env.DB.prepare('SELECT data FROM save_backups WHERE id = ? AND user_id = ?').bind(+backupId || 0, userId).first();
  if (!row) return null;
  const cur = await env.DB.prepare('SELECT data, updated FROM saves WHERE user_id = ?').bind(userId).first();
  if (cur) await autoBackup(env, userId, cur.data, true);
  const now = Math.max(Date.now(), (cur ? cur.updated : 0) + 1);
  await env.DB.prepare('INSERT INTO saves(user_id, data, updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated = excluded.updated')
    .bind(userId, row.data, now)
    .run();
  const restored = JSON.parse(row.data);
  await updStats(env, userId, restored);
  return { data: restored, updated: now };
}

async function listBackups(env, user) {
  return J({ list: await backupsOf(env, user.id) });
}

async function restore(req, env, user) {
  const b = await readJson(req);
  const r = await restoreFor(env, user.id, b.id);
  return r ? J(r) : J({ error: 'Sauvegarde introuvable.' }, 404);
}

// --- Classement : quatre statistiques tirées de la sauvegarde (bornées), recalculées à chaque sauvegarde ---
const BOARDS = { casts: 'st_casts', species: 'st_species', mut: 'st_mut', ach: 'st_ach' };
function statsOf(d) {
  const n = (o) => (o && typeof o === 'object' ? Object.keys(o).length : 0);
  const sum = (o) => (o && typeof o === 'object' ? Object.values(o).reduce((a, b) => a + (+b || 0), 0) : 0);
  return {
    casts: Math.min(Math.max(+d.casts || 0, 0), LIMITS.maxCasts),
    species: Math.min(n(d.idx), 500),
    mut: Math.min(n(d.mu), 50),
    ach: Math.min(Math.max(sum(d.ach), 0), 500),
  };
}
async function updStats(env, uid, d) {
  const st = statsOf(d);
  await env.DB.prepare('UPDATE users SET st_casts = ?, st_species = ?, st_mut = ?, st_ach = ? WHERE id = ?').bind(st.casts, st.species, st.mut, st.ach, uid).run();
}
async function leaderboard(req, env, user) {
  const board = new URL(req.url).searchParams.get('board') || 'casts';
  const col = BOARDS[board];
  if (!col) return J({ error: 'Classement inconnu.' }, 400);
  const adm = String(env.ADMIN_USERNAME || '');
  const me = await env.DB.prepare('SELECT st_hide, flagged, ' + col + ' AS v FROM users WHERE id = ?').bind(user.id).first();
  const rows = await env.DB.prepare(
    'SELECT username, ' + col + ' AS value FROM users WHERE flagged = 0 AND st_hide = 0 AND username <> ? AND ' + col + ' > 0 ORDER BY ' + col + ' DESC, id ASC LIMIT 20'
  ).bind(adm).all();
  const list = (rows.results || []).map((r) => ({ username: r.username, value: r.value, me: r.username.toLowerCase() === user.username.toLowerCase() }));
  let mine = null;
  if (me && !me.st_hide && !me.flagged && me.v > 0 && user.username.toLowerCase() !== adm.toLowerCase()) {
    const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM users WHERE flagged = 0 AND st_hide = 0 AND username <> ? AND ' + col + ' > ?').bind(adm, me.v).first();
    mine = { rank: r.n + 1, value: me.v };
  }
  return J({ rows: list, me: mine, hidden: !!(me && me.st_hide) });
}
async function setHidden(req, env, user) {
  const b = await readJson(req);
  await env.DB.prepare('UPDATE users SET st_hide = ? WHERE id = ?').bind(b.hide ? 1 : 0, user.id).run();
  return J({ ok: true });
}

// --- Dons et retraits d'objets (test) : l'admin met des opérations en attente, le jeu du joueur les applique en direct ---
const GRANT_KINDS = ['coins', 'xp', 'rod', 'zone', 'chest', 'bait', 'art', 'stone', 'star'];
const NEEDS_ID = ['rod', 'zone', 'chest', 'bait', 'art'];
function cleanOp(o) {
  if (!o || !GRANT_KINDS.includes(o.k) || !['give', 'remove'].includes(o.mode)) return null;
  const id = NEEDS_ID.includes(o.k) ? Math.floor(+o.id) : 0;
  if (NEEDS_ID.includes(o.k) && !(id >= 0 && id < 200)) return null;
  let n = Math.floor(+o.n);
  if (['rod', 'zone', 'art'].includes(o.k)) n = 1;
  const max = o.k === 'coins' || o.k === 'xp' ? 1e15 : 1e6;
  if (!(n >= 1 && n <= max)) return null;
  return { k: o.k, id, n, mode: o.mode };
}
// valeur « comptable » d'un don, pour que les contrôles anti-triche ne le prennent pas pour de la triche
function allowDelta(op) {
  const sign = op.mode === 'give' ? 1 : -1;
  if (op.k === 'coins') return { c: sign * op.n, xp: 0 };
  if (op.k === 'xp') return { c: 0, xp: sign * op.n };
  if (op.k === 'chest') return { c: sign * op.n * (CHEST_PRICE[op.id] || 1e7), xp: 0 };
  return { c: 0, xp: 0 };
}
async function addGrant(env, uid, op) {
  const d = allowDelta(op);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO grants(user_id, ts, op) VALUES(?,?,?)').bind(uid, Date.now(), JSON.stringify(op)),
    env.DB.prepare('UPDATE users SET ga_c = MAX(0, ga_c + ?), ga_xp = MAX(0, ga_xp + ?) WHERE id = ?').bind(d.c, d.xp, uid),
  ]);
}
async function pendingGrants(env, user) {
  const rows = await env.DB.prepare('SELECT id, op FROM grants WHERE user_id = ? AND applied = 0 ORDER BY id LIMIT 50').bind(user.id).all();
  return J({ list: (rows.results || []).map((r) => ({ id: r.id, op: JSON.parse(r.op) })) });
}
async function ackGrants(req, env, user) {
  const b = await readJson(req);
  const ids = (Array.isArray(b.ids) ? b.ids : []).map((x) => Math.floor(+x)).filter((x) => x > 0).slice(0, 50);
  for (const id of ids) await env.DB.prepare('UPDATE grants SET applied = 1, applied_ts = ? WHERE id = ? AND user_id = ?').bind(Date.now(), id, user.id).run();
  return J({ ok: true });
}
function saveSummary(data) {
  let d = {};
  try { d = data ? JSON.parse(data) : {}; } catch (e) {}
  return { c: d.c || 0, xp: d.xp || 0, casts: d.casts || 0, rod: d.rod || 0, rods: d.rods || [], zone: d.zone || 0, zones: d.zones || [], chests: d.chests || {}, baits: d.baits || {}, ao: d.ao || {}, es: d.es || 0, pt: d.pt || 0 };
}

// --- Administration : réservée au compte dont le pseudo est ADMIN_USERNAME (voir wrangler.toml) ---
const isAdmin = (env, user) => !!(env.ADMIN_USERNAME && user && user.username.toLowerCase() === String(env.ADMIN_USERNAME).toLowerCase());

async function adminUsers(env) {
  const rows = await env.DB.prepare(
    'SELECT u.id, u.username, u.created, u.flagged, u.flag_reason, s.data, s.updated FROM users u LEFT JOIN saves s ON s.user_id = u.id ORDER BY u.flagged DESC, s.updated DESC LIMIT 500'
  ).all();
  return (rows.results || []).map((r) => {
    let d = {};
    try { d = r.data ? JSON.parse(r.data) : {}; } catch (e) {}
    return { id: r.id, username: r.username, created: r.created, updated: r.updated || 0, xp: d.xp || 0, c: d.c || 0, casts: d.casts || 0, flagged: !!r.flagged, flag_reason: r.flag_reason || '' };
  });
}

async function adminRoute(route, req, env, user) {
  if (route === 'GET /api/admin/users') return J({ users: await adminUsers(env) });
  const b = route.startsWith('GET') ? Object.fromEntries(new URL(req.url).searchParams) : await readJson(req);
  const uid = +b.user_id || 0;
  const target = await env.DB.prepare('SELECT id, username, flagged, flag_reason FROM users WHERE id = ?').bind(uid).first();
  if (!target) return J({ error: 'Compte introuvable.' }, 404);
  if (route === 'GET /api/admin/user') {
    const sv = await env.DB.prepare('SELECT data FROM saves WHERE user_id = ?').bind(uid).first();
    const gr = await env.DB.prepare('SELECT id, ts, op, applied, undone FROM grants WHERE user_id = ? ORDER BY id DESC LIMIT 20').bind(uid).all();
    return J({
      user: target,
      backups: await backupsOf(env, uid),
      summary: saveSummary(sv && sv.data),
      grants: (gr.results || []).map((g) => ({ id: g.id, ts: g.ts, op: JSON.parse(g.op), applied: !!g.applied, undone: !!g.undone })),
    });
  }
  if (route === 'POST /api/admin/grant') {
    const op = cleanOp(b.op);
    if (!op) return J({ error: 'Don invalide.' }, 400);
    await addGrant(env, uid, op);
    return J({ ok: true });
  }
  if (route === 'POST /api/admin/undo') {
    // annule tous les DONS non encore annulés : crée le retrait inverse de chacun
    const rows = await env.DB.prepare("SELECT id, op FROM grants WHERE user_id = ? AND undone = 0 AND op LIKE '%\"give\"%'").bind(uid).all();
    let n = 0;
    for (const r of rows.results || []) {
      const op = JSON.parse(r.op);
      if (op.mode !== 'give') continue;
      await addGrant(env, uid, { ...op, mode: 'remove' });
      await env.DB.prepare('UPDATE grants SET undone = 1 WHERE id = ?').bind(r.id).run();
      n++;
    }
    return J({ ok: true, count: n });
  }
  if (route === 'POST /api/admin/restore') {
    const r = await restoreFor(env, uid, b.id);
    return r ? J({ ok: true }) : J({ error: 'Sauvegarde introuvable.' }, 404);
  }
  if (route === 'POST /api/admin/unflag') {
    await env.DB.prepare('UPDATE users SET flagged = 0, flag_reason = NULL WHERE id = ?').bind(uid).run();
    return J({ ok: true });
  }
  if (route === 'POST /api/admin/reset-password') {
    const temp = newRecoveryCode().replace(/-/g, '').slice(0, 12).toLowerCase() + '9';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    await env.DB.batch([
      env.DB.prepare('UPDATE users SET salt = ?, hash = ? WHERE id = ?').bind(hex(salt), await pbkdf2(temp, salt), uid),
      env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(uid),
    ]);
    return J({ ok: true, password: temp });
  }
  if (route === 'POST /api/admin/delete') {
    if (uid === user.id) return J({ error: 'Impossible de supprimer le compte admin.' }, 400);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(uid),
      env.DB.prepare('DELETE FROM grants WHERE user_id = ?').bind(uid),
      env.DB.prepare('DELETE FROM save_backups WHERE user_id = ?').bind(uid),
      env.DB.prepare('DELETE FROM saves WHERE user_id = ?').bind(uid),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(uid),
    ]);
    return J({ ok: true });
  }
  return J({ error: 'Introuvable.' }, 404);
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
  const al = await env.DB.prepare('SELECT ga_c, ga_xp FROM users WHERE id = ?').bind(user.id).first();
  const allow = { c: (al && al.ga_c) || 0, xp: (al && al.ga_xp) || 0 };
  const why = invalid(data, allow);
  if (why) return J({ error: 'Sauvegarde refusée (valeurs impossibles : ' + why + ').', refused: true }, 422);
  const flag = b.force ? null : suspicious(data, prev, cur ? now - cur.updated : 0, allow);
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
  if (cur) await autoBackup(env, user.id, cur.data, !!b.force);
  await updStats(env, user.id, data);
  if (flag) await env.DB.prepare('UPDATE users SET flagged = 1, flag_reason = ?, flag_ts = ? WHERE id = ?').bind(flag, now, user.id).run();
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

      if (route === 'GET /api/save') return J({ ...(await loadSave(env, user.id)), admin: isAdmin(env, user) });
      if (route === 'PUT /api/save') return await putSave(req, env, user);
      if (route === 'GET /api/backups') return await listBackups(env, user);
      if (route === 'POST /api/restore') return await restore(req, env, user);
      if (route === 'GET /api/leaderboard') return await leaderboard(req, env, user);
      if (route === 'POST /api/leaderboard/hide') return await setHidden(req, env, user);
      if (route === 'GET /api/grants') return await pendingGrants(env, user);
      if (route === 'POST /api/grants/ack') return await ackGrants(req, env, user);
      if (route === 'POST /api/backup') {
        const ok = await manualBackup(env, user.id);
        return ok ? J({ ok: true }) : J({ error: 'Aucune partie à sauvegarder.' }, 400);
      }
      if (url.pathname.startsWith('/api/admin/')) {
        if (!isAdmin(env, user)) return J({ error: 'Introuvable.' }, 404);
        return await adminRoute(route, req, env, user);
      }
      if (route === 'POST /api/recovery-code') return await newCodeFor(req, env, user);
      if (route === 'POST /api/logout') {
        const tok = (req.headers.get('Authorization') || '').slice(7);
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(tok)).run();
        return J({ ok: true });
      }
      if (route === 'DELETE /api/account') {
        if (isAdmin(env, user)) return J({ error: 'Le compte admin ne peut pas être supprimé.' }, 400);
        const b = await readJson(req);
        const ok = await checkPassword(env, user.username, String(b.password || '').slice(0, 128));
        if (!ok) return J({ error: 'Mot de passe incorrect.' }, 401);
        await env.DB.batch([
          env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
          env.DB.prepare('DELETE FROM saves WHERE user_id = ?').bind(user.id),
          env.DB.prepare('DELETE FROM grants WHERE user_id = ?').bind(user.id),
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
