const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const id = event.id;
  if (!id) return { ok: false, message: '缺少订单ID' };

  try {
    const res = await db.collection('orders').doc(id).get();
    return { ok: true, order: res.data };
  } catch (e) {
    return { ok: false, message: '订单不存在' };
  }
};
