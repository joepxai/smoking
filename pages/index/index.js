const storage = require('../../utils/storage')

Page({
  data: {
    streak: 0,
    totalDays: 0,
    moneySaved: 0,
    daysSinceStart: 0,
    cigarettesAvoided: 0,
    badgeCount: 0,
    todayRecord: null,
    today: '',
    reason: '',
    hasSettings: false,
    recentDays: [],
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
    const pricePerDay = settings.pricePerDay || 20
    const moneySaved = totalDays * pricePerDay
    const cigarettesAvoided = totalDays * storage.CIGARETTES_PER_DAY

    const BADGE_DAYS = [1, 3, 7, 14, 30, 60, 100, 365]
    const badgeCount = BADGE_DAYS.filter(d => streak >= d).length

    this.setData({
      streak, totalDays, moneySaved, daysSinceStart,
      cigarettesAvoided, badgeCount,
      todayRecord: storage.getTodayRecord(),
      today: storage.getTodayKey(),
      reason: settings.reason || '',
      hasSettings,
      recentDays: storage.getRecentDays(7),
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
    wx.showToast({
      title: status === 'success' ? '打卡成功 💪' : '没关系，明天继续',
      icon: status === 'success' ? 'success' : 'none'
    })
    this.loadData()
  },

  goSettings() {
    wx.switchTab({ url: '/pages/settings/settings' })
  },
})
