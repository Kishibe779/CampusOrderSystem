const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async () => {
  const now = Date.now();

  // 查找超过30分钟未支付的订单
  const expired = await db.collection('orders')
    .where({
      status: 'unpaid',
      expireAt: _.lt(now)
    })
    .get();

  var cancelled = 0;
  for (const order of expired.data) {
    try {
      const tx = await db.startTransaction();
      // 恢复库存和销量
      if (order.orderType !== 'group') {
        for (const item of (order.items || [])) {
          await tx.collection('dishes').where({ id: item.id }).update({
            data: {
              stock: _.inc(Number(item.quantity || 0)),
              sales: _.inc(-Number(item.quantity || 0))
            }
          });
        }
      }
      await tx.collection('orders').doc(order._id).update({
        data: {
          status: 'cancelled',
          timeline: _.push({ status: 'cancelled', text: '超时未支付，订单自动取消' })
        }
      });
      await tx.commit();
      cancelled++;
    } catch (e) {
      // 单条失败不影响其他
    }
  }

  return { ok: true, checked: expired.data.length, cancelled };
};
