const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const transitions = {
  unpaid: ['paid', 'cancelled'],
  paid: ['preparing', 'cancelled'],
  preparing: ['ready', 'delivering'],
  ready: ['picked'],
  delivering: ['completed'],
  picked: ['completed'],
  completed: [],
  cancelled: []
};

exports.main = async (event) => {
  const order = await db.collection('orders').doc(event.id).get();
  if (!order.data) return { ok: false, message: '订单不存在' };
  if (!transitions[order.data.status] || !transitions[order.data.status].includes(event.status)) {
    return { ok: false, message: '订单状态不可这样流转' };
  }
  await db.collection('orders').doc(event.id).update({
    data: {
      status: event.status,
      timeline: db.command.push({ status: event.status, text: `状态更新为${event.status}` })
    }
  });
  return { ok: true };
};
