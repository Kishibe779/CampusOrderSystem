import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "deliverables");
const QA = path.join(ROOT, "work", "presentations", "campus", "tmp", "qa");

const artifactEntrypoints = [
  "C:/Users/17569/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/node/artifact_tool.mjs",
  "C:/Users/17569/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs",
];

const artifactEntrypoint = artifactEntrypoints.find((entry) => fsSync.existsSync(entry));
if (!artifactEntrypoint) {
  throw new Error("Cannot find bundled @oai/artifact-tool entrypoint.");
}

const { Presentation, PresentationFile } = await import(pathToFileURL(artifactEntrypoint).href);

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: style.fontSize || 24,
    bold: Boolean(style.bold),
    color: style.color || "#111111",
    alignment: style.alignment || "left",
  };
  return shape;
}

function addPanel(slide, position, fill = "#EDEDED") {
  return slide.shapes.add({
    geometry: "rect",
    position,
    fill,
    line: { style: "solid", fill: "#D0D5DD", width: 1 },
  });
}

function addTitle(slide, title, page) {
  addText(slide, title, { left: 42, top: 36, width: 980, height: 72 }, { fontSize: 42, bold: true });
  addText(slide, String(page).padStart(2, "0"), { left: 1175, top: 42, width: 64, height: 28 }, { fontSize: 16, color: "#555555", alignment: "right" });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 42, top: 122, width: 1196, height: 1 },
    fill: "#B8BCC4",
    line: { style: "solid", fill: "#B8BCC4", width: 0 },
  });
}

function addBullets(slide, items, left, top, width, fontSize = 22) {
  items.forEach((item, index) => {
    addText(slide, `• ${item}`, { left, top: top + index * 48, width, height: 42 }, { fontSize });
  });
}

function cover(p) {
  const slide = p.slides.add();
  slide.background.fill = "#FFFFFF";
  addText(slide, "校园点餐系统", { left: 72, top: 138, width: 780, height: 96 }, { fontSize: 64, bold: true });
  addText(slide, "微信小程序开发实践 · A路线云开发", { left: 76, top: 254, width: 720, height: 42 }, { fontSize: 26, color: "#555555" });
  addPanel(slide, { left: 850, top: 118, width: 316, height: 420 }, "#0F5132");
  addText(slide, "点餐\n预约\n核销\n统计", { left: 902, top: 176, width: 220, height: 280 }, { fontSize: 48, bold: true, color: "#FFFFFF", alignment: "center" });
  addText(slide, "第X组 · 组员姓名 · 2026年6月", { left: 76, top: 588, width: 680, height: 36 }, { fontSize: 22 });
}

function simpleSlide(p, page, title, bullets, note = "") {
  const slide = p.slides.add();
  slide.background.fill = "#FFFFFF";
  addTitle(slide, title, page);
  addBullets(slide, bullets, 74, 168, 700, 24);
  addPanel(slide, { left: 850, top: 168, width: 320, height: 360 });
  addText(slide, note, { left: 884, top: 206, width: 252, height: 280 }, { fontSize: 24, bold: true, alignment: "center" });
}

function metricsSlide(p) {
  const slide = p.slides.add();
  slide.background.fill = "#FFFFFF";
  addTitle(slide, "需求分析摘要", 4);
  const metrics = [
    ["4", "核心角色"],
    ["13", "基础用户故事"],
    ["6", "云函数"],
    ["11", "小程序页面"],
  ];
  metrics.forEach((m, i) => {
    const x = 72 + i * 286;
    addPanel(slide, { left: x, top: 190, width: 232, height: 190 });
    addText(slide, m[0], { left: x, top: 222, width: 232, height: 74 }, { fontSize: 58, bold: true, alignment: "center" });
    addText(slide, m[1], { left: x, top: 310, width: 232, height: 36 }, { fontSize: 22, color: "#555555", alignment: "center" });
  });
  addBullets(slide, ["学生即时点餐：浏览、购物车、支付、凭码取餐", "预约与配送：自取/送餐、时间与地址、确认收货", "团餐预订：人数、时间、套餐、特殊要求", "食堂管理：订单处理、核销、库存与统计"], 96, 438, 1040, 22);
}

function demoSlide(p) {
  const slide = p.slides.add();
  slide.background.fill = "#FFFFFF";
  addTitle(slide, "核心功能演示路径", 5);
  const steps = ["登录", "选餐", "购物车", "提交订单", "取餐码", "管理员核销", "完成/评价"];
  steps.forEach((step, i) => {
    const x = 70 + i * 164;
    addPanel(slide, { left: x, top: 238, width: 120, height: 120 }, i % 2 ? "#EDEDED" : "#E7F2EB");
    addText(slide, step, { left: x + 8, top: 278, width: 104, height: 38 }, { fontSize: 20, bold: true, alignment: "center" });
    if (i < steps.length - 1) {
      addText(slide, "→", { left: x + 124, top: 276, width: 38, height: 38 }, { fontSize: 28, bold: true });
    }
  });
  addText(slide, "演示时从首页加购番茄炒蛋套餐，提交自取订单后展示6位取餐码，再切换管理端输入取餐码完成核销。", { left: 110, top: 450, width: 980, height: 80 }, { fontSize: 26, alignment: "center" });
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(QA, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  cover(p);
  simpleSlide(p, 2, "项目概述", ["为学生、教师、团餐组织方和食堂管理员服务", "减少排队等待，提前组织备餐，避免错领", "覆盖即时点餐、预约、配送、团餐、后台核销"], "做什么\n为谁做\n怎么验收");
  simpleSlide(p, 3, "技术路线", ["选择A路线：微信原生小程序 + 微信云开发", "前端：WXML/WXSS/JS/JSON 页面与状态管理", "后端：云函数处理登录、下单、核销、状态更新", "数据：云数据库集合 users/dishes/orders/pickup_codes/reviews"], "小程序\n↓\n云函数\n↓\n云数据库");
  metricsSlide(p);
  demoSlide(p);
  simpleSlide(p, 6, "核心设计决策", ["取餐凭证采用6位数字，演示稳定、核销快速", "订单状态机限制非法回退，覆盖自取和配送", "API facade支持云函数与本地seed兜底，便于课堂检查"], "凭证唯一\n状态可控\n演示可靠");
  simpleSlide(p, 7, "亮点与创新", ["电子小票：订单详情生成可复制小票文本", "营养提示：菜品详情展示热量和蛋白质等信息", "团餐预订：支持人数、套餐、时间和特殊要求", "管理统计：订单数、销售额、取餐状态概览"], "创新来自\n真实业务痛点");
  simpleSlide(p, 8, "难点与解决方案", ["WXML不适合复杂JS表达式：改为API层预计算字段", "团餐不是普通库存菜品：按套餐人数独立处理", "库存与订单一致性：云函数中使用事务扣减库存", "状态流转易混乱：抽出canTransition集中约束"], "问题定位\n规则前置\n测试兜底");
  simpleSlide(p, 9, "Git提交记录", ["提交信息使用 feat/fix/docs/test 类型", "建议展示 git log --oneline --graph 截图", "核心提交：业务逻辑、页面、云函数、文档、测试", "每位成员按Day1-Day4保持有效提交"], "feat: 添加取餐码\nfix: 修复团餐提交\ndocs: 完成交付文档");
  simpleSlide(p, 10, "总结与分工", ["前端：页面、交互、样式、演示流程", "后端：云函数、数据库集合、状态流转", "测试与文档：用例、Bug记录、AI记录、报告、PPT", "改进方向：真实支付、订阅消息、云存储图片、并发压测"], "能运行\n能解释\n能验收");

  for (const [index, slide] of p.slides.items.entries()) {
    await writeBlob(path.join(QA, `slide-${String(index + 1).padStart(2, "0")}.png`), await p.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(QA, `slide-${String(index + 1).padStart(2, "0")}.layout.json`), await layout.text());
  }
  await writeBlob(path.join(QA, "deck-montage.webp"), await p.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(path.join(OUT, "校园点餐系统_答辩PPT_第X组.pptx"));
  console.log(path.join(OUT, "校园点餐系统_答辩PPT_第X组.pptx"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
