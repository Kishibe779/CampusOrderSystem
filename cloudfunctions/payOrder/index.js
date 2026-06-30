const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function pad(value, length) {
  return String(value).padStart(length, '0');
}

async function pickupCode(db) {
  const existing = await db.collection('pickup_codes').field({ code: true }).limit(1000).get();
  const used = new Set(existing.data.map((r) => r.code));
  var code = pad(Math.floor(Math.random() * 900000) + 100000, 6);
  var guard = 0;
  while (used.has(code) && guard < 900000) {
    code = pad((Number(code) + 1 - 100000) % 900000 + 100000, 6);
    guard++;
  }
  return code;
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const orderId = event.orderId;

  const orderRes = await db.collection('orders').doc(orderId).get();
  if (!orderRes.data) return { ok: false, message: '订单不存在' };
  const order = orderRes.data;
  if (order.status !== 'unpaid') return { ok: false, message: '订单状态异常' };

  // 尝试真实支付（需商户号配置），否则走模拟支付
  var paid = false;
  try {
    // 微信云支付统一下单（需开通微信支付商户）
    // const payResult = await cloud.cloudPay.unifiedOrder({
    //   body: order.orderType === 'group' ? '团餐预订' : '校园点餐',
    //   outTradeNo: order.orderNo,
    //   totalFee: Math.round(order.totalAmount * 100),
    //   spbillCreateIp: '127.0.0.1',
    //   tradeType: 'JSAPI',
    //   openid: wxContext.OPENID
    // });
    // if (payResult.returnCode === 'SUCCESS') {
    //   return { ok: true, payment: payResult.payment };
    // }
    paid = true;
  } catch (e) {
    // 未配置商户号，降级为模拟支付
    paid = true;
  }

  if (!paid) return { ok: false, message: '支付失败' };

  // 支付成功：更新状态 + 生成取餐码
  const code = order.orderType === 'delivery' ? '' : await pickupCode(db);
  const tx = await db.startTransaction();
  try {
    await tx.collection('orders').doc(orderId).update({
      data: {
        status: 'paid',
        pickupCode: code,
        timeline: _.push(
          { status: 'paid', text: '支付成功，订单已生成' },
          { status: 'preparing', text: '食堂备餐中' }
        )
      }
    });
    if (code) {
      await tx.collection('pickup_codes').add({
        data: { code, orderId, used: false, createdAt: db.serverDate() }
      });
    }
    await tx.commit();
    return { ok: true, order: { id: orderId, ...order, status: 'paid', pickupCode: code } };
  } catch (error) {
    await tx.rollback();
    return { ok: false, message: error.message };
  }
};
