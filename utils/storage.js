// 数据结构说明：
// settings: { startDate: 'YYYY-MM-DD', pricePerDay: 20, reason: '...' }
// records: { 'YYYY-MM-DD': 'success' | 'fail' }

const KEYS = {
  SETTINGS: 'qs_settings',
  RECORDS: 'qs_records',
}

const CIGARETTES_PER_DAY = 20

// 将 Date 对象格式化为本地 'YYYY-MM-DD'（避免 toISOString 的 UTC 时区问题）
function dateToKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getSettings() {
  return wx.getStorageSync(KEYS.SETTINGS) || {
    startDate: '',
    pricePerDay: 20,
    reason: '',
  }
}

function saveSettings(settings) {
  wx.setStorageSync(KEYS.SETTINGS, settings)
}

function getRecords() {
  return wx.getStorageSync(KEYS.RECORDS) || {}
}

function saveRecords(records) {
  wx.setStorageSync(KEYS.RECORDS, records)
}

function getTodayKey() {
  return dateToKey(new Date())
}

function checkin(status) {
  const today = getTodayKey()
  const records = getRecords()
  if (records[today]) return false // 已打卡
  records[today] = status
  saveRecords(records)
  return true
}

function getTodayRecord() {
  return getRecords()[getTodayKey()] || null
}

// 从 startDate 到今天，计算连续成功天数（从最近往前数）
function calcStreak(startDate) {
  if (!startDate) return 0
  const records = getRecords()
  const today = getTodayKey()
  let streak = 0
  let cur = new Date()
  // 最多回溯 365*3 天，防止极端情况下无限循环
  const maxDays = 365 * 3
  for (let i = 0; i < maxDays; i++) {
    const key = dateToKey(cur)
    if (key < startDate) break
    if (records[key] === 'success') {
      streak++
    } else if (records[key] === 'fail') {
      break
    } else {
      // 今天还没打卡，跳过；之前的空白天视为中断
      if (key === today) {
        cur.setDate(cur.getDate() - 1)
        continue
      }
      break
    }
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

// 累计成功天数
function calcTotal(startDate) {
  if (!startDate) return 0
  const records = getRecords()
  return Object.entries(records)
    .filter(([k, v]) => k >= startDate && v === 'success')
    .length
}

// 距离开始戒烟的总天数
function calcDaysSinceStart(startDate) {
  if (!startDate) return 0
  // 使用本地日期字符串比较，避免时区偏差
  const today = getTodayKey()
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date(today + 'T00:00:00')
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// 获取最近 n 天的打卡记录（含星期标签），供多页面复用
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
function getRecentDays(n) {
  const records = getRecords()
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = dateToKey(d)
    days.push({
      date: key,
      status: records[key] || 'empty',
      weekday: WEEKDAYS[d.getDay()],
    })
  }
  return days
}

module.exports = {
  CIGARETTES_PER_DAY,
  getSettings,
  saveSettings,
  getRecords,
  getTodayKey,
  checkin,
  getTodayRecord,
  calcStreak,
  calcTotal,
  calcDaysSinceStart,
  getRecentDays,
}
