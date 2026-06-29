const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const id = event.id;
  if (!id) return { ok: false, message: '缺少菜品ID' };

  const res = await db.collection('dishes').where({ id }).get();
  const dish = res.data[0] || null;

  // 将 cloud:// 图片转为 https 临时链接
  if (dish && dish.image && dish.image.startsWith('cloud://')) {
    const tempRes = await cloud.getTempFileURL({ fileList: [dish.image] });
    if (tempRes.fileList[0].tempFileURL) {
      dish.image = tempRes.fileList[0].tempFileURL;
    }
  }

  return { ok: true, dish };
};
