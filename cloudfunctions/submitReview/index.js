const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const rating = Number(event.rating || 5);
  if (rating < 1 || rating > 5) return { ok: false, message: '评分范围应为1-5' };
  const review = {
    orderId: event.orderId,
    userOpenid: wxContext.OPENID,
    rating,
    content: event.content || '',
    images: event.images || [],
    createdAt: db.serverDate()
  };
  const res = await db.collection('reviews').add({ data: review });
  return { ok: true, review: { id: res._id, ...review } };
};
