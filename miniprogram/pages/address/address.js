const api = require('../../utils/api');

Page({
  data: {
    addresses: [],
    form: { name: '', phone: '', detail: '', isDefault: true }
  },

  onShow() {
    api.getAddresses().then((addresses) => this.setData({ addresses }));
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  toggleDefault() {
    this.setData({ 'form.isDefault': !this.data.form.isDefault });
  },

  edit(event) {
    const address = this.data.addresses.find((item) => item.id === event.currentTarget.dataset.id);
    this.setData({ form: { ...address } });
  },

  save() {
    if (!this.data.form.name || !this.data.form.phone || !this.data.form.detail) {
      wx.showToast({ title: '请补全地址', icon: 'none' });
      return;
    }
    api.saveAddress(this.data.form).then((res) => {
      this.setData({ addresses: res.addresses, form: { name: '', phone: '', detail: '', isDefault: false } });
      wx.showToast({ title: '已保存' });
    });
  }
});
