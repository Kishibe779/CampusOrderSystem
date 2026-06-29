const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const where = { userOpenid: openid };
  if (event.status && event.status !== 'all') {
    where.status = event.status;
  }

  const res = await db.collection('orders')
    .where(where)
    .orderBy('createdAt', 'desc')
    .get();

  return { ok: true, orders: res.data };
};
