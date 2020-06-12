import { CreateMap } from '../index'
import { _extends, deepCopy} from './utils'

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
        if (realData.length === 0 && analyzeData.length === 0) return
        this.realLineCollection.clear()
        // 构建点
        // analyzeData中停留点数据参与建立标记物
        // 实际拜访路线的所有点
        // 构建起点
        let startPointer
        let endPointer
        if (analyzeData.length > 0) {
            startPointer = deepCopy(analyzeData[0])
            startPointer.axis_label = '起点'
            startPointer.timeHHMM = ''
            startPointer.uuid = startPointer.uuid + '-start'
            startPointer.type = 99
        }
        let realPointers = [startPointer, ...realData, ...analyzeData.filter(item => item.type === 6 && item.position.length > 0)]
        // 构建终点
        if (analyzeData.length > 0) {
            let len = analyzeData.length
            endPointer = deepCopy(analyzeData[len - 1])
            endPointer.axis_label = '终点'
            endPointer.timeHHMM = ''
            endPointer.uuid = endPointer.uuid + '-end'
            endPointer.type = 100
            realPointers.push(endPointer)
        }
        this.realMarkers = this.createPoint(realPointers, isHide)
        this.realDataIsShow = !isHide

        // 处理[不在线&定位异常】情况下，绘线坐标点
        let offline = []
        let s = []
        let e = []
        // TODO：
        // 绘灰色线逻辑，起点定位点是‘不在线’或者‘定位异常’，终点是‘移动’或‘其他成功状态’
        analyzeData.forEach(item => {
            if (s.length === 0 && (item.type === 4 || item.type === 5)) {
                s = item.position
            }
            if (s.length > 0 && item.type !== 4 && item.type !== 5) {
                e = item.position
            }
            if (s.length > 0 && e.length > 0) {
                offline.push(deepCopy(s))
                offline.push(deepCopy(e))
                s = []
                e = []
            }
        })
        // 构建路线
        // analyzeData中定位数据参与路线绘制
        // TODO：被定定位数据画线
        let positions = [
            ...analyzeData.filter(item => item.position && item.position.length > 0)
        ].map(item => item.position)
        // this.realLine = await this.createRoute(positions, null, isHide)
        this.realLine = await this.createSimpleRoute(positions, '#5e8de9', isHide)
        this.realLineCollection.add(this.realLine)
        // TODO：业务数据画线
        let businessPositions = [...realData].map(item => item.position)
        let businessLine = await this.createSimpleRoute(businessPositions, '#5e8de9', isHide)
        this.realLineCollection.add(businessLine)
        // TODO：异常数据画线
        let greyLine = await this.createSimpleRoute(offline, 'grey', isHide)
        this.realLineCollection.add(greyLine)

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
            // let route = await this.createRoute(positions, item.type, true)
            let route = await this.createSimpleRoute(positions, '#5e8de9', true)
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
        // if (!customerData) customerData = JSON.parse(JSON.stringify(mockCustomerData))
        this.remove([this.customerMarkers])
        if (customerData.length === 0) return

        // customerData大量数据
        console.time('createPoint-customerData')
        // this.customerMarkers = this.createPoint(customerData, isHide)
        this.customerMarkers = this.createMarkersByPoint(customerData)
        // -----
        // let positions = customerData.map(item => item.position)
        // this.planLine = await this.createSimpleRoute(positions, 'red', false)
        // ---
        console.time('createPoint-customerData')
        console.log('isHide')
        console.log(isHide)
        this.customerDataIsShow = isHide
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

    WorkTrackMap.prototype.showCustomerData = function (mapObj) {
        // if (this.customerDataIsShow) return
        // this.customerDataIsShow = true
        // this.customerMarkers.forEach(item => {
        //     item.show()
        // })
        // this.customerMarkers = this.createMarkersByPoint(this.tempCustomerPoints)
        // this.customerMarkers = this.tempCustomerMarkers
        // this.tempCustomerMarkers = null
        this.customerMarkers.setMap && this.customerMarkers.setMap(mapObj)
    }

    WorkTrackMap.prototype.hideCustomerData = function () {
        // if (!this.customerDataIsShow) return
        // this.customerDataIsShow = false
        // this.customerMarkers.forEach(item => {
        //     item.hide()
        // })
        // this.tempCustomerMarkers = this.customerMarkers
        this.customerMarkers.setMap && this.customerMarkers.setMap(null)
    }
    // @ 清除地图数据
    WorkTrackMap.prototype.clearMapData = function (mapObj) {
        mapObj.remove(this.customerMarkers)
        // mapObj.clearMarkers()
        mapObj.clearMap()
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

