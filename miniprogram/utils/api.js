const seed = require('./seed');
const logic = require('./orderLogic');

function app() {
  return getApp();
}

function getStoredOrders() {
  return wx.getStorageSync('orders') || [];
}

function saveOrders(orders) {
  wx.setStorageSync('orders', orders);
  app().globalData.orders = orders;
}

function summarizeItems(items) {
  return (items || []).map((item) => `${item.name}x${item.quantity}`).join('、');
}

function withSummary(order) {
  return order ? { ...order, summary: summarizeItems(order.items) } : order;
}

function callCloud(name, data, fallback) {
  if (wx.cloud && wx.getStorageSync('useCloud')) {
    return wx.cloud.callFunction({ name, data }).then((res) => res.result);
  }
  return Promise.resolve(fallback());
}

function login(profile) {
  return callCloud('login', { profile }, () => {
    const user = {
      openid: 'local-openid',
      role: profile && profile.role ? profile.role : 'student',
      nickName: profile && profile.nickName ? profile.nickName : '校园用户',
      avatarUrl: profile && profile.avatarUrl ? profile.avatarUrl : ''
    };
    wx.setStorageSync('user', user);
    app().globalData.user = user;
    return { ok: true, user };
  });
}

function getDishes({ categoryId = 'all', keyword = '', page = 1, pageSize = 4 } = {}) {
  return callCloud('getDishes', { categoryId, keyword, page, pageSize }, () => {
    let list = seed.dishes.filter((dish) => categoryId === 'all' || dish.categoryId === categoryId);
    if (keyword) {
      list = list.filter((dish) => dish.name.includes(keyword) || dish.tags.join(',').includes(keyword));
    }
    const start = (page - 1) * pageSize;
    const rows = list.slice(start, start + pageSize);
    return {
      ok: true,
      categories: seed.categories,
      dishes: rows,
      hasMore: start + pageSize < list.length
    };
  });
}

function getDish(id) {
  return Promise.resolve(seed.dishes.find((dish) => dish.id === id));
}

function getAddresses() {
  const stored = wx.getStorageSync('addresses');
  return Promise.resolve(stored && stored.length ? stored : seed.addresses);
}

function saveAddress(address) {
  const addresses = wx.getStorageSync('addresses') || seed.addresses;
  const next = address.id
    ? addresses.map((item) => (item.id === address.id ? address : item))
    : [{ ...address, id: `a${Date.now()}` }, ...addresses];
  if (address.isDefault) {
    next.forEach((item) => {
      if (item.id !== address.id) item.isDefault = false;
    });
  }
  wx.setStorageSync('addresses', next);
  return Promise.resolve({ ok: true, addresses: next });
}

function placeOrder(payload) {
  return callCloud('placeOrder', payload, () => {
    if (payload.orderType !== 'group') {
      const check = logic.validateStock(payload.items, seed.dishes);
      if (!check.ok) return check;
    }
    const total = logic.calculateCartTotal(payload.items).amount;
    const existingCodes = new Set(getStoredOrders().map((order) => order.pickupCode).filter(Boolean));
    const order = {
      id: `o${Date.now()}`,
      orderNo: logic.buildOrderNo(new Date()),
      userOpenid: 'local-openid',
      orderType: payload.orderType,
      mealTime: payload.mealTime || '',
      address: payload.address || null,
      groupInfo: payload.groupInfo || null,
      items: payload.items,
      totalAmount: total,
      summary: summarizeItems(payload.items),
      status: payload.payNow === false ? 'unpaid' : 'paid',
      pickupCode: payload.orderType === 'delivery' ? '' : logic.generatePickupCode(existingCodes),
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'paid', text: '支付成功，订单已生成' },
        { status: 'preparing', text: '食堂备餐中' },
        { status: payload.orderType === 'delivery' ? 'delivering' : 'ready', text: payload.orderType === 'delivery' ? '等待配送' : '等待取餐' }
      ]
    };
    const orders = [order, ...getStoredOrders()];
    saveOrders(orders);
    wx.setStorageSync('cart', []);
    app().globalData.cart = [];
    return { ok: true, order };
  });
}

function listOrders(status) {
  const orders = getStoredOrders();
  const filtered = status && status !== 'all' ? orders.filter((order) => order.status === status) : orders;
  return Promise.resolve(filtered.map(withSummary));
}

function getOrder(id) {
  return Promise.resolve(withSummary(getStoredOrders().find((order) => order.id === id)));
}

function updateOrderStatus(id, status) {
  return callCloud('updateOrderStatus', { id, status }, () => {
    const orders = getStoredOrders();
    const next = orders.map((order) => {
      if (order.id !== id) return order;
      if (!logic.canTransition(order.status, status)) {
        return order;
      }
      return { ...order, status, timeline: [...(order.timeline || []), { status, text: `状态更新为${status}` }] };
    });
    saveOrders(next);
    return { ok: true };
  });
}

function verifyPickupCode(code) {
  return callCloud('verifyPickupCode', { code }, () => {
    const orders = getStoredOrders();
    const target = orders.find((order) => order.pickupCode === code);
    if (!target) return { ok: false, message: '取餐凭证不存在' };
    if (['picked', 'completed'].includes(target.status)) return { ok: false, message: '该凭证已核销' };
    target.status = 'picked';
    target.timeline = [...(target.timeline || []), { status: 'picked', text: '管理员核销成功' }];
    saveOrders(orders);
    return { ok: true, order: target };
  });
}

function submitReview(payload) {
  return callCloud('submitReview', payload, () => {
    const reviews = wx.getStorageSync('reviews') || [];
    const review = { id: `r${Date.now()}`, createdAt: new Date().toISOString(), ...payload };
    wx.setStorageSync('reviews', [review, ...reviews]);
    return { ok: true, review };
  });
}

module.exports = {
  login,
  getDishes,
  getDish,
  getAddresses,
  saveAddress,
  placeOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  verifyPickupCode,
  submitReview
};
