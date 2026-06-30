const api = require('../../utils/api');
const { requireLogin } = require('../../utils/role');

Page({
  onLoad() {
    requireLogin();
  },
  data: {
    packages: [
      { name: '盒饭A', price: 22, desc: '两荤一素，适合培训班' },
      { name: '桌餐B', price: 45, desc: '八菜一汤，适合来访接待' }
    ],
    orderType: 'pickup',
    form: {
      orgName: '',
      peopleCount: '',
      date: '',
      time: '',
      note: '',
      packageName: '盒饭A',
      address: '',
      phone: ''
    }
  },

  onInput(event) {
    this.setData({ ['form.' + event.currentTarget.dataset.field]: event.detail.value });
  },

  onDate(event) { this.setData({ 'form.date': event.detail.value }); },
  onTime(event) { this.setData({ 'form.time': event.detail.value }); },

  onTypeChange(event) {
    this.setData({ orderType: event.detail.value });
  },

  selectPackage(event) {
    this.setData({ 'form.packageName': event.detail.value });
  },

  submit() {
    var pkg = this.data.packages.find(function (item) { return item.name === this.data.form.packageName; }.bind(this));
    var count = Number(this.data.form.peopleCount || 0);
    if (!this.data.form.orgName || !count || !this.data.form.date || !this.data.form.time) {
      wx.showToast({ title: '请补全团餐信息', icon: 'none' });
      return;
    }
    if (this.data.orderType === 'delivery' && !this.data.form.address) {
      wx.showToast({ title: '配送需填写地址', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '提交团餐订单' });

    var address = null;
    if (this.data.orderType === 'delivery') {
      address = {
        name: this.data.form.orgName,
        phone: this.data.form.phone || '未填写',
        detail: this.data.form.address
      };
    }

    api.placeOrder({
      orderType: 'group',
      mealTime: this.data.form.date + ' ' + this.data.form.time,
      groupInfo: this.data.form,
      address: address,
      items: [{ id: 'group-package', name: pkg.name, price: pkg.price, quantity: count }]
    }).then(function (res) {
      if (!res.ok) { wx.hideLoading(); wx.showToast({ title: res.message, icon: 'none' }); return; }
      wx.showLoading({ title: '支付中' });
      api.payOrder(res.order.id).then(function (payRes) {
        wx.hideLoading();
        if (!payRes.ok) { wx.showToast({ title: payRes.message, icon: 'none' }); return; }
        wx.redirectTo({ url: '/pages/order-detail/order-detail?id=' + payRes.order.id });
      });
    });
  }
});
