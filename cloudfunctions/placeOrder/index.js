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

function pickupCode() {
  return pad(Math.floor(Math.random() * 900000) + 100000, 6);
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
    status: event.payNow === false ? 'unpaid' : 'paid',
    pickupCode: event.orderType === 'delivery' ? '' : pickupCode(),
    createdAt: db.serverDate(),
    timeline: [
      { status: 'paid', text: '支付成功，订单已生成' },
      { status: 'preparing', text: '食堂备餐中' }
    ]
  };

  const tx = await db.startTransaction();
  try {
    if (order.orderType !== 'group') {
      for (const item of items) {
        const dishRef = tx.collection('dishes').doc(item.id);
        const dish = await dishRef.get();
        if (!dish.data || Number(dish.data.stock || 0) < Number(item.quantity || 0)) {
          await tx.rollback();
          return { ok: false, message: `${item.name}库存不足` };
        }
        await dishRef.update({ data: { stock: _.inc(-Number(item.quantity || 0)), sales: _.inc(Number(item.quantity || 0)) } });
      }
    }
    const res = await tx.collection('orders').add({ data: order });
    if (order.pickupCode) {
      await tx.collection('pickup_codes').add({ data: { code: order.pickupCode, orderId: res._id, used: false, createdAt: db.serverDate() } });
    }
    await tx.commit();
    return { ok: true, order: { id: res._id, ...order } };
  } catch (error) {
    await tx.rollback();
    return { ok: false, message: error.message };
  }
};
