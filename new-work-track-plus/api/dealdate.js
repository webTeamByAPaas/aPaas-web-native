export function DateCreate(str) {
    if (!str) return new Date()
    return new Date(str.replace(/-/g, '/'))
}

// 获取日期
export function currentDate(timestamp) {
    let date = new Date()
    if (timestamp) date.setTime(timestamp)

    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()

    let clock = year + '-'

    if (month < 10) clock += '0'
    clock += month + '-'

    if (day < 10) clock += '0'
    clock += day

    return clock
}

// 获取时间
export function currentTime(timestamp) {
    let date = new Date()
    if (timestamp) date.setTime(timestamp)

    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()

    let clock = ''

    if (hh < 10) clock += '0'
    clock += hh + ':'

    if (mm < 10) clock += '0'
    clock += mm + ':'

    if (ss < 10) clock += '0'
    clock += ss

    return clock
}

// 获取日期时间
export function currentFullTime(timestamp) {
    let date = new Date()
    if (timestamp) date.setTime(timestamp)

    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()

    let hh = date.getHours()
    let mm = date.getMinutes()
    let ss = date.getSeconds()

    let clock = year + '-'

    if (month < 10) clock += '0'
    clock += month + '-'

    if (day < 10) clock += '0'
    clock += day + ' '

    if (hh < 10) clock += '0'
    clock += hh + ':'

    if (mm < 10) clock += '0'
    clock += mm + ':'

    if (ss < 10) clock += '0'
    clock += ss

    return clock
}

// 获取当前日期时分
export function currentHHMM(timestamp) {
    let date = new Date()
    if (timestamp) date.setTime(timestamp)

    let hh = date.getHours()
    let mm = date.getMinutes()
    let clock = ''
    if (hh < 10) clock += '0'
    clock += hh + ':'

    if (mm < 10) clock += '0'
    clock += mm
    return clock
}

// 获取时间差（分钟）
export function diffMM(timestampStart, timestampEnd) {
    let dateDiff = timestampEnd - timestampStart // 时间差的毫秒数
    return Math.floor(dateDiff / (60 * 1000))// 计算相差分钟数
}

// 获取时间差（天）
export function diffDD(timestampStart, timestampEnd) {
    let dateDiff = timestampEnd - timestampStart // 时间差的毫秒数
    return Math.floor(dateDiff / (24 * 60 * 60 * 1000))// 计算相差分钟数
}
