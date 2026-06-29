const api = require('../../utils/api');
const { calculateCartTotal } = require('../../utils/orderLogic');
const { requireLogin } = require('../../utils/role');

Page({
  data: {
    cart: [],
    summary: { amount: 0, count: 0 }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    if (!requireLogin()) return;
    // 优先从云端加载购物车
    api.getCart().then((items) => {
      this.setData({ cart: items, summary: calculateCartTotal(items) });
    }).catch(() => {
      // 降级到本地
      this.sync();
    });
  },

  sync() {
    const cart = getApp().globalData.cart || [];
    this.setData({ cart, summary: calculateCartTotal(cart) });
  },

  saveAndSync(cart) {
    getApp().setCart(cart);
    api.syncCart(cart);
    this.setData({ cart, summary: calculateCartTotal(cart) });
  },

  plus(event) {
    const cart = this.data.cart.map((item) =>
      item.id === event.currentTarget.dataset.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    this.saveAndSync(cart);
  },

  minus(event) {
    const cart = this.data.cart
      .map((item) =>
        item.id === event.currentTarget.dataset.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);
    this.saveAndSync(cart);
  },

  checkout() {
    wx.navigateTo({ url: '/pages/checkout/checkout' });
  }
});
