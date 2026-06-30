const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const transitions = {
  unpaid: ['paid', 'cancelled'],
  paid: ['preparing', 'cancelled'],
  preparing: ['ready', 'delivering'],
  ready: ['picked', 'delivering'],
  delivering: ['delivered'],
  delivered: ['completed'],
  picked: ['completed'],
  completed: [],
  cancelled: []
};

exports.main = async (event) => {
  const orderRes = await db.collection('orders').doc(event.id).get();
  if (!orderRes.data) return { ok: false, message: '订单不存在' };
  const order = orderRes.data;
  if (!transitions[order.status] || !transitions[order.status].includes(event.status)) {
    return { ok: false, message: '订单状态不可这样流转' };
  }

  // 取消/退款时恢复库存和销量
  if (event.status === 'cancelled' && order.orderType !== 'group') {
    const tx = await db.startTransaction();
    try {
      for (const item of (order.items || [])) {
        await tx.collection('dishes').where({ id: item.id }).update({
          data: {
            stock: _.inc(Number(item.quantity || 0)),
            sales: _.inc(-Number(item.quantity || 0))
          }
        });
      }
      await tx.collection('orders').doc(event.id).update({
        data: {
          status: 'cancelled',
          timeline: _.push({ status: 'cancelled', text: '订单已取消' })
        }
      });
      await tx.commit();
      return { ok: true };
    } catch (error) {
      await tx.rollback();
      return { ok: false, message: error.message };
    }
  }

  await db.collection('orders').doc(event.id).update({
    data: {
      status: event.status,
      timeline: _.push({ status: event.status, text: `状态更新为${event.status}` })
    }
  });
  return { ok: true };
};
