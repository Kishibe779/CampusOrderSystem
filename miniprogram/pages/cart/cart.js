const { calculateCartTotal } = require('../../utils/orderLogic');

Page({
  data: {
    cart: [],
    summary: { amount: 0, count: 0 }
  },

  onShow() {
    this.sync();
  },

  sync() {
    const cart = getApp().globalData.cart || [];
    this.setData({ cart, summary: calculateCartTotal(cart) });
  },

  save(cart) {
    getApp().setCart(cart);
    this.sync();
  },

  plus(event) {
    const cart = this.data.cart.map((item) => item.id === event.currentTarget.dataset.id ? { ...item, quantity: item.quantity + 1 } : item);
    this.save(cart);
  },

  minus(event) {
    const cart = this.data.cart
      .map((item) => item.id === event.currentTarget.dataset.id ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0);
    this.save(cart);
  },

  checkout() {
    wx.navigateTo({ url: '/pages/checkout/checkout' });
  }
});
