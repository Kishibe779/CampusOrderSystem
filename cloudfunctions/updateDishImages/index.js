const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const IMAGE_MAP = {
  d1: '/images/dishes/fanqiechaodantaocan.jpg',
  d2: '/images/dishes/heijiaojipaifan.jpg',
  d3: '/images/dishes/dizhijixiongshala.jpg',
  d4: '/images/dishes/guihuasuanmeitang.jpg',
  d5: '/images/dishes/yuxiangrousigaifan.jpg',
  d6: '/images/dishes/jiaoshigongzuocan.jpg'
};

exports.main = async () => {
  const results = [];

  for (const [id, path] of Object.entries(IMAGE_MAP)) {
    try {
      const dishRes = await db.collection('dishes').where({ id }).get();
      if (dishRes.data.length) {
        await db.collection('dishes').doc(dishRes.data[0]._id).update({
          data: { image: path }
        });
        results.push({ id, path, status: 'updated' });
      } else {
        results.push({ id, path, status: 'not_found' });
      }
    } catch (e) {
      results.push({ id, path, status: 'error', message: e.message });
    }
  }

  return { ok: true, message: '菜品图片更新完成', results };
};
