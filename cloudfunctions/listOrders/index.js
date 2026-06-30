const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 查询用户角色，管理员可查看所有订单
  const userRes = await db.collection('users').where({ openid }).get();
  const role = userRes.data.length ? userRes.data[0].role : 'student';

  const where = {};
  if (role !== 'admin') {
    where.userOpenid = openid;
  }
  if (event.status && event.status !== 'all') {
    where.status = event.status;
  }

  const res = await db.collection('orders')
    .where(where)
    .orderBy('createdAt', 'desc')
    .get();

  return { ok: true, orders: res.data };
};
