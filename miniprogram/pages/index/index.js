const api = require('../../utils/api');
const { requireLogin, getRole } = require('../../utils/role');

const DISH_STYLE = {
  d1: { emoji: '🍳', bg: 'linear-gradient(135deg, #fef3c7, #f59e0b)' },
  d2: { emoji: '🍗', bg: 'linear-gradient(135deg, #fce7f3, #ec4899)' },
  d3: { emoji: '🥗', bg: 'linear-gradient(135deg, #d1fae5, #10b981)' },
  d4: { emoji: '🥤', bg: 'linear-gradient(135deg, #dbeafe, #3b82f6)' },
  d5: { emoji: '🐟', bg: 'linear-gradient(135deg, #fee2e2, #ef4444)' },
  d6: { emoji: '🍱', bg: 'linear-gradient(135deg, #ede9fe, #8b5cf6)' }
};

function enrichDish(dish) {
  const style = DISH_STYLE[dish.id] || { emoji: '🍽️', bg: 'linear-gradient(135deg, #f1d59b, #e57f47)' };
  return { ...dish, emoji: style.emoji, bg: style.bg };
}

function mergeCartQty(dishes) {
  var cart = getApp().globalData.cart || [];
  var cartMap = {};
  cart.forEach(function (item) { cartMap[item.id] = item.quantity; });
  return dishes.map(function (dish) {
    return Object.assign({}, dish, { cartQty: cartMap[dish.id] || 0 });
  });
}

Page({
  data: {
    role: '',
    categories: [],
    dishes: [],
    activeCategory: 'all',
    keyword: '',
    page: 1,
    hasMore: true,
    loading: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    // 从其他页面回来时刷新购物车数量
    this.syncCartQty();
  },

  onLoad() {
    if (!requireLogin()) return;
    this.setData({ role: getRole() });
    var cache = getApp().globalData.homeCache;
    if (!cache || Date.now() - cache.time >= 5 * 60 * 1000) {
      try {
        var stored = wx.getStorageSync('homeCache');
        if (stored && Date.now() - stored.time < 5 * 60 * 1000) {
          cache = stored;
          getApp().globalData.homeCache = cache;
        }
      } catch (e) { /* ignore */ }
    }
    if (cache && Date.now() - cache.time < 5 * 60 * 1000) {
      this.setData({
        categories: cache.categories,
        dishes: mergeCartQty(cache.dishes.map(enrichDish))
      });
    }
    this.loadDishes(true);
  },

  onPullDownRefresh() {
    this.refresh().finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadDishes(false);
    }
  },

  refresh() {
    return this.loadDishes(true);
  },

  loadDishes(reset) {
    const page = reset ? 1 : this.data.page;
    this.setData({ loading: true });
    return api.getDishes({
      categoryId: this.data.activeCategory,
      keyword: this.data.keyword,
      page
    }).then((res) => {
      if (!res || !res.ok) {
        this.setData({ loading: false });
        return;
      }
      var dishes = (reset ? res.dishes : this.data.dishes.concat(res.dishes)).map(enrichDish);
      dishes = mergeCartQty(dishes);
      if (reset && !this.data.keyword && this.data.activeCategory === 'all') {
        var cacheData = { categories: res.categories, dishes: res.dishes, time: Date.now() };
        getApp().globalData.homeCache = cacheData;
        wx.setStorageSync('homeCache', cacheData);
      }
      this.setData({
        categories: res.categories,
        dishes: dishes,
        page: page + 1,
        hasMore: res.hasMore,
        loading: false
      });
    });
  },

  syncCartQty() {
    this.setData({ dishes: mergeCartQty(this.data.dishes) });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateCartCount();
    }
  },

  onKeyword(event) {
    this.setData({ keyword: event.detail.value });
  },

  changeCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.id }, () => this.refresh());
  },

  addCart(e) {
    var id = e.currentTarget.dataset.id;
    var dish = this.data.dishes.find(function (item) { return item.id === id; });
    var app = getApp();
    var cart = app.globalData.cart || [];
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) existing.quantity += 1;
    else cart.push({ id: dish.id, name: dish.name, price: dish.price, quantity: 1 });
    app.setCart(cart);
    api.syncCart(cart);
    this.syncCartQty();
  },

  minusCart(e) {
    var id = e.currentTarget.dataset.id;
    var app = getApp();
    var cart = (app.globalData.cart || []).map(function (item) {
      return item.id === id ? Object.assign({}, item, { quantity: item.quantity - 1 }) : item;
    }).filter(function (item) { return item.quantity > 0; });
    app.setCart(cart);
    api.syncCart(cart);
    this.syncCartQty();
  },

  goDetail(event) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + event.currentTarget.dataset.id });
  },

  goGroup() {
    wx.navigateTo({ url: '/pages/group/group' });
  }
});
