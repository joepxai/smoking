# smoking（戒烟打卡）— 产品规格文档

**版本：** v1.2.0
**最后更新：** 2026-03-19
**维护人：** joepxai

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [项目结构](#3-项目结构)
4. [页面配置](#4-页面配置)
5. [数据模型](#5-数据模型)
6. [工具模块（utils/storage.js）](#6-工具模块)
7. [页面规格](#7-页面规格)
8. [代码审查记录](#8-代码审查记录)
9. [版本号记录](#9-版本号记录)
10. [文档更新日志](#10-文档更新日志)
11. [项目日志](#11-项目日志)

---

## 1. 项目概述

| 字段 | 内容 |
|------|------|
| 项目名 | smoking（戒烟打卡） |
| 描述 | 微信小程序，帮助用户记录戒烟进度、每日打卡、查看健康恢复里程碑和徽章成就 |
| 当前版本 | v1.2.0 |
| 架构 | 原生微信小程序（无框架） |
| 数据存储 | wx.getStorageSync / wx.setStorageSync（纯本地，无后端） |

**核心功能：**
- 每日打卡（成功/失败）
- 连续天数、累计天数、节省金钱、少抽支数统计
- 健康恢复时间线（6个里程碑）
- 8个成就徽章（1/3/7/14/30/60/100/365天）
- 设置：开始日期、每天烟钱、戒烟理由
- 数据清除

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | 原生微信小程序 WXML + WXSS + JS |
| 存储 | wx.getStorageSync / wx.setStorageSync |
| 构建 | 微信开发者工具（无需额外构建步骤） |

---

## 3. 项目结构

```
smoking/
├── app.js                      # 小程序入口（globalData 为空）
├── app.json                    # 全局配置：页面路由、tabBar、window 样式
├── app.wxss                    # 全局样式
├── sitemap.json                # 搜索配置
├── utils/
│   └── storage.js              # 数据读写 + 业务计算工具模块
├── pages/
│   ├── index/                  # 首页（打卡）
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   ├── stats/                  # 统计页
│   │   ├── stats.js
│   │   ├── stats.wxml
│   │   ├── stats.wxss
│   │   └── stats.json
│   ├── badges/                 # 徽章页
│   │   ├── badges.js
│   │   ├── badges.wxml
│   │   ├── badges.wxss
│   │   └── badges.json
│   └── settings/               # 设置页
│       ├── settings.js
│       ├── settings.wxml
│       ├── settings.wxss
│       └── settings.json
├── assets/                     # tabBar 图标（8张 png）
└── CHANGELOG.md                # 版本更新记录
```

---

## 4. 页面配置

### 4.1 tabBar

| Tab | 页面路径 | 文字 |
|-----|---------|------|
| 1 | pages/index/index | 打卡 |
| 2 | pages/stats/stats | 统计 |
| 3 | pages/badges/badges | 徽章 |
| 4 | pages/settings/settings | 设置 |

- 未选中颜色：`#9CA3AF`
- 选中颜色：`#4F72FF`
- 背景色：`#ffffff`

### 4.2 全局 window

| 字段 | 值 |
|------|-----|
| 导航栏背景色 | `#4F72FF` |
| 导航栏标题 | 戒烟打卡 |
| 导航栏文字 | white |
| 页面背景色 | `#EEF2FF` |

---

## 5. 数据模型

### 5.1 settings（存储 key：`qs_settings`）

```js
{
  startDate: 'YYYY-MM-DD',  // 开始戒烟日期
  pricePerDay: 20,           // 每天烟钱（元），默认 20
  reason: ''                 // 戒烟理由
}
```

### 5.2 records（存储 key：`qs_records`）

```js
{
  'YYYY-MM-DD': 'success' | 'fail'
  // 未打卡的日期不存在 key
}
```

---

## 6. 工具模块（utils/storage.js）

### 6.1 导出函数列表

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getSettings()` | — | settings 对象 | 读取设置，不存在则返回默认值 |
| `saveSettings(settings)` | settings 对象 | — | 保存设置 |
| `getRecords()` | — | records 对象 | 读取打卡记录，不存在则返回 `{}` |
| `getTodayKey()` | — | `'YYYY-MM-DD'` | 返回今日日期字符串 |
| `checkin(status)` | `'success'｜'fail'` | boolean | 今日打卡，已打卡返回 false |
| `getTodayRecord()` | — | `'success'｜'fail'｜null` | 今日打卡状态 |
| `calcStreak(startDate)` | `'YYYY-MM-DD'` | number | 从最近往前数连续成功天数，遇 fail 或空白（今天除外）中断 |
| `calcTotal(startDate)` | `'YYYY-MM-DD'` | number | startDate 至今累计成功天数 |
| `calcDaysSinceStart(startDate)` | `'YYYY-MM-DD'` | number | 距开始戒烟总天数 |

### 6.2 calcStreak 逻辑说明

```
从今天往前逐日遍历：
  - key < startDate → 停止
  - records[key] === 'success' → streak++，继续
  - records[key] === 'fail' → 停止
  - records[key] 不存在：
    - 若是今天 → 跳过（今天还没打卡）
    - 否则 → 停止（空白天视为中断）
```

---

## 7. 页面规格

### 7.1 首页（index）

**数据字段：**

| 字段 | 来源 | 说明 |
|------|------|------|
| streak | calcStreak | 连续戒烟天数 |
| totalDays | calcTotal | 累计成功天数 |
| moneySaved | totalDays × pricePerDay | 节省金钱（元） |
| daysSinceStart | calcDaysSinceStart | 坚持总天数 |
| cigarettesAvoided | totalDays × 20 | 少抽支数（按一包20支） |
| badgeCount | streak 与 BADGE_DAYS 比较 | 已获徽章数 |
| todayRecord | getTodayRecord | 今日打卡状态 |
| recentDays | 最近7天 records | 周历打卡条数据 |

**页面结构：**
```
Hero 渐变区
  └── 连续天数大数字 + 累计/节省小字 + 周历打卡条（7天）

今日打卡卡片
  ├── 未打卡：「今天成功了」/ 「今天失败了」按钮
  └── 已打卡：结果展示

2×2 数据网格
  └── 坚持天数 / 节省金钱 / 少抽支数 / 获得徽章

未设置提示（hasSettings=false 时显示）
```

**事件：**
- `onCheckin(e)`：`e.currentTarget.dataset.status` 为 `'success'` 或 `'fail'`
- `goSettings()`：`wx.switchTab` 跳转设置页

### 7.2 统计页（stats）

**健康里程碑常量（HEALTH_MILESTONES）：**

| 时间 | 描述 |
|------|------|
| 20分钟 | 心率和血压开始下降 |
| 12小时 | 血液中一氧化碳恢复正常 |
| 3天 | 尼古丁完全代谢，呼吸更顺畅 |
| 2周 | 肺功能开始改善 |
| 3个月 | 心脏病风险开始降低 |
| 1年 | 冠心病风险降低一半 |

里程碑 `done` 字段：`hoursSinceStart >= m.hours`（daysSinceStart × 24）

### 7.3 徽章页（badges）

**徽章定义（BADGE_DEFS）：**

| 天数 | 图标 | 名称 |
|------|------|------|
| 1 | 🌱 | 第一天 |
| 3 | 🌿 | 三天坚持 |
| 7 | 🌳 | 一周勇士 |
| 14 | 💪 | 两周战士 |
| 30 | 🏆 | 一月冠军 |
| 60 | 🥇 | 两月达人 |
| 100 | 💎 | 百日传奇 |
| 365 | 👑 | 年度王者 |

- `earned`：`streak >= b.days`
- `daysLeft`：`Math.max(0, b.days - streak)`
- `progressPct`：`Math.round(earnedCount / 8 * 100)`

### 7.4 设置页（settings）

**表单字段：**

| 字段 | 类型 | 组件 | 说明 |
|------|------|------|------|
| startDate | string | picker（date 模式） | 开始戒烟日期 |
| pricePerDay | number | input（number 类型） | 每天烟钱，默认 20 |
| reason | string | input（text 类型） | 戒烟理由 |

**操作：**
- `onSave()`：校验 startDate 非空后保存，`wx.showToast` 提示
- `onReset()`：`wx.showModal` 二次确认后 `wx.clearStorageSync()`

---

## 8. 代码审查记录

> 审查日期：2026-03-19

### 8.1 问题清单

| 编号 | 位置 | 问题描述 | 严重程度 | 状态 |
|------|------|---------|---------|------|
| R-01 | `utils/storage.js` `calcStreak()` | 使用 `cur.toISOString().slice(0,10)` 获取日期，`toISOString()` 返回 UTC 时间，在东八区 00:00~08:00 之间会得到前一天的日期，导致连续天数计算错误 | 高 | 待修复 |
| R-02 | `utils/storage.js` `calcDaysSinceStart()` | 同上，`new Date()` 与 `new Date(startDate)` 时区处理不一致，startDate 解析为 UTC 00:00，now 为本地时间，diff 计算在时区边界可能偏差1天 | 中 | 待修复 |
| R-03 | `pages/index/index.js` | `cigarettesAvoided = totalDays * 20` 硬编码每包20支，应从 settings 读取或作为常量提取，与 stats.js 中同样的硬编码保持一致 | 低 | 建议提取常量 |
| R-04 | `pages/stats/stats.js` | `recentDays` 构建逻辑与 `index.js` 完全重复，建议提取到 `utils/storage.js` 作为公共函数 | 低 | 建议重构 |
| R-05 | `pages/settings/settings.js` `onReset()` | `wx.clearStorageSync()` 清除所有存储，若未来有其他 key 也会被清除，建议改为只删除 `qs_settings` 和 `qs_records` 两个 key | 中 | 待修复 |
| R-06 | `app.js` | `onLaunch()` 为空函数，`globalData` 为空对象，无实际作用，可精简 | 低 | 可清理 |
| R-07 | `utils/storage.js` `calcStreak()` | 循环无最大迭代次数限制，若 startDate 很早（如几年前），会循环数百次，性能较差 | 低 | 建议优化 |

### 8.2 R-01 修复方案

将 `toISOString().slice(0,10)` 替换为本地时间格式化：

```js
function dateToKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
```

### 8.3 优化建议

1. **提取 `getRecentDays(n)` 公共函数**到 storage.js，index 和 stats 共用
2. **提取 `CIGARETTES_PER_DAY = 20` 常量**，避免多处硬编码
3. **onReset 精确清除**：`wx.removeStorageSync(KEYS.SETTINGS)` + `wx.removeStorageSync(KEYS.RECORDS)`

---

## 9. 版本号记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-03-18 | 初始版本，4页面基础功能 |
| v1.1.0 | 2026-03-18 | 替换 tabBar 图标为 Remixicon |
| v1.2.0 | 2026-03-18 | UI 全面重设计，蓝紫渐变主色 |
| v1.0.0（文档） | 2026-03-19 | 首次整理产品规格文档 |

---

## 10. 文档更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2026-03-19 | v1.0.0 | 初始化文档，整理数据模型、工具模块、4个页面规格、代码审查记录 |

---

## 11. 项目日志

| 日期 | 操作人 | 内容 |
|------|--------|------|
| 2026-03-19 | Joep | 要求整理项目规格文档；对现有代码进行审查，输出问题清单（R-01 至 R-07） |
