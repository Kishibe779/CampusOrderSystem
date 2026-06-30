const api = require('../../utils/api');
const { requireLogin } = require('../../utils/role');

Page({
  onLoad(query) {
    if (!requireLogin()) return;
    this.setData({ orderId: query.id });
  },

  data: {
    orderId: '',
    rating: 5,
    content: '',
    images: [],
    uploading: false
  },

  onStar(event) {
    this.setData({ rating: Number(event.currentTarget.dataset.value) });
  },

  onContent(event) {
    this.setData({ content: event.detail.value });
  },

  chooseImage() {
    const max = 3 - this.data.images.length;
    if (max <= 0) {
      wx.showToast({ title: '最多上传3张', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: max,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ uploading: true });
        const tasks = res.tempFilePaths.map((path) => {
          const name = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.jpg';
          return wx.cloud.uploadFile({
            cloudPath: 'reviews/' + name,
            filePath: path
          });
        });
        Promise.all(tasks).then((results) => {
          this.setData({
            images: this.data.images.concat(results.map((r) => r.fileID)),
            uploading: false
          });
        }).catch(() => {
          wx.showToast({ title: '图片上传失败', icon: 'none' });
          this.setData({ uploading: false });
        });
      }
    });
  },

  removeImage(event) {
    const index = event.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  submit() {
    wx.showLoading({ title: '提交评价' });
    api.submitReview({
      orderId: this.data.orderId,
      rating: this.data.rating,
      content: this.data.content,
      images: this.data.images
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '感谢评价' });
      wx.navigateBack();
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    });
  }
});
