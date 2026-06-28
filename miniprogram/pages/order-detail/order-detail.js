const api = require('../../utils/api');
const { statusText } = require('../../utils/format');
const { createReceiptText } = require('../../utils/orderLogic');

Page({
  data: {
    id: '',
    order: null,
    receipt: '',
    statusLabel: ''
  },

  onLoad(query) {
    this.setData({ id: query.id });
  },

  onShow() {
    api.getOrder(this.data.id).then((order) => {
      this.setData({
        order,
        receipt: order ? createReceiptText(order) : '',
        statusLabel: order ? statusText(order.status) : ''
      });
    });
  },

  confirmReceive() {
    api.updateOrderStatus(this.data.order.id, 'completed').then(() => {
      wx.showToast({ title: '已确认收货' });
      this.onShow();
    });
  },

  goReview() {
    wx.navigateTo({ url: `/pages/review/review?id=${this.data.order.id}` });
  }
});
