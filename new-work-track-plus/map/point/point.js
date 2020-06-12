import { getContent } from './template'

let getInfoWindow
let zIndex = 101
let openInfoMarker

export function initPoint () {
    getInfoWindow = initInfoWindow.call(this)
}

// 信息窗体单例
function initInfoWindow () {
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

    function get () {
        return single
    }

    return get
}

// @ 创建点标记
export function createPoint (data, isHide) {
    let num = 1
    let markers = []
    // TODO：data数量超过200已经会有明显卡顿感了。
    data.forEach(item => {
        if (item.position.length < 2) return
        // 被动定位类型参与画线，但不建立标记物
        if (item.type === 3) return
        if (item.type === 8) num = item.visitTimes
        // 标记物叠加顺序
        let zIndex = 100
        if (item.type === 99 || item.type === 100) {
            zIndex = 102
        }
        if (item.type === 1 || item.type === 0) {
            zIndex = 101
        }
        let marker = new this.AMap.Marker(Object.assign(getContent.call(this, item.type, num), {
            map: this.map,
            position: new this.AMap.LngLat(item.position[0], item.position[1]),
            extData: item,
            visible: !isHide,
            zIndex: zIndex
        }))
        this.AMap.event.addListener(marker, 'click', e => {
            openInfoWindow.call(this, e.target)
        })

        markers.push(marker)
        if (item.type === 1 || item.type === 0) num++
    })
    return markers
}

let count = 200
// @ 自定义点聚合样式
var _renderClusterMarker = function (context, thisAMap) {
    var factor = Math.pow(context.count / count, 1 / 18)
    var div = document.createElement('div')
    var Hue = 180 - factor * 180
    var bgColor = 'hsla(' + Hue + ',100%,40%,0.7)'
    var fontColor = 'hsla(' + Hue + ',100%,90%,1)'
    var borderColor = 'hsla(' + Hue + ',100%,40%,1)'
    var shadowColor = 'hsla(' + Hue + ',100%,90%,1)'
    div.style.backgroundColor = bgColor
    var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20)
    div.style.width = div.style.height = size + 'px'
    div.style.border = 'solid 1px ' + borderColor
    div.style.borderRadius = size / 2 + 'px'
    div.style.boxShadow = '0 0 5px ' + shadowColor
    div.innerHTML = context.count
    div.style.lineHeight = size + 'px'
    div.style.color = fontColor
    div.style.fontSize = '14px'
    div.style.textAlign = 'center'
    context.marker.setOffset(new thisAMap.Pixel(-size / 2, -size / 2))
    context.marker.setContent(div)
}
var _renderMarker = function (context, thisAMap) {
    var content = '<div style="background-color: hsla(180, 100%, 50%, 0.3); height: 18px; width: 18px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 3px;"></div>'
    var offset = new thisAMap.Pixel(-9, -9)
    context.marker.setContent(content)
    context.marker.setOffset(offset)
}

// @ 标记点聚合处理
export function createMarkersByPoint (data) {
    let now_bounds = this.map.getBounds()
    let markers = this.createPoint(data)
    let _this = this
    count = data.length
    let cluster = new this.AMap.MarkerClusterer(this.map, markers, {
        gridSize: 80,
        renderClusterMarker: function (context) { _renderClusterMarker(context, _this.AMap) }, // 自定义聚合点样式
        renderMarker: function (context) { _renderMarker(context, _this.AMap) }, // 自定义非聚合点样式
        minClusterSize: 1,
        maxZoom: 14
    })
    return cluster
    // for (let item in data) {

    // }
}

// 信息窗体内容
function getInfoWindowContent (params = {}) {
    let { label, time, address } = params
    let arr = []
    if (time) arr.push(`<p>时间：${time}</p>`)
    if (address) arr.push(`<p>地点：${address}</p>`)
    return `<div class="amapplus-window-content">
                <h3>${label}</h3>
                <div class="content">
                ${arr.join('')}
                </div>
            </div>`
}

export function openInfoWindow (marker) {
    let item = marker.getExtData()
    if (item.position.length < 2) return
    let popInfo = getInfoWindow()
    let content = {
        label: item.axis_label,
        address: item.address
    }
    if (item.timeHHMM) {
        content['time'] = item.timeHHMM
    }
    popInfo.setContent(getInfoWindowContent(content))
    popInfo.open(this.map, new this.AMap.LngLat(item.position[0], item.position[1]))
    if (openInfoMarker) openInfoMarker.setzIndex(100)
    marker.setzIndex(9999)
    openInfoMarker = marker
}

export function closeInfoWindow () {
    let popInfo = getInfoWindow()
    popInfo.close()
}
