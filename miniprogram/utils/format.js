function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function formatTime(date) {
  const d = date ? new Date(date) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusText(status) {
  return {
    unpaid: '待支付',
    paid: '已支付',
    preparing: '备餐中',
    ready: '待取餐',
    delivering: '配送中',
    delivered: '已送达',
    picked: '已取餐',
    completed: '已完成',
    cancelled: '已取消'
  }[status] || status;
}

module.exports = {
  money,
  formatTime,
  statusText
};
