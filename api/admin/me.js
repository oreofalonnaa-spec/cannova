const L = require('../_lib');
module.exports = async (req, res) => L.send(res, L.admin(req) ? 200 : 401, { ok: !!L.admin(req) });
