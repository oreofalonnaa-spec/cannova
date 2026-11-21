const L = require('../_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { ok: false });
    if (!L.guard(req, res)) return;
    if (!L.ADMIN || !L.SECRET) return L.send(res, 500, { ok: false, msg: 'Configuration manquante' });
    const ih = L.ipHash(req);
    if (await L.one('GET', 'blk:' + ih)) return L.send(res, 403, { ok: false, kick: true });
    if (!(await L.limit('rl:adm:' + ih, 8, 900))) return L.send(res, 429, { ok: false, kick: true });
    const b = await L.body(req); const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
    if (email !== L.ADMIN) {
      const r = await L.redis([['SET', 'bad:' + ih, '0', 'EX', 3600, 'NX'], ['INCR', 'bad:' + ih], ['LPUSH', 'badlog', JSON.stringify({ t: Date.now(), ih: ih.slice(0, 8), em: email.slice(0, 60) })], ['LTRIM', 'badlog', 0, 99]]);
      if (r[1] >= 3) await L.one('SET', 'blk:' + ih, '1', 'EX', 3600);
      return L.send(res, 403, { ok: false, kick: true });
    }
    const code = String(L.crypto.randomInt(0, 1000000)).padStart(6, '0');
    await L.redis([['SET', 'otp:h', L.sha(code + L.SECRET), 'EX', 600], ['SET', 'otp:n', '0', 'EX', 600]]);
    await L.mail(L.ADMIN, 'Ton code de connexion CANNOVA', 'Ton code : ' + code + '\n\nIl expire dans 10 minutes. Si ce n’est pas toi, ignore ce message.');
    L.send(res, 200, { ok: true });
  } catch (e) { L.send(res, 500, { ok: false, msg: 'Erreur serveur' }); }
};
