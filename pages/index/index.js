const storage = require('../../utils/storage')

Page({
  data: {
    streak: 0,
    totalDays: 0,
    moneySaved: 0,
    daysSinceStart: 0,
    todayRecord: null,
    today: '',
    reason: '',
    hasSettings: false,
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const settings = storage.getSettings()
    const hasSettings = !!settings.startDate
    const streak = storage.calcStreak(settings.startDate)
    const totalDays = storage.calcTotal(settings.startDate)
    const daysSinceStart = storage.calcDaysSinceStart(settings.startDate)
    const moneySaved = totalDays * (settings.pricePerDay || 20)
    const todayRecord = storage.getTodayRecord()
    const today = storage.getTodayKey()

    this.setData({
      streak, totalDays, moneySaved, daysSinceStart,
      todayRecord, today,
      reason: settings.reason || '',
      hasSettings,
    })
  },

  onCheckin(e) {
    const status = e.currentTarget.dataset.status
    const settings = storage.getSettings()
    if (!settings.startDate) {
      wx.showToast({ title: '请先设置开始日期', icon: 'none' })
      return
    }
    const ok = storage.checkin(status)
    if (!ok) {
      wx.showToast({ title: '今天已经打卡了', icon: 'none' })
      return
    }
    if (status === 'success') {
      wx.showToast({ title: '打卡成功！继续加油 💪', icon: 'success' })
    } else {
      wx.showToast({ title: '没关系，明天重新开始', icon: 'none' })
    }
    this.loadData()
  },

  goSettings() {
    wx.switchTab({ url: '/pages/settings/settings' })
  },
})
