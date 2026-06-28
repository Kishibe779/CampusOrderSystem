const api = require('../../utils/api');
const { statusText } = require('../../utils/format');

Page({
  data: {
    status: 'all',
    orders: [],
    statusTextMap: {
      unpaid: statusText('unpaid'),
      paid: statusText('paid'),
      preparing: statusText('preparing'),
      ready: statusText('ready'),
      delivering: statusText('delivering'),
      picked: statusText('picked'),
      completed: statusText('completed'),
      cancelled: statusText('cancelled')
    },
    tabs: [
      { value: 'all', label: '全部' },
      { value: 'paid', label: '已支付' },
      { value: 'ready', label: '待取餐' },
      { value: 'delivering', label: '配送中' },
      { value: 'completed', label: '已完成' }
    ]
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    api.listOrders(this.data.status).then((orders) => this.setData({ orders }));
  },

  changeStatus(event) {
    this.setData({ status: event.currentTarget.dataset.value }, () => this.loadOrders());
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${event.currentTarget.dataset.id}` });
  }
});
