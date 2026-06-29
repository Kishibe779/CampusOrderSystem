const api = require('../../utils/api');

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

Page({
  data: {
    categories: [],
    dishes: [],
    activeCategory: 'all',
    keyword: '',
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    if (!getApp().globalData.user) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
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
      const dishes = (reset ? res.dishes : this.data.dishes.concat(res.dishes)).map(enrichDish);
      this.setData({
        categories: res.categories,
        dishes,
        page: page + 1,
        hasMore: res.hasMore,
        loading: false
      });
    });
  },

  onKeyword(event) {
    this.setData({ keyword: event.detail.value });
  },

  changeCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.id }, () => this.refresh());
  },

  addCart(event) {
    const id = event.currentTarget.dataset.id;
    const dish = this.data.dishes.find((item) => item.id === id);
    const app = getApp();
    const cart = app.globalData.cart || [];
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...dish, quantity: 1 });
    app.setCart(cart);
    wx.showToast({ title: '已加入购物车' });
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}` });
  },

  goGroup() {
    wx.navigateTo({ url: '/pages/group/group' });
  }
});
