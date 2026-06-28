const api = require('../../utils/api');

Page({
  data: {
    orderId: '',
    rating: 5,
    content: ''
  },

  onLoad(query) {
    this.setData({ orderId: query.id });
  },

  onRating(event) {
    this.setData({ rating: event.detail.value });
  },

  onContent(event) {
    this.setData({ content: event.detail.value });
  },

  submit() {
    api.submitReview({ orderId: this.data.orderId, rating: this.data.rating, content: this.data.content }).then(() => {
      wx.showToast({ title: '感谢评价' });
      wx.navigateBack();
    });
  }
});
