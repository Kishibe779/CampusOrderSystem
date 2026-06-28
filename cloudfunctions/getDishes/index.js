const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const page = Number(event.page || 1);
  const pageSize = Number(event.pageSize || 8);
  const where = { onSale: _.neq(false) };
  if (event.categoryId && event.categoryId !== 'all') where.categoryId = event.categoryId;
  if (event.keyword) where.name = db.RegExp({ regexp: event.keyword, options: 'i' });

  const [categories, dishes] = await Promise.all([
    db.collection('categories').orderBy('sort', 'asc').get(),
    db.collection('dishes').where(where).skip((page - 1) * pageSize).limit(pageSize + 1).get()
  ]);

  return {
    ok: true,
    categories: [{ id: 'all', name: '全部' }].concat(categories.data),
    dishes: dishes.data.slice(0, pageSize),
    hasMore: dishes.data.length > pageSize
  };
};
