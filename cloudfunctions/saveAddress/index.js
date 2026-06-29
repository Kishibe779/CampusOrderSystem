const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const address = {
    name: event.name || '',
    phone: event.phone || '',
    detail: event.detail || '',
    isDefault: !!event.isDefault,
    updatedAt: db.serverDate()
  };

  // If setting as default, unset all other defaults for this user
  if (address.isDefault) {
    const defaults = await db.collection('addresses')
      .where({ userOpenid: openid, isDefault: true })
      .get();
    for (const item of defaults.data) {
      await db.collection('addresses').doc(item._id).update({
        data: { isDefault: false }
      });
    }
  }

  if (event._id) {
    // Update existing address
    await db.collection('addresses').doc(event._id).update({ data: address });
  } else {
    // Insert new address
    await db.collection('addresses').add({
      data: {
        ...address,
        userOpenid: openid,
        createdAt: db.serverDate()
      }
    });
  }

  // Return updated list
  const res = await db.collection('addresses')
    .where({ userOpenid: openid })
    .orderBy('createdAt', 'desc')
    .get();

  return { ok: true, addresses: res.data };
};
