const storage = require('../../utils/storage')

Page({
  data: {
    startDate: '',
    pricePerDay: 20,
    reason: '',
  },

  onShow() {
    const s = storage.getSettings()
    this.setData({
      startDate: s.startDate || '',
      pricePerDay: s.pricePerDay || 20,
      reason: s.reason || '',
    })
  },

  onDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },

  onPriceInput(e) {
    this.setData({ pricePerDay: Number(e.detail.value) || 0 })
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value })
  },

  onSave() {
    const { startDate, pricePerDay, reason } = this.data
    if (!startDate) {
      wx.showToast({ title: '请选择开始日期', icon: 'none' })
      return
    }
    storage.saveSettings({ startDate, pricePerDay, reason })
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  onReset() {
    wx.showModal({
      title: '确认清除',
      content: '将删除所有打卡记录和设置，无法恢复',
      confirmColor: '#f44336',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync('qs_settings')
          wx.removeStorageSync('qs_records')
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      },
    })
  },
})
