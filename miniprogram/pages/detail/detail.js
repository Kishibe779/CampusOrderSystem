const api = require('../../utils/api');

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
    dish: null
  },

  onLoad(query) {
    api.getDish(query.id).then((dish) => {
      if (!dish) { wx.showToast({ title: '菜品不存在', icon: 'none' }); return; }
      this.setData({ dish: enrichDish(dish) });
    });
  },

  addCart() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    const existing = cart.find((item) => item.id === this.data.dish.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...this.data.dish, quantity: 1 });
    app.setCart(cart);
    wx.showToast({ title: '已加入购物车' });
  }
});
