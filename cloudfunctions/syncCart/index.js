const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const items = event.items || [];

  // 删除该用户旧购物车记录
  const old = await db.collection('carts').where({ userOpenid: openid }).get();
  for (const item of old.data) {
    await db.collection('carts').doc(item._id).remove();
  }

  // 写入新购物车数据
  if (items.length) {
    for (const item of items) {
      await db.collection('carts').add({
        data: {
          userOpenid: openid,
          dishId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          updatedAt: db.serverDate()
        }
      });
    }
  }

  return { ok: true, count: items.length };
};
