function app() {
  return getApp();
}

function summarizeItems(items) {
  return (items || []).map((item) => `${item.name}x${item.quantity}`).join('、');
}

function withSummary(order) {
  return order ? { ...order, id: order._id, summary: summarizeItems(order.items) } : order;
}

function callCloud(name, data) {
  return wx.cloud.callFunction({ name, data }).then((res) => {
    if (res.result && res.result.ok === false) {
      wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
    }
    return res.result;
  }).catch((err) => {
    console.error(`云函数 ${name} 调用失败:`, err);
    wx.showToast({ title: '网络开小差了，请重试', icon: 'none' });
    return { ok: false, message: err.errMsg || '云函数调用失败' };
  });
}

// ========== 用户 ==========

function login(profile) {
  return callCloud('login', { profile }).then((res) => {
    if (res.ok) {
      app().globalData.user = res.user;
    }
    return res;
  });
}

// ========== 菜品 ==========

function getDishes({ categoryId = 'all', keyword = '', page = 1, pageSize = 4 } = {}) {
  return callCloud('getDishes', { categoryId, keyword, page, pageSize });
}

function getDish(id) {
  return callCloud('getDish', { id }).then((res) => (res.ok ? res.dish : null));
}

// ========== 地址 ==========

function getAddresses() {
  return callCloud('getAddresses', {}).then((res) => (res.ok ? res.addresses : []));
}

function saveAddress(address) {
  return callCloud('saveAddress', address).then((res) => {
    if (res.ok && res.addresses) {
      app().globalData.addresses = res.addresses;
    }
    return res;
  });
}

// ========== 订单 ==========

function placeOrder(payload) {
  return callCloud('placeOrder', payload).then((res) => {
    if (res.ok) {
      app().globalData.cart = [];
    }
    return res;
  });
}

function listOrders(status) {
  return callCloud('listOrders', { status }).then((res) =>
    (res.ok ? res.orders : []).map(withSummary)
  );
}

function getOrder(id) {
  return callCloud('getOrder', { id }).then((res) => {
    if (res.ok && res.order) return withSummary(res.order);
    return null;
  });
}

function updateOrderStatus(id, status) {
  return callCloud('updateOrderStatus', { id, status });
}

function verifyPickupCode(code) {
  return callCloud('verifyPickupCode', { code });
}

// ========== 评价 ==========

function submitReview(payload) {
  return callCloud('submitReview', payload);
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
