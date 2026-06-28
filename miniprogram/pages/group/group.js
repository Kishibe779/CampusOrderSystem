const api = require('../../utils/api');

Page({
  data: {
    packages: [
      { name: '盒饭A', price: 22, desc: '两荤一素，适合培训班' },
      { name: '桌餐B', price: 45, desc: '八菜一汤，适合来访接待' }
    ],
    form: {
      orgName: '',
      peopleCount: '',
      date: '',
      time: '',
      note: '',
      packageName: '盒饭A'
    }
  },

  onInput(event) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  onDate(event) {
    this.setData({ 'form.date': event.detail.value });
  },

  onTime(event) {
    this.setData({ 'form.time': event.detail.value });
  },

  selectPackage(event) {
    this.setData({ 'form.packageName': event.currentTarget.dataset.name });
  },

  submit() {
    const pkg = this.data.packages.find((item) => item.name === this.data.form.packageName);
    const count = Number(this.data.form.peopleCount || 0);
    if (!this.data.form.orgName || !count || !this.data.form.date || !this.data.form.time) {
      wx.showToast({ title: '请补全团餐信息', icon: 'none' });
      return;
    }
    api.placeOrder({
      orderType: 'group',
      mealTime: `${this.data.form.date} ${this.data.form.time}`,
      groupInfo: this.data.form,
      items: [{ id: 'group-package', name: pkg.name, price: pkg.price, quantity: count }],
      payNow: true
    }).then((res) => {
      wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${res.order.id}` });
    });
  }
});
