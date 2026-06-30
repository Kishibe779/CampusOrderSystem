const api = require('../../utils/api');
const { statusText } = require('../../utils/format');
const { createReceiptText } = require('../../utils/orderLogic');
const { requireLogin } = require('../../utils/role');

function getSteps(order) {
  var isDelivery = order.orderType === 'delivery' || (order.orderType === 'group' && order.address);
  if (isDelivery) {
    return [
      { status: 'paid', label: '已支付' },
      { status: 'preparing', label: '备餐中' },
      { status: 'ready', label: '已出餐' },
      { status: 'delivering', label: '配送中' },
      { status: 'delivered', label: '已送达' },
      { status: 'completed', label: '已完成' }
    ];
  }
  return [
    { status: 'paid', label: '已支付' },
    { status: 'preparing', label: '备餐中' },
    { status: 'ready', label: '待取餐' },
    { status: 'picked', label: '已取餐' },
    { status: 'completed', label: '已完成' }
  ];
}

Page({
  data: {
    id: '',
    order: null,
    receipt: '',
    statusLabel: '',
    steps: [],
    activeStep: -1,
    showProgress: false
  },

  onLoad(query) {
    if (!requireLogin()) return;
    this.setData({ id: query.id });
  },

  onShow() {
    var that = this;
    api.getOrder(this.data.id).then(function (order) {
      if (!order) return;
      var steps = getSteps(order);
      var activeStep = -1;
      for (var i = steps.length - 1; i >= 0; i--) {
        if (steps[i].status === order.status) { activeStep = i; break; }
      }
      var showProgress = order.status !== 'unpaid' && order.status !== 'cancelled';
      var isDelivery = order.orderType === 'delivery' || (order.orderType === 'group' && order.address);
      var theme = isDelivery ? 'blue' : 'green';
      that.setData({
        order: order,
        receipt: createReceiptText(order),
        statusLabel: statusText(order.status),
        steps: steps,
        activeStep: activeStep,
        showProgress: showProgress,
        theme: theme
      });
    });
  },

  cancelOrder() {
    var that = this;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这笔订单吗？取消后不可恢复。',
      confirmColor: '#dc2626',
      success: function (res) {
        if (!res.confirm) return;
        api.updateOrderStatus(that.data.order.id, 'cancelled').then(function (result) {
          if (result.ok) {
            wx.showToast({ title: '订单已取消', icon: 'success' });
            that.onShow();
          }
        });
      }
    });
  },

  confirmReceive() {
    var that = this;
    api.updateOrderStatus(this.data.order.id, 'completed').then(function () {
      var msg = that.data.order.orderType === 'delivery' ? '已确认收货' : '已确认取餐';
      wx.showToast({ title: msg });
      that.onShow();
    });
  },

  goReview() {
    wx.navigateTo({ url: '/pages/review/review?id=' + this.data.order.id });
  }
});
