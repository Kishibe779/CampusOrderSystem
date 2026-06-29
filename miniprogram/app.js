App({
  globalData: {
    user: null,
    cart: [],
    addresses: [],
    orders: [],
    homeCache: null
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
  },

  logout() {
    this.globalData.user = null;
    this.globalData.cart = [];
    this.globalData.addresses = [];
    this.globalData.orders = [];
    this.globalData.homeCache = null;
    wx.clearStorageSync();
    wx.reLaunch({ url: '/pages/login/login' });
  }
});
