const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const code = String(event.code || '').trim();
  if (!code) return { ok: false, message: '请输入取餐凭证' };

  const codeRecord = await db.collection('pickup_codes').where({ code }).get();
  if (!codeRecord.data.length) return { ok: false, message: '取餐凭证不存在' };
  if (codeRecord.data[0].used) return { ok: false, message: '该凭证已核销' };

  const orderId = codeRecord.data[0].orderId;
  await Promise.all([
    db.collection('pickup_codes').doc(codeRecord.data[0]._id).update({ data: { used: true, usedAt: db.serverDate() } }),
    db.collection('orders').doc(orderId).update({
      data: {
        status: 'picked',
        timeline: db.command.push({ status: 'picked', text: '管理员核销成功' })
      }
    })
  ]);

  return { ok: true, orderId };
};
