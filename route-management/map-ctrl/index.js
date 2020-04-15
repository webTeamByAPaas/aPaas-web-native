import { selectMultiMarkerInit } from '../map/plugin/SelectMultiMarker/index'
import $ from 'jquery'
import './index.less'

export function initMap(map) {
    // map 是高德地图定位插件实例
    if (typeof this.callback === 'function') this.callback()
    this.AMapUI = window.AMapUI
    this.AMap = window.AMap
    this.map = map
    this.el = this.map.C
    map.plugin('AMap.MouseTool', () => {
        selectMultiMarkerInit.call(this, selectCallback.bind(this), {
            isShow: true,
            type: 'polygon',
            style: `right:16px;top:70px;`
        })
    })
    initWindowClickListener.call(this)
}

function initWindowClickListener() {
    // 地图添加移除客户
    let that = this
    let vm = that.vm
    $('.map-container').off('click.handleMultiCustomer').on('click.handleMultiCustomer', '.handle-multi-customer-btn', function () {
        let customers = that.selectCustomers
        if (!customers || !customers.length) return
        if (vm.filterCustomer.isInline === '1') { // 当前地图显示已添加客户，点击的是移除按钮
            vm.customerDelete(customers)
        } else { // 当前地图显示未添加客户，点击的是添加按钮
            vm.customerAdd(customers)
        }
        if (that.infoWindow) that.infoWindow.close()
    })
}

function selectCallback(selectMarkers, positions) {
    if (selectMarkers.length === 0) return
    let customers = selectMarkers.map(item => item.extData)
    let customerNames = customers.map(item => item.customername)
    this.selectCustomers = customers
    showWindow.call(this, customerNames, positions[positions.length - 1])
}

function showWindow(customerNames, position) {
    let state = this.vm.filterCustomer.isInline === '1' ? '移除' : '添加'
    this.AMapUI.loadUI(['overlay/SimpleInfoWindow'], SimpleInfoWindow => {
        let infoWindowOptions = {
            infoTitle: '',
            infoBody: `
                <div class="select-markers-info-window-container">
                    <p>是否${state}：${customerNames.join(', ')}?</p>
                    <span class="btn-add handle-multi-customer-btn">${state}</span>
                </div>`
        }
        let infoWindow = new SimpleInfoWindow(infoWindowOptions)
        let lnglat = new this.AMap.LngLat(position[0], position[1])
        infoWindow.open(this.map, lnglat)
        this.infoWindow = infoWindow
    })
}
