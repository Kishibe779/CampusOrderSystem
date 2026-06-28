const api = require('../../utils/api');

Page({
  data: {
    dish: null
  },

  onLoad(query) {
    api.getDish(query.id).then((dish) => {
      this.setData({ dish });
    });
  },

  addCart() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    const existing = cart.find((item) => item.id === this.data.dish.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...this.data.dish, quantity: 1 });
    app.persist('cart', cart);
    wx.showToast({ title: '已加入购物车' });
  }
});
