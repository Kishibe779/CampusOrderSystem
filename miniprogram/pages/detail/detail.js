const api = require('../../utils/api');
const { requireLogin } = require('../../utils/role');

const DISH_STYLE = {
  d1: { emoji: '🍳', bg: 'linear-gradient(135deg, #fef3c7, #f59e0b)' },
  d2: { emoji: '🍗', bg: 'linear-gradient(135deg, #fce7f3, #ec4899)' },
  d3: { emoji: '🥗', bg: 'linear-gradient(135deg, #d1fae5, #10b981)' },
  d4: { emoji: '🥤', bg: 'linear-gradient(135deg, #dbeafe, #3b82f6)' },
  d5: { emoji: '🐟', bg: 'linear-gradient(135deg, #fee2e2, #ef4444)' },
  d6: { emoji: '🍱', bg: 'linear-gradient(135deg, #ede9fe, #8b5cf6)' }
};

function enrichDish(dish) {
  if (!dish) return null;
  const style = DISH_STYLE[dish.id] || { emoji: '🍽️', bg: 'linear-gradient(135deg, #f1d59b, #e57f47)' };
  return { ...dish, emoji: style.emoji, bg: style.bg };
}

Page({
  data: {
    dish: null,
    cartQty: 0
  },

  onLoad(query) {
    if (!requireLogin()) return;
    api.getDish(query.id).then((dish) => {
      if (!dish) { wx.showToast({ title: '菜品不存在', icon: 'none' }); return; }
      this.setData({ dish: enrichDish(dish) });
      this.syncCartQty(dish.id);
    });
  },

  onShow() {
    if (this.data.dish) {
      this.syncCartQty(this.data.dish.id);
    }
  },

  syncCartQty(dishId) {
    var cart = getApp().globalData.cart || [];
    var item = cart.find(function (i) { return i.id === dishId; });
    this.setData({ cartQty: item ? item.quantity : 0 });
  },

  addCart() {
    var dish = this.data.dish;
    var app = getApp();
    var cart = app.globalData.cart || [];
    var existing = cart.find(function (item) { return item.id === dish.id; });
    if (existing) existing.quantity += 1;
    else cart.push({ id: dish.id, name: dish.name, price: dish.price, quantity: 1 });
    app.setCart(cart);
    api.syncCart(cart);
    this.syncCartQty(dish.id);
  },

  minusCart() {
    var dish = this.data.dish;
    var app = getApp();
    var cart = (app.globalData.cart || []).map(function (item) {
      return item.id === dish.id ? Object.assign({}, item, { quantity: item.quantity - 1 }) : item;
    }).filter(function (item) { return item.quantity > 0; });
    app.setCart(cart);
    api.syncCart(cart);
    this.syncCartQty(dish.id);
  }
});
