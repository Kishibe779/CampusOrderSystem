App({
  globalData: {
    user: null,
    cart: [],
    addresses: [],
    orders: []
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true });
    }
  },

  setCart(cart) {
    this.globalData.cart = cart;
  },

  setUser(user) {
    this.globalData.user = user;
  }
});
