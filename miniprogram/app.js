App({
  globalData: {
    user: null,
    cart: [],
    addresses: [],
    orders: []
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: wx.getStorageSync('cloudEnv') || '',
        traceUser: true
      });
    }
    this.globalData.user = wx.getStorageSync('user') || null;
    this.globalData.cart = wx.getStorageSync('cart') || [];
    this.globalData.addresses = wx.getStorageSync('addresses') || [];
    this.globalData.orders = wx.getStorageSync('orders') || [];
  },

  persist(key, value) {
    this.globalData[key] = value;
    wx.setStorageSync(key, value);
  }
});
