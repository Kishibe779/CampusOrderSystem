const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { id, onSale } = event;
  if (!id) return { ok: false, message: '缺少菜品ID' };

  const res = await db.collection('dishes').where({ id }).get();
  if (!res.data.length) return { ok: false, message: '菜品不存在' };

  await db.collection('dishes').doc(res.data[0]._id).update({
    data: { onSale: !!onSale }
  });

  return { ok: true };
};
