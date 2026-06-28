const api = require('../../utils/api');
const { calculateCartTotal } = require('../../utils/orderLogic');

Page({
  data: {
    cart: [],
    summary: { amount: 0, count: 0 },
    orderType: 'pickup',
    mealTime: '',
    addresses: [],
    addressOptions: [],
    selectedAddress: null
  },

  onShow() {
    const cart = getApp().globalData.cart || [];
    api.getAddresses().then((addresses) => {
      this.setData({
        cart,
        summary: calculateCartTotal(cart),
        addresses,
        addressOptions: addresses.map((item) => item.detail),
        selectedAddress: addresses.find((item) => item.isDefault) || addresses[0] || null
      });
    });
  },

  onTypeChange(event) {
    this.setData({ orderType: event.detail.value });
  },

  onTimeChange(event) {
    this.setData({ mealTime: event.detail.value });
  },

  onAddressChange(event) {
    this.setData({ selectedAddress: this.data.addresses[Number(event.detail.value)] });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  submit() {
    if (!this.data.cart.length) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    if (this.data.orderType === 'delivery' && !this.data.selectedAddress) {
      wx.showToast({ title: '请选择地址', icon: 'none' });
      return;
    }
    api.placeOrder({
      orderType: this.data.orderType,
      mealTime: this.data.mealTime,
      address: this.data.orderType === 'delivery' ? this.data.selectedAddress : null,
      items: this.data.cart,
      payNow: true
    }).then((res) => {
      if (!res.ok) {
        wx.showToast({ title: res.message, icon: 'none' });
        return;
      }
      wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${res.order.id}` });
    });
  }
});
