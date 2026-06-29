const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const COLLECTIONS = [
  'users',
  'categories',
  'dishes',
  'carts',
  'addresses',
  'orders',
  'pickup_codes',
  'reviews'
];

const categories = [
  { id: 'hot', name: '🔥 热销', sort: 1 },
  { id: 'set', name: '🍱 套餐', sort: 2 },
  { id: 'light', name: '🥗 轻食', sort: 3 },
  { id: 'drink', name: '🥤 饮品', sort: 4 }
];

const dishes = [
  {
    id: 'd1',
    categoryId: 'hot',
    name: '番茄炒蛋套餐',
    initial: '蛋',
    price: 12.8,
    stock: 48,
    rating: 4.8,
    sales: 328,
    image: '',
    desc: '现炒番茄鸡蛋配米饭，酸甜开胃，适合午餐快速取餐。',
    ingredients: '番茄、鸡蛋、米饭、青菜',
    nutrition: '蛋白质约18g，热量约520kcal',
    tags: ['热销', '快取'],
    onSale: true
  },
  {
    id: 'd2',
    categoryId: 'set',
    name: '黑椒鸡排饭',
    initial: '鸡',
    price: 16.5,
    stock: 36,
    rating: 4.7,
    sales: 276,
    image: '',
    desc: '鸡排外酥里嫩，配黑椒汁和时蔬，适合高能量午餐。',
    ingredients: '鸡腿肉、黑椒汁、米饭、西兰花',
    nutrition: '蛋白质约32g，热量约680kcal',
    tags: ['套餐', '高蛋白'],
    onSale: true
  },
  {
    id: 'd3',
    categoryId: 'light',
    name: '低脂鸡胸沙拉',
    initial: '沙',
    price: 18,
    stock: 22,
    rating: 4.6,
    sales: 118,
    image: '',
    desc: '鸡胸肉、玉米、番茄和生菜，支持健身轻食需求。',
    ingredients: '鸡胸肉、生菜、玉米、小番茄',
    nutrition: '蛋白质约29g，热量约360kcal',
    tags: ['轻食', '低脂'],
    onSale: true
  },
  {
    id: 'd4',
    categoryId: 'drink',
    name: '桂花酸梅汤',
    initial: '饮',
    price: 5,
    stock: 80,
    rating: 4.9,
    sales: 451,
    image: '',
    desc: '食堂自制酸梅汤，支持与套餐一起下单。',
    ingredients: '乌梅、山楂、桂花、冰糖',
    nutrition: '热量约120kcal',
    tags: ['饮品', '解腻'],
    onSale: true
  },
  {
    id: 'd5',
    categoryId: 'hot',
    name: '鱼香肉丝盖饭',
    initial: '鱼',
    price: 14.5,
    stock: 31,
    rating: 4.5,
    sales: 203,
    image: '',
    desc: '经典下饭菜，支持预约自取和送餐。',
    ingredients: '猪里脊、木耳、胡萝卜、米饭',
    nutrition: '蛋白质约24g，热量约610kcal',
    tags: ['热销', '预约'],
    onSale: true
  },
  {
    id: 'd6',
    categoryId: 'set',
    name: '教师工作餐',
    initial: '餐',
    price: 20,
    stock: 25,
    rating: 4.8,
    sales: 96,
    image: '',
    desc: '两荤一素一汤，可配送到办公楼。',
    ingredients: '当日荤菜、素菜、例汤、米饭',
    nutrition: '热量约720kcal',
    tags: ['送餐', '工作餐'],
    onSale: true
  }
];

exports.main = async (event) => {
  const results = {
    collections: {},
    categories: {},
    dishes: {}
  };

  // Step 1: Create all collections
  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name);
      results.collections[name] = 'created';
    } catch (e) {
      results.collections[name] = e.errCode === -502005 ? 'already exists' : `error: ${e.message}`;
    }
  }

  // Step 2: Seed categories
  const catCheck = await db.collection('categories').count();
  if (catCheck.total === 0) {
    let catCount = 0;
    for (const cat of categories) {
      await db.collection('categories').add({ data: cat });
      catCount++;
    }
    results.categories = { seeded: catCount };
  } else {
    results.categories = { skipped: `already has ${catCheck.total} records` };
  }

  // Step 3: Seed dishes
  const dishCheck = await db.collection('dishes').count();
  if (dishCheck.total === 0) {
    let dishCount = 0;
    for (const dish of dishes) {
      await db.collection('dishes').add({ data: dish });
      dishCount++;
    }
    results.dishes = { seeded: dishCount };
  } else {
    results.dishes = { skipped: `already has ${dishCheck.total} records` };
  }

  // Note: addresses are user-private data, created via saveAddress cloud function

  return {
    ok: true,
    message: '数据库初始化完成',
    results
  };
};
