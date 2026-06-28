const categories = [
  { id: 'all', name: '全部' },
  { id: 'hot', name: '热销' },
  { id: 'set', name: '套餐' },
  { id: 'light', name: '轻食' },
  { id: 'drink', name: '饮品' }
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
    image: '/assets/dish-tomato.svg',
    desc: '现炒番茄鸡蛋配米饭，酸甜开胃，适合午餐快速取餐。',
    ingredients: '番茄、鸡蛋、米饭、青菜',
    nutrition: '蛋白质约18g，热量约520kcal',
    tags: ['热销', '快取']
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
    image: '/assets/dish-chicken.svg',
    desc: '鸡排外酥里嫩，配黑椒汁和时蔬，适合高能量午餐。',
    ingredients: '鸡腿肉、黑椒汁、米饭、西兰花',
    nutrition: '蛋白质约32g，热量约680kcal',
    tags: ['套餐', '高蛋白']
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
    image: '/assets/dish-salad.svg',
    desc: '鸡胸肉、玉米、番茄和生菜，支持健身轻食需求。',
    ingredients: '鸡胸肉、生菜、玉米、小番茄',
    nutrition: '蛋白质约29g，热量约360kcal',
    tags: ['轻食', '低脂']
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
    image: '/assets/dish-drink.svg',
    desc: '食堂自制酸梅汤，支持与套餐一起下单。',
    ingredients: '乌梅、山楂、桂花、冰糖',
    nutrition: '热量约120kcal',
    tags: ['饮品', '解腻']
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
    image: '/assets/dish-rice.svg',
    desc: '经典下饭菜，支持预约自取和送餐。',
    ingredients: '猪里脊、木耳、胡萝卜、米饭',
    nutrition: '蛋白质约24g，热量约610kcal',
    tags: ['热销', '预约']
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
    image: '/assets/dish-set.svg',
    desc: '两荤一素一汤，可配送到办公楼。',
    ingredients: '当日荤菜、素菜、例汤、米饭',
    nutrition: '热量约720kcal',
    tags: ['送餐', '工作餐']
  }
];

const addresses = [
  {
    id: 'a1',
    name: '张同学',
    phone: '13800000001',
    detail: '江苏科技大学张家港校区 3号宿舍楼 508',
    isDefault: true
  }
];

module.exports = {
  categories,
  dishes,
  addresses
};
