const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const code = String(event.code || '').trim();
  if (!code) return { ok: false, message: '请输入取餐凭证' };

  const tx = await db.startTransaction();
  try {
    const codeRecord = await tx.collection('pickup_codes').where({ code }).get();
    if (!codeRecord.data.length) {
      await tx.rollback();
      return { ok: false, message: '取餐凭证不存在' };
    }
    if (codeRecord.data[0].used) {
      await tx.rollback();
      return { ok: false, message: '该凭证已核销' };
    }

    const orderId = codeRecord.data[0].orderId;
    await tx.collection('pickup_codes').doc(codeRecord.data[0]._id).update({
      data: { used: true, usedAt: db.serverDate() }
    });
    await tx.collection('orders').doc(orderId).update({
      data: {
        status: 'picked',
        timeline: _.push({ status: 'picked', text: '管理员核销成功' })
      }
    });

    await tx.commit();
    return { ok: true, orderId };
  } catch (error) {
    await tx.rollback();
    return { ok: false, message: '核销失败，请重试' };
  }
};
