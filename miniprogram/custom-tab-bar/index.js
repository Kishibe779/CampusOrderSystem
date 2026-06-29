Component({
  data: {
    selected: 0,
    cartCount: 0,
    list: [
      { pagePath: '/pages/index/index', text: '点餐', icon: '🍽️' },
      { pagePath: '/pages/cart/cart', text: '购物车', icon: '🛒' },
      { pagePath: '/pages/orders/orders', text: '订单', icon: '📋' },
      { pagePath: '/pages/admin/admin', text: '管理', icon: '⚙️' }
    ]
  },

  attached() {
    this.updateCartCount();
  },

  pageLifetimes: {
    show() {
      this.updateCartCount();
    }
  },

  methods: {
    updateCartCount() {
      var cart = getApp().globalData.cart || [];
      var count = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      this.setData({ cartCount: count });
    },

    switchTab(e) {
      var index = e.currentTarget.dataset.index;
      var item = this.data.list[index];
      wx.switchTab({ url: item.pagePath });
    }
  }
});
