const api = require('../../utils/api');
const { requireRole } = require('../../utils/role');
const { statusText } = require('../../utils/format');

function getActions(order) {
  var actions = [];
  var s = order.status;
  var t = order.orderType;
  var isDelivery = t === 'delivery' || (t === 'group' && order.address);
  if (s === 'paid') actions.push({ status: 'preparing', label: '备餐' });
  if (s === 'preparing') actions.push({ status: 'ready', label: '出餐' });
  if (s === 'ready' && isDelivery) actions.push({ status: 'delivering', label: '配送' });
  if (s === 'delivering' && isDelivery) actions.push({ status: 'delivered', label: '送达' });
  return actions;
}

Page({
  data: {
    code: '',
    orders: [],
    dishes: [],
    stats: { orderCount: 0, amount: 0, pickupCount: 0 },
    showDishForm: false,
    dishForm: { id: '', name: '', price: '', stock: '', categoryId: 'hot', desc: '', ingredients: '', nutrition: '', image: '' },
    editingDish: false,
    uploading: false,
    categories: [
      { id: 'hot', name: '热销' },
      { id: 'set', name: '套餐' },
      { id: 'light', name: '轻食' },
      { id: 'drink', name: '饮品' }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    if (!requireRole(['admin'])) return;
    this.load();
    this.startAutoRefresh();
  },

  onHide() {
    this.stopAutoRefresh();
  },

  onUnload() {
    this.stopAutoRefresh();
  },

  onPullDownRefresh() {
    this.load().finally(function () { wx.stopPullDownRefresh(); });
  },

  startAutoRefresh() {
    var that = this;
    this.stopAutoRefresh();
    this._timer = setInterval(function () { that.load(); }, 15000);
  },

  stopAutoRefresh() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  load() {
    var that = this;
    Promise.all([api.listOrders('all'), api.getDishes({ pageSize: 99 })]).then(function (results) {
      var orders = results[0];
      var dishesRes = results[1];
      var amount = orders.reduce(function (s, o) { return s + Number(o.totalAmount || 0); }, 0).toFixed(2);
      var pickupCount = orders.filter(function (o) { return o.status === 'ready' || o.status === 'picked'; }).length;
      var ordersWithLabel = orders.map(function (o) {
        return {
          id: o._id || o.id,
          orderNo: o.orderNo,
          orderType: o.orderType,
          status: o.status,
          statusLabel: statusText(o.status),
          summary: o.summary,
          actions: getActions(o)
        };
      });
      that.setData({
        orders: ordersWithLabel,
        dishes: dishesRes.dishes || [],
        stats: { orderCount: orders.length, amount: amount, pickupCount: pickupCount }
      });
    });
  },

  onCode(event) { this.setData({ code: event.detail.value }); },

  verify() {
    var that = this;
    api.verifyPickupCode(this.data.code).then(function (res) {
      wx.showToast({ title: res.ok ? '核销成功' : res.message, icon: res.ok ? 'success' : 'none' });
      if (res.ok) that.setData({ code: '' });
      that.load();
    });
  },

  changeStatus(event) {
    var that = this;
    api.updateOrderStatus(event.currentTarget.dataset.id, event.currentTarget.dataset.status).then(function () {
      wx.showToast({ title: '状态已更新' });
      that.load();
    });
  },

  toggleDish(event) {
    var id = event.currentTarget.dataset.id;
    var onSale = event.detail.value;
    api.toggleDish(id, onSale).then(function () {
      this.load();
    }.bind(this));
  },

  // ====== 菜品管理 ======

  addDish() {
    this.setData({
      showDishForm: true,
      editingDish: false,
      dishForm: { id: '', name: '', price: '', stock: '', categoryId: 'hot', desc: '', ingredients: '', nutrition: '', image: '' }
    });
  },

  editDish(event) {
    var dish = this.data.dishes.find(function (d) { return d.id === event.currentTarget.dataset.id; });
    if (!dish) return;
    this.setData({
      showDishForm: true,
      editingDish: true,
      dishForm: {
        id: dish.id,
        name: dish.name,
        price: String(dish.price),
        stock: String(dish.stock || 0),
        categoryId: dish.categoryId || 'hot',
        desc: dish.desc || '',
        ingredients: dish.ingredients || '',
        nutrition: dish.nutrition || '',
        image: dish.image || ''
      }
    });
  },

  deleteDish(event) {
    var id = event.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '删除菜品',
      content: '确定删除该菜品吗？此操作不可恢复。',
      confirmColor: '#dc2626',
      success: function (res) {
        if (!res.confirm) return;
        api.manageDish({ action: 'delete', id: id }).then(function () {
          wx.showToast({ title: '已删除' });
          that.load();
        });
      }
    });
  },

  onDishField(event) {
    var field = event.currentTarget.dataset.field;
    var value = event.detail.value !== undefined ? event.detail.value : event.currentTarget.dataset.value;
    var obj = {};
    obj['dishForm.' + field] = value;
    this.setData(obj);
  },

  chooseDishImage() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({ uploading: true });
        api.uploadDishImage(res.tempFilePaths[0]).then(function (result) {
          that.setData({ 'dishForm.image': result.fileID, uploading: false });
          wx.showToast({ title: '图片已上传', icon: 'success' });
        }).catch(function () {
          that.setData({ uploading: false });
          wx.showToast({ title: '上传失败', icon: 'none' });
        });
      }
    });
  },

  submitDish() {
    var form = this.data.dishForm;
    if (!form.name || !form.price) {
      wx.showToast({ title: '名称和价格必填', icon: 'none' });
      return;
    }
    var action = this.data.editingDish ? 'update' : 'add';
    var that = this;
    api.manageDish({
      action: action,
      id: form.id,
      name: form.name,
      price: form.price,
      stock: form.stock,
      categoryId: form.categoryId,
      desc: form.desc,
      ingredients: form.ingredients,
      nutrition: form.nutrition,
      image: form.image
    }).then(function (res) {
      if (res.ok) {
        wx.showToast({ title: action === 'add' ? '添加成功' : '已更新', icon: 'success' });
        that.setData({ showDishForm: false });
        that.load();
      } else {
        wx.showToast({ title: res.message, icon: 'none' });
      }
    });
  },

  closeForm() {
    this.setData({ showDishForm: false });
  }
});
