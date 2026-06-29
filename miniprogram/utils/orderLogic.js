function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function calculateCartTotal(items) {
  return (items || []).reduce(
    (summary, item) => {
      const quantity = Number(item.quantity || 0);
      summary.count += quantity;
      summary.amount = roundMoney(summary.amount + Number(item.price || 0) * quantity);
      return summary;
    },
    { amount: 0, count: 0 }
  );
}

function validateStock(cartItems, dishes) {
  const dishMap = new Map((dishes || []).map((dish) => [dish.id, dish]));
  for (const item of cartItems || []) {
    const dish = dishMap.get(item.id);
    if (!dish) {
      return { ok: false, message: `${item.name || '菜品'}不存在` };
    }
    if (Number(item.quantity || 0) > Number(dish.stock || 0)) {
      return { ok: false, message: `${item.name || dish.name}库存不足` };
    }
  }
  return { ok: true, message: '' };
}

function generatePickupCode(existingCodes, randomFn) {
  const used = existingCodes || new Set();
  const rand = randomFn || Math.random;
  let code = pad(Math.floor(rand() * 900000) + 100000, 6);
  let guard = 0;
  while (used.has(code) && guard < 900000) {
    code = pad((Number(code) + 1 - 100000) % 900000 + 100000, 6);
    guard += 1;
  }
  return code;
}

function buildOrderNo(date, randomFn) {
  const d = date || new Date();
  const rand = randomFn || Math.random;
  const time = [
    d.getFullYear(),
    pad(d.getMonth() + 1, 2),
    pad(d.getDate(), 2),
    pad(d.getHours(), 2),
    pad(d.getMinutes(), 2),
    pad(d.getSeconds(), 2),
  ].join('');
  return `CO${time}${pad(Math.floor(rand() * 10000), 4)}`;
}

const transitions = {
  unpaid: ['paid', 'cancelled'],
  paid: ['preparing', 'cancelled'],
  preparing: ['ready', 'delivering'],
  ready: ['picked', 'delivering'],
  delivering: ['delivered'],
  delivered: ['completed'],
  picked: ['completed'],
  completed: [],
  cancelled: [],
};

function canTransition(from, to) {
  return Boolean(transitions[from] && transitions[from].includes(to));
}

function createReceiptText(order) {
  const lines = [
    '校园点餐电子小票',
    `订单号：${order.orderNo}`,
    `取餐方式：${order.orderType === 'delivery' ? '送餐' : '到店自取'}`,
  ];
  if (order.pickupCode) {
    lines.push(`取餐码：${order.pickupCode}`);
  }
  lines.push('菜品明细：');
  for (const item of order.items || []) {
    lines.push(`- ${item.name} x${item.quantity}`);
  }
  lines.push(`合计：¥${Number(order.totalAmount || 0).toFixed(2)}`);
  lines.push('请凭取餐码到对应窗口核销，祝用餐愉快。');
  return lines.join('\n');
}

module.exports = {
  calculateCartTotal,
  validateStock,
  generatePickupCode,
  buildOrderNo,
  canTransition,
  createReceiptText,
};
