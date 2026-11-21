const L = require('./_lib');
const OK = ['visit', 'cart_add', 'checkout', 'wa', 'tg', 'special'], KEEP = 34560000;
module.exports = async (req, res) => {
  const end = () => res.status(204).end();
  try {
    if (req.method !== 'POST') return end();
    const ua = String(req.headers['user-agent'] || '');
    if (/bot|crawl|spider|headless|preview|monitor/i.test(ua)) return end();
    if (!(await L.limit('rl:tr:' + L.ipHash(req), 90, 60))) return end();
    const b = await L.body(req), e = String(b.e || ''); if (!OK.includes(e)) return end();
    const s = String(b.s || 'direct').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) || 'direct', d = L.day();
    const cmds = [['INCR', 'st:' + d + ':' + e], ['EXPIRE', 'st:' + d + ':' + e, KEEP]];
    if (e === 'visit') cmds.push(['PFADD', 'uv:' + d, L.sha(L.ip(req) + '|' + ua + '|' + d + '|' + L.SECRET).slice(0, 32)], ['EXPIRE', 'uv:' + d, KEEP], ['ZINCRBY', 'src:' + d, '1', s], ['EXPIRE', 'src:' + d, KEEP]);
    const code = String(b.c || '').toLowerCase();
    if ((e === 'wa' || e === 'tg') && /^[a-z0-9_-]{4,30}$/.test(code) && (await L.one('EXISTS', 'promo:' + code))) cmds.push(['INCR', 'promo:' + code + ':uses']);
    await L.redis(cmds); end();
  } catch (err) { end(); }
};
