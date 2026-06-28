# 校园点餐系统（微信小程序云开发路线A）

本项目按《微信小程序开发实践》实训任务书实现，选用 A 路线：微信原生小程序 + 微信云开发（云函数 + 云数据库 + 云存储）。

## 功能覆盖

- 微信授权/角色演示登录：学生、教师、管理员、团餐组织方。
- 菜品浏览：分类、搜索、上拉加载、下拉刷新、菜品详情。
- 购物车：加菜、减菜、删除、数量与总价实时计算。
- 地址管理：新增、编辑、默认地址。
- 下单支付模拟：即时点餐、预约自取、送餐、团餐预订。
- 取餐凭证：支付后生成 6 位取餐码，订单详情清晰展示。
- 管理端：订单查看、状态处理、取餐码核销、菜品库存展示、销售统计。
- 订单中心：历史订单、状态筛选、送餐确认收货、评价。
- 创新展示：电子小票、营养提示、首页缓存、销售统计、团餐对账基础数据。

## 打开方式

1. 使用微信开发者工具导入本目录。
2. AppID 可使用测试号，云开发环境填入自己的环境 ID。
3. 若暂不部署云函数，可直接使用本地 seed 数据演示主要流程。
4. 若部署云函数，将 `cloudfunctions/` 下各函数上传并安装依赖。

## 云数据库集合

| 集合 | 说明 | 关键字段 |
| --- | --- | --- |
| users | 用户档案 | openid, role, nickName, avatarUrl |
| categories | 菜品分类 | id, name, sort |
| dishes | 菜品 | name, categoryId, price, stock, image, rating, sales, ingredients, nutrition, onSale |
| carts | 云端购物车 | userOpenid, dishId, quantity |
| addresses | 常用地址 | userOpenid, name, phone, detail, isDefault |
| orders | 订单 | orderNo, userOpenid, orderType, items, totalAmount, status, pickupCode, mealTime, address, groupInfo |
| pickup_codes | 取餐码索引 | code, orderId, used, usedAt |
| reviews | 评价 | orderId, userOpenid, rating, content, images |

## 索引建议

- `dishes`: `categoryId + onSale`, `name`
- `orders`: `userOpenid + createdAt`, `status + createdAt`, `pickupCode`
- `pickup_codes`: `code` 唯一索引
- `reviews`: `orderId`, `userOpenid + createdAt`

## 测试

```powershell
C:\Users\17569\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe tests/orderLogic.test.js
C:\Users\17569\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe tools/check_structure.js
```

## 交付物

`deliverables/` 目录包含需求分析说明书、系统设计说明书、测试用例与 Bug 修复记录、AI 使用记录表、个人实训报告、答辩 PPT 和最终项目压缩包。
