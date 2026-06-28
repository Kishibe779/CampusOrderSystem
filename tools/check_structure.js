const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram', 'app.json'), 'utf8'));
const errors = [];

for (const page of appJson.pages) {
  for (const ext of ['js', 'json', 'wxml', 'wxss']) {
    const file = path.join(root, 'miniprogram', `${page}.${ext}`);
    if (!fs.existsSync(file)) errors.push(`缺少页面文件: ${path.relative(root, file)}`);
  }
}

const requiredFunctions = [
  'login',
  'getDishes',
  'placeOrder',
  'verifyPickupCode',
  'updateOrderStatus',
  'submitReview'
];

for (const name of requiredFunctions) {
  for (const fileName of ['index.js', 'package.json']) {
    const file = path.join(root, 'cloudfunctions', name, fileName);
    if (!fs.existsSync(file)) errors.push(`缺少云函数文件: ${path.relative(root, file)}`);
  }
}

const requiredDocs = [
  'README.md',
  'docs/superpowers/specs/2026-06-27-campus-ordering-design.md',
  'docs/superpowers/plans/2026-06-27-campus-ordering-implementation.md'
];

for (const doc of requiredDocs) {
  if (!fs.existsSync(path.join(root, doc))) errors.push(`缺少说明文件: ${doc}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`PASS structure check: ${appJson.pages.length} pages, ${requiredFunctions.length} cloud functions`);
