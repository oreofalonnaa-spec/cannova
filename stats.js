const L = require('../_lib');
const EV = ['visit', 'cart_add', 'checkout', 'wa', 'tg', 'special'];
module.exports = async (req, res) => {
  try {
    if (!L.admin(req)) return L.send(res, 401, { ok: false });
    const days = []; for (let i = 0; i < 30; i++) days.push(L.day(new Date(Date.now() - i * 864e5)));
    const cmds = [];
    days.forEach(d => { EV.forEach(e => cmds.push(['GET', 'st:' + d + ':' + e])); cmds.push(['PFCOUNT', 'uv:' + d]); cmds.push(['ZRANGE', 'src:' + d, '0', '-1', 'WITHSCORES']); });
    const out = await L.redis(cmds), per = EV.length + 2, rows = [], src = {};
    days.forEach((d, i) => {
      const o = out.slice(i * per, (i + 1) * per), row = { day: d, uv: Number(o[EV.length]) || 0 };
      EV.forEach((e, k) => { row[e] = Number(o[k]) || 0; }); rows.push(row);
      const z = o[EV.length + 1] || []; for (let j = 0; j < z.length; j += 2) src[z[j]] = (src[z[j]] || 0) + Number(z[j + 1]);
    });
    const bad = (await L.one('LRANGE', 'badlog', '0', '9')) || [];
    L.send(res, 200, { ok: true, rows, src, bad: bad.map(x => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean) });
  } catch (e) { L.send(res, 500, { ok: false }); }
};
