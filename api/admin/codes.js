const L = require('../_lib');
module.exports = async (req, res) => {
  try {
    if (!L.admin(req)) return L.send(res, 401, { ok: false });
    if (!L.guard(req, res)) return;
    if (req.method === 'GET') {
      const codes = (await L.one('SMEMBERS', 'promos')) || [], cmds = [];
      codes.forEach(c => { cmds.push(['GET', 'promo:' + c]); cmds.push(['GET', 'promo:' + c + ':uses']); });
      const out = codes.length ? await L.redis(cmds) : [];
      return L.send(res, 200, { ok: true, list: codes.map((c, i) => { let d = {}; try { d = JSON.parse(out[i * 2] || '{}'); } catch (e) { } return { code: c, percent: d.percent || 0, max: d.max || 0, exp: d.exp || '', uses: Number(out[i * 2 + 1]) || 0 }; }) });
    }
    const b = await L.body(req), code = String(b.code || '').trim().toLowerCase();
    if (req.method === 'POST') {
      const pc = parseInt(b.percent, 10), mx = parseInt(b.max || 0, 10), exp = String(b.exp || '').slice(0, 10);
      if (!/^[a-z0-9_-]{4,30}$/.test(code) || !(pc >= 1 && pc <= 50) || !(mx >= 0 && mx <= 1e6) || (exp && !/^\d{4}-\d{2}-\d{2}$/.test(exp))) return L.send(res, 400, { ok: false, msg: 'Valeurs invalides' });
      await L.redis([['SET', 'promo:' + code, JSON.stringify({ percent: pc, max: mx, exp })], ['SADD', 'promos', code]]);
      return L.send(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      if (!/^[a-z0-9_-]{4,30}$/.test(code)) return L.send(res, 400, { ok: false });
      await L.redis([['DEL', 'promo:' + code], ['DEL', 'promo:' + code + ':uses'], ['SREM', 'promos', code]]);
      return L.send(res, 200, { ok: true });
    }
    L.send(res, 405, { ok: false });
  } catch (e) { L.send(res, 500, { ok: false }); }
};
