import { createRoute, createSimpleRoute } from './route/route'
import { createPoint, createMarkersByPoint, initPoint, closeInfoWindow } from './point/point'
import './icon/icon.less'

let AMap

export function CreateMap(id, opt = {}) {
    if (opt.plugins) {
        opt.plugins.push('AMap.MarkerClusterer')
    } else {
        opt.plugins = ['AMap.MarkerClusterer']
    }
    this.map = null // 地图实例对象
    let el = document.getElementById(id)
    return new Promise(async (resolve, reject) => {
        try {
            if (!AMap) {
                await checkAMapPromise()
                AMap = window.AMap
            }
            this.AMap = window.AMap
            initPoint.call(this)
            const centerPoint = new this.AMap.LngLat(113.319611, 23.13343)
            this.map = new this.AMap.Map(id, { zoom: 14, center: centerPoint })
            this.el = el
            const plugins = opt.plugins ? opt.plugins.map(item => pluginPromise.call(this.map, item)) : []
            await Promise.all(plugins)

            // this.AMap.event.addListener(this.map, 'moveend', () => {
            //     this.createMarkersByPoint(this.customerMarkers)
            // })
            // this.AMap.event.addListener(this.map, 'zoomend', () => {})
            // this.AMap.event.addListener(this.map, 'resize', () => {})
            resolve(this)
        } catch (e) {
            console.log(e)
            reject(new Error('AMap Not Found'))
        }
    })
}

function pluginPromise(str) {
    return new Promise((resolve, reject) => {
        this.plugin(str, function () {
            resolve()
        })
    })
}

function checkAMapPromise() {
    let times = 0

    function checkAMap(resolve, reject) {
        setTimeout(function () {
            if (window.AMap) {
                resolve()
            } else {
                if (times++ < 100) checkAMap(resolve, reject)
                else reject()
            }
        }, 100)
    }

    return new Promise((resolve, reject) => {
        checkAMap(resolve, reject)
    })
}

CreateMap.prototype.createRoute = createRoute
CreateMap.prototype.createSimpleRoute = createSimpleRoute
CreateMap.prototype.createPoint = createPoint
CreateMap.prototype.createMarkersByPoint = createMarkersByPoint
CreateMap.prototype.closeInfoWindow = closeInfoWindow
CreateMap.prototype.remove = function (items) {
    if (!items) return
    if (Array.isArray(items)) {
        items.forEach(item => {
            if (!item) return
            if (typeof item.hide === 'function') item.hide()
            this.map.remove(item)
        })
    } else {
        if (typeof items.hide === 'function') items.hide()
        this.map.remove(items)
    }
}
