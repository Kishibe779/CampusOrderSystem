const api = require('../../utils/api');

Page({
  onLoad() {
    if (getApp().globalData.user) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  data: {
    role: 'student',
    selectedRoleName: '学生',
    roles: [
      { value: 'student', name: '学生', desc: '浏览菜品、购物车、下单、取餐码' },
      { value: 'teacher', name: '教师', desc: '预约点餐、送餐到办公室' },
      { value: 'admin', name: '食堂管理员', desc: '管理订单、核验取餐凭证' },
      { value: 'group', name: '团餐组织方', desc: '批量预订桌餐或盒饭' }
    ],
    avatarUrl: '',
    nickName: ''
  },

  onRoleChange(event) {
    const role = event.detail.value;
    const item = this.data.roles.find((r) => r.value === role);
    this.setData({ role, selectedRoleName: item ? item.name : '学生' });
  },

  onChooseAvatar(event) {
    this.setData({ avatarUrl: event.detail.avatarUrl });
  },

  onNickInput(event) {
    this.setData({ nickName: event.detail.value });
  },

  login() {
    if (!this.data.avatarUrl && !this.data.nickName) {
      wx.showToast({ title: '请设置头像和昵称', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '登录中' });
    api.login({
      role: this.data.role,
      nickName: this.data.nickName || '校园用户',
      avatarUrl: this.data.avatarUrl || ''
    }).then((res) => {
      wx.hideLoading();
      if (res && res.ok) {
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800);
      } else {
        wx.showToast({ title: (res && res.message) || '登录失败', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '网络异常，请检查云开发环境', icon: 'none' });
    });
  }
});
