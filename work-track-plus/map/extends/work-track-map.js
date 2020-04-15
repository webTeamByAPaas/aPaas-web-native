import { CreateMap } from '../index'
import { _extends } from './utils'

import mockRealData from '../mock/realData'
import mockAnalyzeData from '../mock/moveData'
import mockPlanData from '../mock/planData'
import mockCustomerData from '../mock/customerData'

function findPoint(realData, startId, endId) {
    if (!startId || !endId) return null
    let index1 = realData.findIndex(item => item.id === startId)
    let index2 = realData.findIndex(item => item.id === endId)
    if (index1 < 0 || index2 < 0) return null
    return realData.slice(index1, index2 + 1)
}

export const WorkTrackMap = (function (_super) {
    _extends(WorkTrackMap, _super)

    function WorkTrackMap(id, opt) {
        this.realLine = null // 真实轨迹线路
        this.realLineCollection = new Set()
        this.realMarkers = [] // 实际路线点
        this.realDataIsShow = false
        this.heightLightLine = [] // 高亮线路

        this.planLine = null // 计划线路
        this.planLineCollection = new Set()
        this.planMarkers = [] // 计划路线点
        this.planDataIsShow = false

        this.customerMarkers = [] // 负责客户
        this.customerDataIsShow = false
        return _super.call(this, id, opt) || this
    }

    // 轨迹分析-实际路线
    WorkTrackMap.prototype.setRealData = async function (realData, analyzeData, isHide) {
        if (!realData) realData = JSON.parse(JSON.stringify(mockRealData))
        if (!analyzeData) analyzeData = JSON.parse(JSON.stringify(mockAnalyzeData))

        this.remove([...this.realLineCollection, ...this.heightLightLine.map(item => item.route), this.realMarkers])
        if (realData.length === 0) return
        this.realLineCollection.clear()
        // 构建点
        let realPointers = [...realData, ...analyzeData.filter(item => item.type === 6 && item.position.length > 0)] // 实际拜访路线的所有点
        this.realMarkers = this.createPoint(realPointers, isHide)
        this.realDataIsShow = !isHide

        // 构建路线
        let positions = realData.map(item => item.position)
        this.realLine = await this.createRoute(positions, null, isHide)
        this.realLineCollection.add(this.realLine)

        // 构建高亮路线
        let realMoves = analyzeData.filter(item => item.type === 3 || item.type === 4 || item.type === 5) // 移动
        let heightLineDataArr = []
        realMoves.forEach(item => {
            if (!item.startId || !item.endId) return
            try {
                let points = findPoint(realData, item.startId, item.endId)
                if (points && points.length > 1) {
                    heightLineDataArr.push({
                        uuid: item.uuid,
                        points,
                        type: item.type === 3 ? 'height_light' : 'grey'
                    })
                }
            } catch (e) {
                console.log(e)
                
            }
        })
        this.heightLightLine = []
        heightLineDataArr.forEach(async item => {
            let positions = item.points.map(_item => _item.position)
            let route = await this.createRoute(positions, item.type, true)
            this.realLineCollection.add(route)
            this.heightLightLine.push({ route, isShow: false, uuid: item.uuid })
        })
    }

    // 轨迹分析-计划路线
    WorkTrackMap.prototype.setPlanData = async function (planData, isHide) {
        if (!planData) planData = JSON.parse(JSON.stringify(mockPlanData))

        this.remove([...this.planLineCollection, this.planMarkers])
        if (planData.length === 0) return
        this.planLineCollection.clear()
        // 构建路线
        let positions = planData.map(item => item.position)
        this.planMarkers = this.createPoint(planData, isHide)
        this.planLine = await this.createSimpleRoute(positions, 'red', isHide)
        this.planLineCollection.add(this.planLine)
        this.planDataIsShow = !isHide
    }

    // 拜访对比-负责客户
    WorkTrackMap.prototype.setCustomerData = async function (customerData, isHide) {
        if (!customerData) customerData = JSON.parse(JSON.stringify(mockCustomerData))

        this.remove([this.customerMarkers])
        if (customerData.length === 0) return

        this.customerMarkers = this.createPoint(customerData, isHide)
        this.customerDataIsShow = !isHide
    }

    WorkTrackMap.prototype.showRealData = function () {
        if (this.realDataIsShow) return
        this.realDataIsShow = true
        this.realMarkers.forEach(item => {
            item.show()
        })
        if (this.realLine) this.realLine.show()
    }

    WorkTrackMap.prototype.hideRealData = function () {
        if (!this.realDataIsShow) return
        this.realDataIsShow = false
        this.realMarkers.forEach(item => {
            item.hide()
        })
        if (this.realLine) this.realLine.hide()
    }

    WorkTrackMap.prototype.showPlanData = function () {
        if (this.planDataIsShow) return
        this.planDataIsShow = true
        this.planMarkers.forEach(item => {
            item.show()
        })
        if (this.planLine) this.planLine.show()
    }

    WorkTrackMap.prototype.hidePlanData = function () {
        if (!this.planDataIsShow) return
        this.planDataIsShow = false
        this.planMarkers.forEach(item => {
            item.hide()
        })
        if (this.planLine) this.planLine.hide()
    }

    WorkTrackMap.prototype.showCustomerData = function () {
        if (this.customerDataIsShow) return
        this.customerDataIsShow = true
        this.customerMarkers.forEach(item => {
            item.show()
        })
    }

    WorkTrackMap.prototype.hideCustomerData = function () {
        if (!this.customerDataIsShow) return
        this.customerDataIsShow = false
        this.customerMarkers.forEach(item => {
            item.hide()
        })
    }

    WorkTrackMap.prototype.showHeightLightData = function (uuid) {
        let LineObj = this.heightLightLine.find(item => item.uuid === uuid)
        if (!LineObj) return
        if (LineObj.isShow) return
        if (LineObj.route) LineObj.route.show()
        LineObj.isShow = true
    }

    WorkTrackMap.prototype.hideHeightLightData = function (uuid) {
        let LineObj = this.heightLightLine.find(item => item.uuid === uuid)
        if (!LineObj) return
        if (!LineObj.isShow) return
        if (LineObj.route) LineObj.route.hide()
        LineObj.isShow = false
    }

    WorkTrackMap.prototype.showMarkerInfo = function (uuid) {
        let markerObj = this.realMarkers.find(item => {
            let extData = item.getExtData()
            if (!(typeof extData === 'object' && extData.uuid)) return false
            return extData.uuid === uuid
        })
        if (!markerObj) return
        this.AMap.event.trigger(markerObj, 'click', { target: markerObj })
    }

    return WorkTrackMap
}(CreateMap))

