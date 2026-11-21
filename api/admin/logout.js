const L = require('../_lib');
module.exports = async (req, res) => {
  res.setHeader('Set-Cookie', 'cn_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  L.send(res, 200, { ok: true });
};
