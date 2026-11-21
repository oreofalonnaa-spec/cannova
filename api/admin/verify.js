const L = require('../_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { ok: false });
    if (!L.guard(req, res)) return;
    const ih = L.ipHash(req);
    if (await L.one('GET', 'blk:' + ih)) return L.send(res, 403, { ok: false, kick: true });
    if (!(await L.limit('rl:adv:' + ih, 10, 900))) return L.send(res, 429, { ok: false, kick: true });
    const b = await L.body(req); const email = String(b.email || '').trim().toLowerCase(); const code = String(b.code || '').replace(/\D/g, '').slice(0, 6);
    if (email !== L.ADMIN) return L.send(res, 403, { ok: false, kick: true });
    const miss = L.missing(); if (miss.length) return L.send(res, 500, { ok: false, msg: 'Configuration manquante : ' + miss.join(' ; ') });
    const r = await L.redis([['GET', 'otp:h'], ['INCR', 'otp:n']]);
    if (!r[0] || r[1] > 5) { await L.one('DEL', 'otp:h'); return L.send(res, 403, { ok: false, msg: 'Code expiré : recommence.' }); }
    const a = Buffer.from(L.sha(code + L.SECRET)), c = Buffer.from(String(r[0]));
    if (code.length !== 6 || a.length !== c.length || !L.crypto.timingSafeEqual(a, c)) return L.send(res, 403, { ok: false, msg: 'Code incorrect.' });
    await L.redis([['DEL', 'otp:h'], ['DEL', 'otp:n']]);
    const tok = L.sign({ em: L.ADMIN, exp: Date.now() + 8 * 3600 * 1000, id: L.crypto.randomBytes(8).toString('hex') });
    res.setHeader('Set-Cookie', 'cn_admin=' + encodeURIComponent(tok) + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800');
    L.send(res, 200, { ok: true });
  } catch (e) { L.send(res, 500, { ok: false }); }
};
