const typeOptions = [{
    circle: '',
    label: '计划'
}, {
    circle: 'real-circle',
    label: '拜访'
}, {
    circle: 'check-circle',
    label: '考勤'
}, {
    circle: 'move-circle',
    label: '移动'
}, {
    circle: 'offline-circle',
    label: '不在线'
}, {
    circle: 'position-fail-circle',
    label: '定位失败'
}, {
    circle: 'stop-circle',
    label: '停留'
}]

export function getTypeOptions() {
    return typeOptions
}
