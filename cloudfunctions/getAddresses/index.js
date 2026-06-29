const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const res = await db.collection('addresses')
    .where({ userOpenid: openid })
    .orderBy('createdAt', 'desc')
    .get();

  return { ok: true, addresses: res.data };
};
