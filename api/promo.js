const L = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return L.send(res, 405, { ok: false });
    if (!(await L.limit('rl:pr:' + L.ipHash(req), 20, 600))) return L.send(res, 429, { ok: false, busy: true });
    const b = await L.body(req), code = String(b.code || '').trim().toLowerCase().slice(0, 30);
    if (!/^[a-z0-9_-]{4,30}$/.test(code)) return L.send(res, 200, { ok: false });
    const r = await L.redis([['GET', 'promo:' + code], ['GET', 'promo:' + code + ':uses']]);
    if (!r[0]) return L.send(res, 200, { ok: false });
    const d = JSON.parse(r[0]);
    if ((d.exp && d.exp < L.day()) || (d.max && Number(r[1] || 0) >= d.max)) return L.send(res, 200, { ok: false });
    L.send(res, 200, { ok: true, rate: d.percent / 100 });
  } catch (e) { L.send(res, 200, { ok: false, busy: true }); }
};
