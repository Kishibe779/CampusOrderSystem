const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const res = await db.collection('carts')
    .where({ userOpenid: openid })
    .orderBy('updatedAt', 'desc')
    .get();

  const items = res.data.map((item) => ({
    id: item.dishId,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  return { ok: true, items };
};
