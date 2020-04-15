import { getContent } from './template'

let getInfoWindow
let zIndex = 101
let openInfoMarker

export function initPoint() {
    getInfoWindow = initInfoWindow.call(this)
}

// 信息窗体单例
function initInfoWindow() {
    let single

    if (!single) {
        single = new this.AMap.InfoWindow({
            content: getInfoWindowContent(),
            offset: new this.AMap.Pixel(0, -30)
        })

        this.AMap.event.addListener(single, 'close', function () {
            if (openInfoMarker) openInfoMarker.setzIndex(100)
        })
    }

    function get() {
        return single
    }

    return get
}

export function createPoint(data, isHide) {
    let num = 1
    let markers = []
    data.forEach(item => {
        if (item.position.length < 2) return
        if (item.type === 8) num = item.visitTimes
        let marker = new this.AMap.Marker(Object.assign(getContent.call(this, item.type, num), {
            map: this.map,
            position: new this.AMap.LngLat(item.position[0], item.position[1]),
            extData: item,
            visible: !isHide,
            zIndex: 100
        }))
        this.AMap.event.addListener(marker, 'click', e => {
            openInfoWindow.call(this, e.target)
        })

        markers.push(marker)
        if (item.type === 1 || item.type === 0) num++
    })
    return markers
}

// 信息窗体内容
function getInfoWindowContent(params = {}) {
    let { label, time, address } = params
    let arr = []
    if (time) arr.push(`<p>时间：${time}</p>`)
    if (address) arr.push(`<p>地点：${address}</p>`)
    return `<div class="amapplus-window-content">
                <h3>${label}</h3>
                ${arr.join('')}
            </div>`
}

export function openInfoWindow(marker) {
    let item = marker.getExtData()
    if (item.position.length < 2) return
    let popInfo = getInfoWindow()
    popInfo.setContent(getInfoWindowContent({
        label: item.axis_label,
        time: item.timeHHMM,
        address: item.address
    }))
    popInfo.open(this.map, new this.AMap.LngLat(item.position[0], item.position[1]))
    if (openInfoMarker) openInfoMarker.setzIndex(100)
    marker.setzIndex(9999)
    openInfoMarker = marker
}

export function closeInfoWindow() {
    let popInfo = getInfoWindow()
    popInfo.close()
}
