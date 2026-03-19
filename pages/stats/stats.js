const storage = require('../../utils/storage')

const HEALTH_MILESTONES = [
  { hours: 0.33, label: '20分钟', desc: '心率和血压开始下降' },
  { hours: 12, label: '12小时', desc: '血液中一氧化碳恢复正常' },
  { hours: 72, label: '3天', desc: '尼古丁完全代谢，呼吸更顺畅' },
  { hours: 336, label: '2周', desc: '肺功能开始改善' },
  { hours: 2160, label: '3个月', desc: '心脏病风险开始降低' },
  { hours: 8760, label: '1年', desc: '冠心病风险降低一半' },
]

Page({
  data: {
    startDate: '',
    streak: 0,
    totalDays: 0,
    moneySaved: 0,
    cigarettesAvoided: 0,
    healthMilestones: [],
    recentDays: [],
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const settings = storage.getSettings()
    const streak = storage.calcStreak(settings.startDate)
    const totalDays = storage.calcTotal(settings.startDate)
    const moneySaved = totalDays * (settings.pricePerDay || 20)
    const cigarettesAvoided = totalDays * storage.CIGARETTES_PER_DAY
    const daysSinceStart = storage.calcDaysSinceStart(settings.startDate)
    const hoursSinceStart = daysSinceStart * 24

    const healthMilestones = HEALTH_MILESTONES.map(m => ({
      ...m,
      done: hoursSinceStart >= m.hours,
    }))

    this.setData({
      startDate: settings.startDate || '',
      streak, totalDays, moneySaved, cigarettesAvoided,
      healthMilestones,
      recentDays: storage.getRecentDays(7),
    })
  },
})
