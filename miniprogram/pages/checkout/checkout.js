const api = require('../../utils/api');
const { calculateCartTotal } = require('../../utils/orderLogic');
const { requireLogin } = require('../../utils/role');

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
    if (!requireLogin()) return;
    const localCart = getApp().globalData.cart || [];
    // 如果本地购物车为空，尝试从云端加载
    const loadCart = localCart.length
      ? Promise.resolve(localCart)
      : api.getCart();
    Promise.all([loadCart, api.getAddresses()]).then(([cart, addresses]) => {
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
    wx.showLoading({ title: '提交订单' });
    api.placeOrder({
      orderType: this.data.orderType,
      mealTime: this.data.mealTime,
      address: this.data.orderType === 'delivery' ? this.data.selectedAddress : null,
      items: this.data.cart
    }).then((res) => {
      if (!res.ok) {
        wx.hideLoading();
        wx.showToast({ title: res.message, icon: 'none' });
        return;
      }
      // 订单创建成功，调支付
      wx.showLoading({ title: '支付中' });
      api.payOrder(res.order.id).then((payRes) => {
        wx.hideLoading();
        if (!payRes.ok) {
          wx.showToast({ title: payRes.message, icon: 'none' });
          return;
        }
        wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${payRes.order.id}` });
      });
    });
  }
});
