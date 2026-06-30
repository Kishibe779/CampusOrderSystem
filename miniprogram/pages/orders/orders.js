const api = require('../../utils/api');
const { statusText } = require('../../utils/format');
const { requireLogin, getRoleName } = require('../../utils/role');

Page({
  data: {
    user: null,
    roleName: '',
    status: 'all',
    orders: [],
    statusTextMap: {
      unpaid: statusText('unpaid'),
      paid: statusText('paid'),
      preparing: statusText('preparing'),
      ready: statusText('ready'),
      delivering: statusText('delivering'),
      delivered: statusText('delivered'),
      picked: statusText('picked'),
      completed: statusText('completed'),
      cancelled: statusText('cancelled')
    },
    tabs: [
      { value: 'all', label: '全部' },
      { value: 'unpaid', label: '待支付' },
      { value: 'paid', label: '已支付' },
      { value: 'ready', label: '待取餐' },
      { value: 'delivering', label: '配送中' },
      { value: 'picked', label: '已取餐' },
      { value: 'completed', label: '已完成' }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    if (!requireLogin()) return;
    const user = getApp().globalData.user;
    this.setData({ user, roleName: getRoleName() });
    this.loadOrders();
    this.startAutoRefresh();
  },

  onHide() { this.stopAutoRefresh(); },
  onUnload() { this.stopAutoRefresh(); },

  onPullDownRefresh() {
    this.loadOrders().finally(function () { wx.stopPullDownRefresh(); });
  },

  startAutoRefresh() {
    var that = this;
    this.stopAutoRefresh();
    this._timer = setInterval(function () { that.loadOrders(); }, 15000);
  },

  stopAutoRefresh() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  loadOrders() {
    api.listOrders(this.data.status).then((orders) => this.setData({ orders }));
  },

  changeStatus(event) {
    this.setData({ status: event.currentTarget.dataset.value }, () => this.loadOrders());
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${event.currentTarget.dataset.id}` });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后需重新登录，确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          getApp().logout();
        }
      }
    });
  }
});
