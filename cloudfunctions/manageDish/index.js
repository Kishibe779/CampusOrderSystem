const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// action: add | update | delete
exports.main = async (event) => {
  const action = event.action;
  const dishes = db.collection('dishes');

  if (action === 'add') {
    if (!event.name || !event.price) return { ok: false, message: '名称和价格必填' };
    const id = 'd' + Date.now();
    const dish = {
      id: id,
      categoryId: event.categoryId || 'hot',
      name: event.name,
      price: Number(event.price),
      stock: Number(event.stock) || 0,
      rating: 5,
      sales: 0,
      image: event.image || '',
      desc: event.desc || '',
      ingredients: event.ingredients || '',
      nutrition: event.nutrition || '',
      tags: event.tags || [],
      onSale: true
    };
    await dishes.add({ data: dish });
    return { ok: true, dish: dish };
  }

  if (action === 'update') {
    if (!event.id) return { ok: false, message: '缺少菜品ID' };
    const exist = await dishes.where({ id: event.id }).get();
    if (!exist.data.length) return { ok: false, message: '菜品不存在' };
    const update = {};
    if (event.name !== undefined) update.name = event.name;
    if (event.price !== undefined) update.price = Number(event.price);
    if (event.stock !== undefined) update.stock = Number(event.stock);
    if (event.image !== undefined) update.image = event.image;
    if (event.desc !== undefined) update.desc = event.desc;
    if (event.ingredients !== undefined) update.ingredients = event.ingredients;
    if (event.nutrition !== undefined) update.nutrition = event.nutrition;
    if (event.tags !== undefined) update.tags = event.tags;
    if (event.categoryId !== undefined) update.categoryId = event.categoryId;
    await dishes.doc(exist.data[0]._id).update({ data: update });
    return { ok: true };
  }

  if (action === 'delete') {
    if (!event.id) return { ok: false, message: '缺少菜品ID' };
    const exist = await dishes.where({ id: event.id }).get();
    if (!exist.data.length) return { ok: false, message: '菜品不存在' };
    await dishes.doc(exist.data[0]._id).remove();
    return { ok: true };
  }

  return { ok: false, message: '未知操作' };
};
