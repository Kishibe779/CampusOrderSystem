const api = require('../../utils/api');

Page({
  data: {
    role: 'student',
    roles: [
      { value: 'student', name: '学生', desc: '浏览菜品、购物车、下单、取餐码' },
      { value: 'teacher', name: '教师', desc: '预约点餐、送餐到办公室' },
      { value: 'admin', name: '食堂管理员', desc: '管理订单、核验取餐凭证' },
      { value: 'group', name: '团餐组织方', desc: '批量预订桌餐或盒饭' }
    ]
  },

  onRoleChange(event) {
    this.setData({ role: event.detail.value });
  },

  login() {
    api.login({ role: this.data.role, nickName: '校园用户' }).then(() => {
      wx.showToast({ title: '登录成功' });
      wx.switchTab({ url: '/pages/index/index' });
    });
  }
});
