var ROLE_NAMES = {
  student: '学生',
  teacher: '教师',
  admin: '食堂管理员',
  group: '团餐组织方'
};

function getRole() {
  var user = getApp().globalData.user;
  return (user && user.role) || '';
}

function getRoleName() {
  return ROLE_NAMES[getRole()] || '用户';
}

function requireLogin() {
  if (!getApp().globalData.user) {
    wx.redirectTo({ url: '/pages/login/login' });
    return false;
  }
  return true;
}

function requireRole(roles) {
  if (!requireLogin()) return false;
  var role = getRole();
  if (roles.indexOf(role) === -1) {
    wx.showToast({ title: '无权限访问', icon: 'none' });
    setTimeout(function () {
      wx.switchTab({ url: '/pages/index/index' });
    }, 1000);
    return false;
  }
  return true;
}

module.exports = {
  ROLE_NAMES: ROLE_NAMES,
  getRole: getRole,
  getRoleName: getRoleName,
  requireLogin: requireLogin,
  requireRole: requireRole
};
