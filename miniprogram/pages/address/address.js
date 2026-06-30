const api = require('../../utils/api');
const { requireLogin } = require('../../utils/role');

Page({
  data: {
    addresses: [],
    form: { name: '', phone: '', detail: '', isDefault: true }
  },

  onShow() {
    if (!requireLogin()) return;
    api.getAddresses().then(function (addresses) {
      this.setData({ addresses: addresses });
    }.bind(this));
  },

  onInput(event) {
    var field = event.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: event.detail.value });
  },

  toggleDefault() {
    this.setData({ 'form.isDefault': !this.data.form.isDefault });
  },

  edit(event) {
    var address = this.data.addresses.find(function (item) {
      return (item._id || item.id) === event.currentTarget.dataset.id;
    });
    if (!address) return;
    this.setData({
      form: {
        _id: address._id || address.id,
        name: address.name,
        phone: address.phone,
        detail: address.detail,
        isDefault: address.isDefault
      }
    });
  },

  save() {
    if (!this.data.form.name || !this.data.form.phone || !this.data.form.detail) {
      wx.showToast({ title: '请补全地址', icon: 'none' });
      return;
    }
    var that = this;
    api.saveAddress(this.data.form).then(function (res) {
      that.setData({
        addresses: res.addresses,
        form: { name: '', phone: '', detail: '', isDefault: false }
      });
      wx.showToast({ title: '已保存' });
    });
  }
});
