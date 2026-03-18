// 数据结构说明：
// settings: { startDate: 'YYYY-MM-DD', pricePerDay: 20, reason: '...' }
// records: { 'YYYY-MM-DD': 'success' | 'fail' }

const KEYS = {
  SETTINGS: 'qs_settings',
  RECORDS: 'qs_records',
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
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
  let cur = new Date(today)
  while (true) {
    const key = cur.toISOString().slice(0, 10)
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
  const start = new Date(startDate)
  const now = new Date()
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

module.exports = {
  getSettings,
  saveSettings,
  getRecords,
  getTodayKey,
  checkin,
  getTodayRecord,
  calcStreak,
  calcTotal,
  calcDaysSinceStart,
}
