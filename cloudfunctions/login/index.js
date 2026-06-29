const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const VALID_ROLES = ['student', 'teacher', 'admin', 'group'];

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const profile = event.profile || {};
  const openid = wxContext.OPENID;
  const users = db.collection('users');
  const existed = await users.where({ openid }).get();

  // 服务端校验：已存在用户不允许修改角色；新用户允许选择任意演示角色
  let role = 'student';
  if (existed.data.length) {
    role = existed.data[0].role;
    if (profile.role && VALID_ROLES.includes(profile.role) && profile.role !== role) {
      return { ok: false, message: '角色不可自行修改，请联系管理员' };
    }
  } else if (profile.role && VALID_ROLES.includes(profile.role)) {
    role = profile.role;
  }

  const user = {
    openid,
    role,
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
