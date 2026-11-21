// Fonctions communes (le fichier commence par "_" : Vercel ne le publie pas comme adresse)
const crypto = require('crypto');
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
// Si SESSION_SECRET n'est pas défini, une clé est dérivée des clés Upstash et Resend (qui sont secrètes).
const SECRET = process.env.SESSION_SECRET || ((TOK && process.env.RESEND_API_KEY) ? crypto.createHash('sha256').update('cannova|' + TOK + '|' + process.env.RESEND_API_KEY).digest('hex') : '');
// Adresse admin : variable ADMIN_EMAIL si elle existe, sinon l'adresse de CANNOVA.
const ADMIN = (process.env.ADMIN_EMAIL || 'oreofalonnaa@gmail.com').trim().toLowerCase();
function missing() {
  const m = [];
  if (!URL_ || !TOK) m.push('base Upstash Redis non connectée (variables KV_REST_API_URL et KV_REST_API_TOKEN, ou UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN)');
  if (!process.env.RESEND_API_KEY) m.push('RESEND_API_KEY');
  if (!SECRET) m.push('SESSION_SECRET');
  return m;
}

async function redis(cmds) {
  if (!URL_ || !TOK) throw new Error('redis_not_configured');
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('redis_' + r.status);
  const j = await r.json();
  return j.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}
const one = async (...c) => (await redis([c]))[0];
const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const day = (d) => (d || new Date()).toISOString().slice(0, 10);
const ip = req => String((req.headers['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || '0').trim();
const ipHash = req => sha(ip(req) + '|' + SECRET).slice(0, 24);
async function limit(key, max, sec) { const r = await redis([['SET', key, '0', 'EX', sec, 'NX'], ['INCR', key]]); return r[1] <= max; }

const sign = p => { const a = Buffer.from(JSON.stringify(p)).toString('base64url'); return a + '.' + crypto.createHmac('sha256', SECRET).update(a).digest('base64url'); };
function verify(t) {
  if (!t || !SECRET) return null;
  const [a, s] = String(t).split('.'); if (!a || !s) return null;
  const e = crypto.createHmac('sha256', SECRET).update(a).digest('base64url');
  const x = Buffer.from(s), y = Buffer.from(e);
  if (x.length !== y.length || !crypto.timingSafeEqual(x, y)) return null;
  try { const d = JSON.parse(Buffer.from(a, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch (e2) { return null; }
}
const cookie = (req, n) => { const m = String(req.headers.cookie || '').split(/;\s*/).find(x => x.startsWith(n + '=')); return m ? decodeURIComponent(m.slice(n.length + 1)) : ''; };
const admin = req => { const d = verify(cookie(req, 'cn_admin')); return d && ADMIN && d.em === ADMIN ? d : null; };
async function body(req) { if (req.body && typeof req.body === 'object') return req.body; try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; } }
function send(res, code, obj) { res.setHeader('Cache-Control', 'no-store'); res.status(code).json(obj); }
function guard(req, res) { if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'cannova') { send(res, 403, { ok: false }); return false; } return true; }
async function mail(to, subject, text) {
  const key = process.env.RESEND_API_KEY; if (!key) throw new Error('mail_not_configured');
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.MAIL_FROM || 'CANNOVA <onboarding@resend.dev>', to: [to], subject, text }) });
  if (!r.ok) throw new Error('mail_' + r.status);
}
module.exports = { missing, crypto, redis, one, sha, day, ip, ipHash, limit, sign, verify, cookie, admin, body, send, guard, mail, SECRET, ADMIN };
