const assert = require('assert');

const {
  calculateCartTotal,
  validateStock,
  generatePickupCode,
  buildOrderNo,
  canTransition,
  createReceiptText,
} = require('../miniprogram/utils/orderLogic');

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test('calculates cart total and item count from selected dishes', () => {
  const result = calculateCartTotal([
    { id: 'd1', name: '番茄炒蛋', price: 8.5, quantity: 2 },
    { id: 'd2', name: '米饭', price: 1.5, quantity: 3 },
  ]);

  assert.deepStrictEqual(result, {
    amount: 21.5,
    count: 5,
  });
});

test('rejects cart lines that exceed dish stock', () => {
  const result = validateStock(
    [{ id: 'd1', name: '番茄炒蛋', quantity: 4 }],
    [{ id: 'd1', name: '番茄炒蛋', stock: 3 }]
  );

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.message, '番茄炒蛋库存不足');
});

test('accepts cart lines when every dish has enough stock', () => {
  const result = validateStock(
    [{ id: 'd1', name: '番茄炒蛋', quantity: 2 }],
    [{ id: 'd1', name: '番茄炒蛋', stock: 3 }]
  );

  assert.deepStrictEqual(result, { ok: true, message: '' });
});

test('generates six digit pickup codes that avoid existing codes', () => {
  const code = generatePickupCode(new Set(['100000', '100001']), () => 0);

  assert.strictEqual(code, '100002');
});

test('builds readable date-prefixed order numbers', () => {
  const date = new Date('2026-06-27T08:09:10+08:00');
  const orderNo = buildOrderNo(date, () => 0.123456);

  assert.strictEqual(orderNo, 'CO202606270809101234');
});

test('allows only legal order status transitions', () => {
  assert.strictEqual(canTransition('paid', 'preparing'), true);
  assert.strictEqual(canTransition('ready', 'picked'), true);
  assert.strictEqual(canTransition('picked', 'paid'), false);
  assert.strictEqual(canTransition('completed', 'cancelled'), false);
});

test('creates electronic receipt text with order and pickup information', () => {
  const text = createReceiptText({
    orderNo: 'CO202606270809101234',
    pickupCode: '654321',
    orderType: 'pickup',
    totalAmount: 21.5,
    items: [
      { name: '番茄炒蛋', quantity: 2 },
      { name: '米饭', quantity: 1 },
    ],
  });

  assert.ok(text.includes('校园点餐电子小票'));
  assert.ok(text.includes('取餐码：654321'));
  assert.ok(text.includes('合计：¥21.50'));
});
