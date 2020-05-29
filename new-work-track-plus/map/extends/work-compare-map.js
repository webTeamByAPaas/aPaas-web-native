import { CreateMap } from '../index'
import { _extends } from './utils'

import mockRealData from '../mock/customerRealData'
import mockCustomerData from '../mock/customerData'

export const WorkCompareMap = (function (_super) {
    _extends(WorkCompareMap, _super)

    function WorkCompareMap (id, opt) {
        this.realMarkers = [] // 实际拜访客户标志
        this.realDataIsShow = false
        this.customerMarkers = [] // 负责客户标志
        this.customerDataIsShow = false
        return _super.call(this, id, opt) || this
    }

    // 拜访对比-实际拜访客户
    WorkCompareMap.prototype.setRealData = async function (realData, isHide) {
        if (!realData) realData = JSON.parse(JSON.stringify(mockRealData))
        this.remove([this.realMarkers])

        this.realMarkers = this.createPoint(realData, isHide)
        this.realDataIsShow = !isHide
    }

    // 拜访对比-负责客户
    WorkCompareMap.prototype.setCustomerData = async function (customerData, isHide) {
        if (!customerData) customerData = JSON.parse(JSON.stringify(mockCustomerData))
        this.remove([this.customerMarkers])

        // this.customerMarkers = this.createPoint(customerData, isHide)
        this.customerMarkers = this.createMarkersByPoint(customerData, isHide)
        this.customerDataIsShow = !isHide
    }

    WorkCompareMap.prototype.showRealData = function () {
        if (this.realDataIsShow) return
        this.realDataIsShow = true
        this.realMarkers.forEach(item => {
            item.show()
        })
    }

    WorkCompareMap.prototype.hideRealData = function () {
        // if (!this.realDataIsShow) return
        // this.realDataIsShow = false
        // this.realMarkers.forEach(item => {
        //     item.hide()
        // })
    }

    WorkCompareMap.prototype.showCustomerData = function (mapObj) {
        // if (this.customerDataIsShow) return
        // this.customerDataIsShow = true
        // this.customerMarkers.forEach(item => {
        //     item.show()
        // })
        this.customerMarkers.setMap(mapObj)
    }

    WorkCompareMap.prototype.hideCustomerData = function () {
        // if (!this.customerDataIsShow) return
        // this.customerDataIsShow = false
        // this.customerMarkers.forEach(item => {
        //     item.hide()
        // })
        this.customerMarkers.setMap(null)
    }

    // @ 清除地图数据
    WorkCompareMap.prototype.clearMapData = function (mapObj) {
        mapObj.remove(this.customerMarkers)
        // mapObj.clearMarkers()
        mapObj.clearMap()
    }

    return WorkCompareMap
}(CreateMap))

