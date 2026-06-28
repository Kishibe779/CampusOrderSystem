const api = require('../../utils/api');
const seed = require('../../utils/seed');

Page({
  data: {
    code: '',
    orders: [],
    dishes: seed.dishes,
    stats: { orderCount: 0, amount: 0, pickupCount: 0 }
  },

  onShow() {
    this.load();
  },

  load() {
    api.listOrders('all').then((orders) => {
      const amount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0).toFixed(2);
      const pickupCount = orders.filter((order) => ['ready', 'picked'].includes(order.status)).length;
      this.setData({ orders, stats: { orderCount: orders.length, amount, pickupCount } });
    });
  },

  onCode(event) {
    this.setData({ code: event.detail.value });
  },

  verify() {
    api.verifyPickupCode(this.data.code).then((res) => {
      wx.showToast({ title: res.ok ? '核销成功' : res.message, icon: res.ok ? 'success' : 'none' });
      this.load();
    });
  },

  changeStatus(event) {
    api.updateOrderStatus(event.currentTarget.dataset.id, event.currentTarget.dataset.status).then(() => {
      wx.showToast({ title: '状态已更新' });
      this.load();
    });
  }
});
