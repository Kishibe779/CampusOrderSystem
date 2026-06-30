const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function buildOrderNo() {
  const d = new Date();
  const time = [
    d.getFullYear(),
    pad(d.getMonth() + 1, 2),
    pad(d.getDate(), 2),
    pad(d.getHours(), 2),
    pad(d.getMinutes(), 2),
    pad(d.getSeconds(), 2)
  ].join('');
  return `CO${time}${pad(Math.floor(Math.random() * 10000), 4)}`;
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const items = event.items || [];
  if (!items.length) return { ok: false, message: '订单不能为空' };

  const totalAmount = Math.round(items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) * 100) / 100;
  const order = {
    userOpenid: wxContext.OPENID,
    orderNo: buildOrderNo(),
    orderType: event.orderType || 'pickup',
    mealTime: event.mealTime || '',
    address: event.address || null,
    groupInfo: event.groupInfo || null,
    items,
    totalAmount,
    status: 'unpaid',
    pickupCode: '',
    createdAt: db.serverDate(),
    expireAt: Date.now() + 30 * 60 * 1000,
    timeline: [
      { status: 'unpaid', text: '订单已提交，等待支付' }
    ]
  };

  const tx = await db.startTransaction();
  try {
    if (order.orderType !== 'group') {
      for (const item of items) {
        const dishRes = await tx.collection('dishes').where({ id: item.id }).get();
        if (!dishRes.data.length) {
          await tx.rollback();
          return { ok: false, message: `${item.id} 菜品不存在` };
        }
        const dish = dishRes.data[0];
        if (Number(dish.stock || 0) < Number(item.quantity || 0)) {
          await tx.rollback();
          return { ok: false, message: `${dish.name || item.id}库存不足` };
        }
        await tx.collection('dishes').doc(dish._id).update({
          data: { stock: _.inc(-Number(item.quantity || 0)), sales: _.inc(Number(item.quantity || 0)) }
        });
      }
    }
    const res = await tx.collection('orders').add({ data: order });
    const cartItems = await tx.collection('carts').where({ userOpenid: wxContext.OPENID }).get();
    for (const item of cartItems.data) {
      await tx.collection('carts').doc(item._id).remove();
    }
    await tx.commit();
    return { ok: true, order: { id: res._id, ...order } };
  } catch (error) {
    await tx.rollback();
    return { ok: false, message: error.message };
  }
};
