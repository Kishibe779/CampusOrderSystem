const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const IMAGE_MAP = {
  d1: 'fanqiechaodantaocan.jpg',
  d2: 'heijiaojipaifan.jpg',
  d3: 'dizhijixiongshala.jpg',
  d4: 'guihuasuanmeitang.jpg',
  d5: 'yuxiangrousigaifan.jpg',
  d6: 'jiaoshigongzuocan.jpg'
};

const BASE = 'cloud://cloud1-d3gm1xr7meaed0341.636c-cloud1-d3gm1xr7meaed0341-1447897454/DishesName/';

exports.main = async () => {
  const results = [];

  for (const [id, file] of Object.entries(IMAGE_MAP)) {
    try {
      const fileID = BASE + file;
      const dishRes = await db.collection('dishes').where({ id }).get();
      if (dishRes.data.length) {
        await db.collection('dishes').doc(dishRes.data[0]._id).update({
          data: { image: fileID }
        });
        results.push({ id, file, status: 'updated' });
      } else {
        results.push({ id, file, status: 'not_found' });
      }
    } catch (e) {
      results.push({ id, file, status: 'error', message: e.message });
    }
  }

  return { ok: true, message: '菜品图片更新完成', results };
};
