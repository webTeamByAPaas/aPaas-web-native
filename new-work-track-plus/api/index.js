import { guid, setParams, executeEvent, isJsonString } from './utils'
import _ from 'lodash'
import { currentHHMM, currentFullTime, diffMM } from './dealdate'
import passiveData from '../map/mock/passiveData'

// 获取数据上报接口参数
const getWorkTrackDataDefaultParams = {
    date: '',
    memberid: '',
    showdwrecords: '1'
}
setParams('getWorkTrackData', getWorkTrackDataDefaultParams)

/*
* @desc 获取‘数据上报’ - 考勤，拜访等业务主动定位数据（业务相关）+ 被动定位数据（产品服务）
* api: resp_data: { kx_kq_store: [...] , kx_vist_actual: [...], ratio_axis}
* point type
* 0: 计划拜访点
* 1: 实际拜访点
* 2: 考勤点
* */
export function getWorkTrackData (params) {
    setParams('getWorkTrackData', Object.assign(getWorkTrackDataDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'getworktrackdata', this, 'data', (data) => {
            let originData = data.kx_visit_planvisit
            let planPoints = []
            let realPoints = []
            let routePoints = []
            if (originData.length > 0) {
                originData.forEach(item => {
                    let newItem
                    try {
                        item.picture && (item.picture = JSON.parse(item.picture))
                    } catch (e) {
                    }
                    try {
                        item.visitaddress && (item.visitaddress = JSON.parse(item.visitaddress))
                        if (!item.visitaddress.longitude || !item.visitaddress.latitude || isNaN(item.visitaddress.longitude) || isNaN(item.visitaddress.latitude)) {
                            throw new Error('longitude or latitude error')
                        }
                        item.position = [item.visitaddress.longitude, item.visitaddress.latitude]
                        item.address = item.visitaddress.address
                    } catch (e) {
                        item.position = []
                        item.address = ''
                    }
                    try {
                        item.visitcontent && (item.visitcontent = JSON.parse(item.visitcontent))
                    } catch (e) {

                    }
                    if (item.isvisit === 0) {
                        // 计划拜访
                        item.type = 0
                        item.axis_label = item.customerid__customername
                    } else if (item.visittime) {
                        // 除计划拜访外，都需要处理时间属性
                        item.timestamp = +item.visittime
                        item.timeHHMM = currentHHMM(item.timestamp)
                        item.fulltime = currentFullTime(item.timestamp)
                    }
                    if (item.isvisit === 1 && item.visittype === 1) {
                        // 实际拜访
                        item.type = 1
                        item.axis_label = item.customerid__customername
                        if (Array.isArray(item.visitcontent)) {
                            item.visitcontent.forEach(_item => {
                                _item.timeHHMM = currentHHMM(_item.time)
                            })
                        } else {
                            item.visitcontent = []
                        }
                    } else if (item.visittype === 2) {
                        item.type = 2
                    } else if (item.visittype === 3) {
                        item.type = 3
                    }

                    item.uuid = guid()
                    item.id = item.collectid
                    newItem = _.pick(item, ['id', 'uuid', 'axis_label', 'type', 'customerid', 'customertype', 'visitcontent', 'timestamp', 'timeHHMM', 'fulltime', 'position', 'address', 'visittype'])
                    if (item.type === 0) {
                        planPoints.push(newItem)
                    } else if (item.type === 1 || item.type === 2) {
                        realPoints.push(newItem)
                    }
                    if (item.type !== 0) {
                        routePoints.push(newItem)
                    }
                })
            }
            realPoints = _.sortBy(realPoints, ['timestamp'])
            let mileage = data.time_axis ? data.time_axis.mileage || '' : ''
            resolve({ planPoints, realPoints, routePoints, mileage })
        }, (error) => {
            reject(error)
        })
    })
}

/*
* @ desc 获取‘轨迹分析’数据 （产品服务数据 + 业务数据？）- 改造点
* api: resp_data: { kx_visit_daemonlocation: [...] , kx_visit_monitormember: {...} }
* point type：
* kx_visit_daemonlocation: 轨迹分析数据
* kx_visit_monitormember: 是否开启被动定位数据（监控标记）
* */
/*
* 修改同名接口flycode名 - 【getWorkTrackAnalyze】=> 【】
*/
const getWorkTrackAnalyzeDefaultParams = {
    collectdate: '',
    memberid: ''
}
setParams('getWorkTrackAnalyze', getWorkTrackAnalyzeDefaultParams)

// 获取轨迹分析列表
export function getWorkTrackAnalyze (params) {
    setParams('getWorkTrackAnalyze', Object.assign(getWorkTrackAnalyzeDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'getworktrackanalyze', this, 'data', (data) => {
            // data = JSON.parse(JSON.stringify(passiveData))
            /* 旧接口
            kx_visit_daemonlocation:{
                battery: '',// 电量
                endcollectidg: '',
                endlatlng: '',
                endtime: '1590467258000',
                latlng: '',
                reason: '应用不在运行中',
                startcollectid: '',
                startlatlng: '',
                starttime: '1590458722000',
                status: '不在线',
                time: "['1590458722000','1590467258000']",
            }
            新接口
                status 1. 不在线：用于记录开始点、结束点，有可能开始点和结束点为同一个数据 或者 没有数据
                status 2. 移动： 用于画轨迹线
                status 3 停留时，值记录这段时间中，定位点中的某一个点作为中心
                status 4. 定位失败时：与不在线处理一样
                status 5. 成功定位，只有一个数据点，一个时间点
            */
            let originData = data['pl_track_status'] // TODO: 修改点
            // let isMonitor = !!data.kx_visit_monitormember
            let isMonitor = true // 是否被监控
            let statusLabelMap = {
                '1': '不在线',
                '2': '移动',
                '3': '停留',
                '4': '定位异常',
                '5': '成功定位'
            }
            let newData = []
            if (originData.length > 0) {
                originData.forEach((item, index) => {
                    // 处理定位数据-状态图标
                    switch (item.status) {
                        case '2': // 移动
                            item.type = 3
                            break
                        case '1': // 不在线
                            item.type = 4
                            break
                        case '4': // 定位异常
                            item.type = 5
                            break
                        case '3': // 停留
                            item.type = 6
                            break
                        case '5': // 成功定位
                            item.type = 7
                            break
                        default:
                            return
                    }
                    // 处理定位数据-提交时间
                    try {
                        let timeArr = [item.starttime, item.endtime]
                        item.startTimestamp = timeArr[0]
                        item.startTimeHHMM = currentHHMM(timeArr[0])
                        item.endTimestamp = timeArr[1]
                        item.endTimeHHMM = currentHHMM(timeArr[1])
                        item.timediff = diffMM(timeArr[0], timeArr[1])
                        item.timeHHMM = `${item.startTimeHHMM} - ${item.endTimeHHMM}`
                    } catch (e) {
                        console.error('【定位数据时间值异常】', e.message)
                        return
                    }
                    // TODO：生成轨迹分析数据，后续还要拆分绘图坐标的，所以内部存储一份uuid
                    let points = []
                    try {
                        if (isJsonString(item.points)) {
                            points = JSON.parse(item.points)
                        } else {
                            points = item.points
                        }
                    } catch (e) {
                        console.error('【定位数据-points字段格式异常】', e.message)
                    }
                    item.pointDatas = points.map(point => {
                        let pointItem = {}
                        // 处理定位数据-坐标
                        try {
                            pointItem.uuid = guid()
                            pointItem.address = point.address || ''
                            pointItem.lat = point.lat || ''
                            pointItem.lng = point.lng || ''
                            pointItem.collecttime = point.collecttime
                            pointItem.pointid = point['pointid'] // TODO: 修改点
                        } catch (e) {
                            console.log('【定位数据坐标点异常】', e.message)
                            pointItem = null
                        }
                        return pointItem
                    }).filter(_ => _)
                    // 生成唯一id，用于绘图
                    item.uuid = guid()
                    // 处理定位数据-状态图标 + 地址信息
                    item.address = ''
                    item.position = []
                    try {
                        if (item.status === '1' || item.status === '2' || item.status === '4') {
                            // status : 2 , 多个坐标数据
                            // status : 1, 3， 两个坐标数据 或者 没有数据
                            if (item.pointDatas.length > 0) {
                                let len = item.pointDatas.length
                                item.address = [
                                    { address: item.pointDatas[0].address },
                                    { address: item.pointDatas[len - 1].address }
                                ]
                                item.position = [item.pointDatas[0].lng, item.pointDatas[len - 1].lat]
                            }
                        } else if (item.status === '3' || item.status === '5') {
                            // 只有一个坐标数据
                            if (item.pointDatas.length > 0) {
                                item.address = item.pointDatas[0].address
                                item.position = [item.pointDatas[0].lng, item.pointDatas[0].lat]
                            }
                        }
                    } catch (e) {
                        console.error('【定位数据坐标信息异常】', e.message)
                        return
                    }
                    // 处理定位数据-状态文本
                    item.axis_label = statusLabelMap[item.status]
                    // 处理定位数据-事件部分
                    let events = []
                    try {
                        if (isJsonString(item.events)) {
                            events = JSON.parse(item.events)
                        } else {
                            events = item.events
                        }
                    } catch (e) {
                        console.error('【定位数据-events字段格式异常】', e.message)
                    }
                    item.eventDatas = events.map(event => {
                        return event
                    })
                    let newItem = _.pick(item, ['uuid', 'startId', 'stateid', 'endId', 'axis_label', 'battery', 'status', 'type', 'reason', 'address', 'position', 'eventDatas', 'pointDatas',
                        'startTimestamp', 'startTimeHHMM', 'endTimestamp', 'endTimeHHMM', 'timediff', 'timeHHMM'])
                    newData.push(newItem)
                })
            }
            resolve({ data: newData, isMonitor })
        }, (error) => {
            reject(error)
        })
    })
}

/*
* 旧接口逻辑
* @ desc 获取‘轨迹分析’数据 （产品服务数据 + 业务数据？）
* api: resp_data: { kx_visit_daemonlocation: [...] , kx_visit_monitormember: {...} }
* point type：
* kx_visit_daemonlocation: 轨迹分析数据
* kx_visit_monitormember: 是否开启被动定位数据（监控标记）
* */
// const getWorkTrackAnalyzeDefaultParams = {
//     collecttime: '',
//     memberid: ''
// }
// setParams('getWorkTrackAnalyze', getWorkTrackAnalyzeDefaultParams)

// // 获取轨迹分析列表
// export function getWorkTrackAnalyze(params) {
//     setParams('getWorkTrackAnalyze', Object.assign(getWorkTrackAnalyzeDefaultParams, params))
//     return new Promise((resolve, reject) => {
//         executeEvent.call(this, 'getworktrackanalyze', this, 'data', (data) => {
//             let originData = data.kx_visit_daemonlocation
//             let isMonitor = !!data.kx_visit_monitormember
//             let newData = []
//             if (originData.length > 0) {
//                 originData.forEach((item, index) => {
//                     switch (item.status) {
//                         case '移动':
//                             item.type = 3
//                             break
//                         case '不在线':
//                             item.type = 4
//                             break
//                         case '定位异常':
//                             item.type = 5
//                             break
//                         case '停留':
//                             item.type = 6
//                             break
//                         default:
//                             return
//                     }
//                     item.axis_label = item.status
//                     try {
//                         let timeArr = JSON.parse(item.time)
//                         item.startTimestamp = timeArr[0]
//                         item.startTimeHHMM = currentHHMM(timeArr[0])
//                         item.endTimestamp = timeArr[1]
//                         item.endTimeHHMM = currentHHMM(timeArr[1])
//                         item.timediff = diffMM(timeArr[0], timeArr[1])
//                         item.timeHHMM = `${item.startTimeHHMM} - ${item.endTimeHHMM}`
//                     } catch (e) {
//                         console.log('deal time', e.message)
//                         return
//                     }
//                     try {
//                         let latlng = JSON.parse(item.latlng)
//                         if (Array.isArray(latlng)) {
//                             item.address = latlng
//                             item.position = latlng.map(_item => {
//                                 if (!_item.longitude || !_item.latitude) {
//                                     return []
//                                 }
//                                 return [_item.longitude, _item.latitude]
//                             })
//                         } else {
//                             if (!latlng.longitude || !latlng.latitude) {
//                                 item.position = []
//                             } else {
//                                 item.position = [latlng.longitude, latlng.latitude]
//                             }
//                             item.address = latlng.address
//                         }
//                     } catch (e) {
//                         console.log('deal latlng', e.message)
//                         item.position = []
//                         item.address = ''
//                         if (item.type === 3) {
//                             item.address = [{ address: '' }, { address: '' }]
//                         }
//                     }
//                     item.uuid = guid()
//                     item.startId = item.startcollectid
//                     item.endId = item.endcollectid
//                     let newItem = _.pick(item, ['uuid', 'startId', 'endId', 'axis_label', 'battery', 'status', 'type', 'reason', 'address', 'position',
//                         'startTimestamp', 'startTimeHHMM', 'endTimestamp', 'endTimeHHMM', 'timediff', 'timeHHMM'])
//                     newData.push(newItem)
//                 })
//             }
//             resolve({ data: newData, isMonitor })
//         }, (error) => {
//             reject(error)
//         })
//     })
// }

// 获拜访对比列表参数
const getCompareDataDefaultParams = {
    actualvisittime: `{"start":"1565712000000","end":"1568217600000"}`,
    userid: '1162192008916373504',
    isshowpresentative: ''
}
setParams('getCompareData', getCompareDataDefaultParams)

/*
* @ desc 获取‘拜访对比’数据 （业务相关）
* api: resp_data: { kx_kq_store: [...] , kx_vist_actual: [...], ratio_axis}
* point type：
* kx_kq_store: 拜访对比，负责客户 （特别影响性能，请求慢）
* kx_vist_actual: 拜访对比，实际拜访点
* ratio_axis: 拜访覆盖率数据
* */
export function getCompareData (params) {
    setParams('getCompareData', Object.assign(getCompareDataDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'getcomparedata', this, 'data', (data) => {
            let customerOriginData = data.kx_kq_store
            let customerData = []
            customerOriginData.forEach((item, index) => {
                try {
                    let info = JSON.parse(item.address)
                    if (!info.longitude || !info.latitude || isNaN(info.longitude) || isNaN(info.latitude)) {
                        throw new Error(`customerOriginData ${index}: longitude or latitude not found`)
                    }
                    customerData.push({
                        position: [info.longitude, info.latitude],
                        address: info.address,
                        name: item.storename,
                        axis_label: item.storename,
                        type: 7
                    })
                } catch (e) {
                    console.log(e.message)
                }
            })

            let realOriginData = data.kx_visit_actual
            let realData = []
            realOriginData.forEach((item, index) => {
                try {
                    let info = JSON.parse(item.customerid__address)
                    if (!info.longitude || !info.latitude || isNaN(info.longitude) || isNaN(info.latitude)) {
                        throw new Error(`realOriginData ${index}: longitude or latitude not found`)
                    }
                    realData.push({
                        position: [info.longitude, info.latitude],
                        address: info.address,
                        name: item.customerid__customername,
                        axis_label: item.customerid__customername,
                        type: 8,
                        id: item.customerid,
                        visitTimes: item.visit_num
                    })
                } catch (e) {
                    console.log(e.message)
                }
            })

            let visitCoverage = data.ratio_axis ? data.ratio_axis.visit_coverage : '0%'
            resolve({ customerData, realData, visitCoverage })
        }, (error) => {
            reject(error)
        })
    })
}

// 数据上报弹窗
const workTrackDetailDefaultParams = {
    userid: '',
    customerid: '',
    customertype: '',
    visitdate: '',
    visittype: ''
}
setParams('workTrackDetail', workTrackDetailDefaultParams)

// 数据上报弹窗
export function workTrackDetail (params) {
    setParams('workTrackDetail', Object.assign(workTrackDetailDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'worktrackdetail', this, 'data', () => {
            resolve()
        }, (error) => {
            reject(error)
        })
    })
}

// 数据上报弹窗
const configMapIconDefaultParams = {}
setParams('configMapIcon', configMapIconDefaultParams)

// 数据上报弹窗
export function configMapIcon (params) {
    setParams('configMapIcon', Object.assign(configMapIconDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'configmapicon', this, 'data', (data) => {
            console.log('configMapIcon', data)
            resolve()
        }, (error) => {
            reject(error)
        })
    })
}
