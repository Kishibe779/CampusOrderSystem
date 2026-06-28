const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const profile = event.profile || {};
  const openid = wxContext.OPENID;
  const users = db.collection('users');
  const existed = await users.where({ openid }).get();

  const user = {
    openid,
    role: profile.role || 'student',
    nickName: profile.nickName || '校园用户',
    avatarUrl: profile.avatarUrl || '',
    updatedAt: db.serverDate()
  };

  if (existed.data.length) {
    await users.doc(existed.data[0]._id).update({ data: user });
  } else {
    await users.add({ data: { ...user, createdAt: db.serverDate() } });
  }

  return { ok: true, user };
};
