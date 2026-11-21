const L = require('../_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { ok: false });
    if (!L.guard(req, res)) return;
    const b = await L.body(req), email = String(b.email || '').trim().toLowerCase().slice(0, 120), ih = L.ipHash(req);
    if (email !== L.ADMIN) { // autre adresse : refus, expulsion, blocage après 3 essais
      try {
        const r = await L.redis([['SET', 'bad:' + ih, '0', 'EX', 3600, 'NX'], ['INCR', 'bad:' + ih], ['LPUSH', 'badlog', JSON.stringify({ t: Date.now(), ih: ih.slice(0, 8), em: email.slice(0, 60) })], ['LTRIM', 'badlog', 0, 99]]);
        if (r[1] >= 3) await L.one('SET', 'blk:' + ih, '1', 'EX', 3600);
      } catch (e) { }
      return L.send(res, 403, { ok: false, kick: true });
    }
    const miss = L.missing();
    if (miss.length) return L.send(res, 500, { ok: false, msg: 'Configuration manquante : ' + miss.join(' ; ') + '. Ajoute ce qui manque dans Vercel (Settings, Environment Variables, cochée pour Production), puis fais Redeploy.' });
    if (await L.one('GET', 'blk:' + ih)) return L.send(res, 403, { ok: false, kick: true });
    if (!(await L.limit('rl:adm:' + ih, 8, 900))) return L.send(res, 429, { ok: false, msg: 'Trop de demandes. Réessaie dans 15 minutes.' });
    const code = String(L.crypto.randomInt(0, 1000000)).padStart(6, '0');
    await L.redis([['SET', 'otp:h', L.sha(code + L.SECRET), 'EX', 600], ['SET', 'otp:n', '0', 'EX', 600]]);
    try {
      await L.mail(L.ADMIN, 'Ton code de connexion CANNOVA', 'Ton code : ' + code + '\n\nIl expire dans 10 minutes. Si ce n’est pas toi, ignore ce message.');
    } catch (e) {
      const st = String(e.message || '').replace('mail_', '');
      return L.send(res, 502, { ok: false, msg: 'Resend a refusé l’envoi (erreur ' + st + '). Vérifie la clé RESEND_API_KEY et que ton compte Resend utilise bien l’adresse ' + L.ADMIN + '.' });
    }
    L.send(res, 200, { ok: true });
  } catch (e) {
    L.send(res, 500, { ok: false, msg: String(e.message || '').startsWith('redis_') ? 'Base de données injoignable : vérifie la connexion Upstash dans Vercel.' : 'Erreur serveur.' });
  }
};
