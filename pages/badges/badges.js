const storage = require('../../utils/storage')

const BADGE_DEFS = [
  { days: 1,   icon: '🌱', name: '第一天' },
  { days: 3,   icon: '🌿', name: '三天坚持' },
  { days: 7,   icon: '🌳', name: '一周勇士' },
  { days: 14,  icon: '💪', name: '两周战士' },
  { days: 30,  icon: '🏆', name: '一月冠军' },
  { days: 60,  icon: '🥇', name: '两月达人' },
  { days: 100, icon: '💎', name: '百日传奇' },
  { days: 365, icon: '👑', name: '年度王者' },
]

Page({
  data: { badges: [] },

  onShow() {
    const settings = storage.getSettings()
    const streak = storage.calcStreak(settings.startDate)
    const badges = BADGE_DEFS.map(b => ({
      ...b,
      earned: streak >= b.days,
      daysLeft: Math.max(0, b.days - streak),
    }))
    this.setData({ badges })
  },
})
