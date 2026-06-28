const api = require('../../utils/api');

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
    if (!wx.getStorageSync('user')) {
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
      const dishes = reset ? res.dishes : this.data.dishes.concat(res.dishes);
      wx.setStorageSync('homeCache', { categories: res.categories, dishes, cachedAt: Date.now() });
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
    app.persist('cart', cart);
    wx.showToast({ title: '已加入购物车' });
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}` });
  },

  goGroup() {
    wx.navigateTo({ url: '/pages/group/group' });
  }
});
