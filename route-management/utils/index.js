/**
 * @desc 该js导出该模块公用的一些固定数据与工具方法，固定数据放置在前面，工具方法放在后面
 */
/* 固定数据-start */
// 地图使用数据zoom
const zoomArr = [
    { zoom: 18, distance: 0.05, px: 88 },
    { zoom: 17, distance: 0.1, px: 88 },
    { zoom: 16, distance: 0.2, px: 88 },
    { zoom: 15, distance: 0.2, px: 45 },
    { zoom: 14, distance: 0.5, px: 56 },
    { zoom: 13, distance: 1, px: 56 },
    { zoom: 12, distance: 2, px: 56 },
    { zoom: 11, distance: 5, px: 69 },
    { zoom: 10, distance: 10, px: 69 },
    { zoom: 9, distance: 20, px: 69 },
    { zoom: 8, distance: 50, px: 86 },
    { zoom: 7, distance: 100, px: 86 },
    { zoom: 6, distance: 100, px: 43 },
    { zoom: 5, distance: 200, px: 42 },
    { zoom: 4, distance: 500, px: 52 },
    { zoom: 3, distance: 1000, px: 58 }
]
const dayStruct = [
    {
        value: '1',
        label: '星期一'
    }, {
        value: '2',
        label: '星期二'
    }, {
        value: '3',
        label: '星期三'
    }, {
        value: '4',
        label: '星期四'
    }, {
        value: '5',
        label: '星期五'
    }, {
        value: '6',
        label: '星期六'
    }, {
        value: '0',
        label: '星期日'
    }
]
/*
* @desc 客户拜访频率下拉框前端数据格式
 */
const frequencyOptions = [
    {
        title: '每周期一访',
        options: [
            {
                value: '1',
                label: '第一个周期'
            }
        ]
    }, {
        title: '每两个周期一访',
        options: [
            {
                value: '2',
                label: '第一个周期'
            }, {
                value: '3',
                label: '第二个周期'
            }
        ]
    }, {
        title: '每三个周期一访',
        options: [
            {
                value: '4',
                label: '第一个周期'
            }, {
                value: '5',
                label: '第二个周期'
            }, {
                value: '6',
                label: '第三个周期'
            }
        ]
    }, {
        title: '每四个周期一访',
        options: [
            {
                value: '7',
                label: '第一个周期'
            }, {
                value: '8',
                label: '第二个周期'
            }, {
                value: '9',
                label: '第三个周期'
            }, {
                value: '10',
                label: '第四个周期'
            }
        ]
    }
]
/* 固定数据-end */
/* 工具方法-start */
/*
*@desc 数组结构数据构建树结构
*@param {Array} data 数组结构数据
*/
function CreateTree (data) {
  this.treeData = data || []
  this.dataGroups = {}
  this.roots_id = []
}
CreateTree.prototype = {
  init: function (idName, pidName, labelName) {
      this.group(idName, pidName, labelName)
      return this.getDom(this.dataGroups['root'], idName)
  },
  group: function (idName, pidName, labelName) {
      // 1、抽取所有数据的pid标识组成一个对象结构，pid对应 其children
      for (var i = 0; i < this.treeData.length; i++) {
          if (this.treeData[i][pidName] === null || this.treeData[i][pidName] === '') {
              if (!this.dataGroups['root']) {
                  this.roots_id.push('root')
                  this.dataGroups['root'] = []
              }
              this.dataGroups['root'].push(this.treeData[i])
          } else if (this.dataGroups[this.treeData[i][pidName]]) {
              this.dataGroups[this.treeData[i][pidName]].push(this.treeData[i])
          } else {
              this.roots_id.push(this.treeData[i][pidName])
              this.dataGroups[this.treeData[i][pidName]] = []
              this.dataGroups[this.treeData[i][pidName]].push(this.treeData[i])
          }
      }
      // 2、检索出对应id不在数据中的pid
      this.roots_id = this.roots_id.filter((pid) => {
          for (let item of this.treeData) {
              if (pid === item[idName]) {
                  return false
              }
          }
          return true
      })
      // 3、对应id不在数据中的pid标记为root，作为树的根节点
      for (let pid of this.roots_id) {
          if (pid === 'root') {
              continue
          }
          if (!this.dataGroups['root']) {
              this.dataGroups['root'] = []
          }
          for (let item of this.dataGroups[pid]) {
              this.dataGroups['root'].push(item)
          }
          delete this.dataGroups[pid]
      }
  },
  // @递归组装数据
  getDom: function (a, idName) {
      if (!a) {
          return []
      }
      var result = []
      for (var i = 0; i < a.length; i++) {
          var val = this.getDom(this.dataGroups[a[i][idName]], idName)
          a[i].children = val
          result.push(a[i])
      }
      return result
  }
}
/*
* @desc 拜访频率前端使用数据跟后台保存的数据格式不一样，需要转化，此方法根据传入的参数的个数，判断是将前端数据格式转化成后端数据，还是将后端数据格式转化成前端数据格式
*       前端用一个字段保存：custom_frequency(1-每周期一访,2-每两个周期一访第一个周期，3-……具体对应值参考frequencyOptions),
*       后端使用两个字段保存：tn_frequency（周期：1-每一周，2-每两周，3-每三周，4-每四周）， tn_visitnum（访期：1-第一周访，2-第二周访，3-第三周访，4-第四周访）
* @param {String} frequency 周期
* @param {String} visitnum 周期
* @return {Object|String} {frequency: String, visitnum: String} or String(custom_frequency)
 */
const parseFrequency = (frequency, visitnum) => {
    let ret = ''
    if (!visitnum) {
        ret = {}
        switch (frequency) {
            case '1':
                ret.frequency = '1'
                ret.visitnum = '1'
                break
            case '2':
                ret.frequency = '2'
                ret.visitnum = '1'
                break
            case '3':
                ret.frequency = '2'
                ret.visitnum = '2'
                break
            case '4':
                ret.frequency = '3'
                ret.visitnum = '1'
                break
            case '5':
                ret.frequency = '3'
                ret.visitnum = '2'
                break
            case '6':
                ret.frequency = '3'
                ret.visitnum = '3'
                break
            case '7':
                ret.frequency = '4'
                ret.visitnum = '1'
                break
            case '8':
                ret.frequency = '4'
                ret.visitnum = '2'
                break
            case '9':
                ret.frequency = '4'
                ret.visitnum = '3'
                break
            case '10':
                ret.frequency = '4'
                ret.visitnum = '4'
                break
        }
    } else {
        if (frequency === '1') {
            ret = '1'
        } else if (frequency === '2') {
            switch (visitnum) {
                case '1':
                    ret = '2'
                    break
                case '2':
                    ret = '3'
                    break
            }
        } else if (frequency === '3') {
            switch (visitnum) {
                case '1':
                    ret = '4'
                    break
                case '2':
                    ret = '5'
                    break
                case '3':
                    ret = '6'
                    break
            }
        } else if (frequency === '4') {
            switch (visitnum) {
                case '1':
                    ret = '7'
                    break
                case '2':
                    ret = '8'
                    break
                case '3':
                    ret = '9'
                    break
                case '4':
                    ret = '10'
                    break
            }
        }
    }
    return ret
}
/*
* @desc 对象(或数组)深拷贝
* @param {Object, Array} obj 待拷贝的对象或数组
* @return 传入的对象或数组的副本
*/
const deepCopy = obj => {
    let i
    let ret
    if (obj instanceof Array) {
      ret = []
      for (i in obj) {
        let temp = typeof obj[i] === 'object' ? (obj[i] ? deepCopy(obj[i]) : null) : obj[i]
        ret.push(temp)
      }
    } else {
      ret = {}
      for (i in obj) {
          ret[i] = typeof obj[i] === 'object' ? (obj[i] ? deepCopy(obj[i]) : null) : obj[i]
      }
    }
    return ret
  }
// 格式化时间戳 dateFormat('y-m-d h:i:s',144423424242)
const dateFormat = function(fmt, ts) {
    ts = typeof ts === 'string' ? parseInt(ts) : ts
    let date = new Date(ts)

    function pad(value) {
        return (value.toString().length < 2) ? '0' + value : value
    }
    return fmt.replace(/([a-zA-Z])/g, function(_, fmtCode) {
        switch (fmtCode) {
            case 'y':
                return date.getFullYear()
            case 'm':
                return pad(date.getMonth() + 1)
            case 'd':
                return pad(date.getDate())
            case 'D':
                let dd = ['日', '一', '二', '三', '四', '五', '六']
                return dd[date.getDay()]
            case 'h':
                return pad(date.getHours())
            case 'i':
                return pad(date.getMinutes())
            case 's':
                return pad(date.getSeconds())
        }
    })
}
/**
 * @desc 构造函数，获取一周里的各种信息，使用时创建实例后需调用init方法后才可用实例中的其它方法（如 new GetWeek().init().getWeekType()）
 *  */
function GetWeek() {
    this.nowTime = new Date()
    this.init = function() {
        this.dayInWeek = this.nowTime.getDay()
        this.dayInWeek === 0 && (this.dayInWeek = 7)
        this.thisWeekFirstDay = this.nowTime.getTime() - (this.dayInWeek - 1) * 86400000
        this.thisWeekLastDay = this.nowTime.getTime() + (7 - this.dayInWeek) * 86400000
        return this
    }
    /**
     * @desc 获取某一周周一至周日日期字符串
     * @param {Number} 如果不传参数 或者传入0，返回的是本周的日期范围，如果要下周的范围则传入1，上周的传入-1；<br>注：这个是从周一开始算一周的开始，周日为结束
     * @return {String} 如'2019-04-07至2019-04-13'
     *  */
    this.getWeekType = function(type) {
        type = ~~type
        var firstDay = this.thisWeekFirstDay + type * 7 * 86400000
        var lastDay = this.thisWeekLastDay + type * 7 * 86400000
        return this.getWeekHtml(firstDay, lastDay)
    }
    /**
     * @desc 获取某一周周一和周日的日期
     * @param {Number} 如果不传参数 或者传入0，返回的是本周的日期范围，如果要下周的范围则传入1，上周的传入-1；<br>注：这个是从周一开始算一周的开始，周日为结束
     * @return {Object} 如{firstDay: '2019-04-07', lastDay: '2019-04-13'}
     *  */
    this.getWeekDayInfo = function(type) {
        type = ~~type
        var firstDay = this.thisWeekFirstDay + type * 7 * 86400000
        var lastDay = this.thisWeekLastDay + type * 7 * 86400000
        return {
            firstDay: this.formateDate(firstDay),
            lastDay: this.formateDate(lastDay)
        }
    }
    /**
     * @desc 获取某一周周一至周日七天日期组成的数组
     * @param {Number} 如果不传参数 或者传入0，返回的是本周的日期范围，如果要下周的范围则传入1，上周的传入-1；<br>注：这个是从周一开始算一周的开始，周日为结束
     * @return {Object} 如['2019-04-07', '2019-04-08', '2019-04-09', '2019-04-10', '2019-04-11', '2019-04-12', '2019-04-13']
     *  */
    this.getWeekDayDateArray = function(type) {
        let ret = []
        type = ~~type
        var firstDay = this.thisWeekFirstDay + type * 7 * 86400000
        for (let i = 0; i < 7; i++) {
            let temp = this.formateDate(firstDay + i * 86400000)
            ret.push(temp)
        }
        return ret
    }
    this.formateDate = function(time) {
        var newTime = new Date(time)
        var year = newTime.getFullYear()
        var month = newTime.getMonth() + 1
        var day = newTime.getDate()
        return year + '-' + (month >= 10 ? month : '0' + month) + '-' + (day >= 10 ? day : '0' + day)
    }
    this.getWeekHtml = function(f, l) {
        return this.formateDate(f) + '至' + this.formateDate(l)
    }
}
// 获取某月的天数
const getMonthDayCount = (year, month) => {
    let date = new Date(year, month, 0)
    return date.getDate()
}
/**
 * @desc 将客户信息的地址信息格式化
 * @param {Array} customers 客户列表
 * @rerun {Array} 格式化地址信息的客户列表
 */
const formatterAddressInfo = customers => {
    let ret = []
    customers.forEach((customer, index) => {
        // 兼容地址信息为空的情况
        let addressInfo = customer.address ? JSON.parse(customer.address) : {}
        let { longitude, latitude } = addressInfo

        if (longitude && !isNaN(longitude) && latitude && !isNaN(latitude)) {
            let temp = {
                address: addressInfo.address,
                coordinate: [
                    parseFloat(addressInfo.longitude),
                    parseFloat(addressInfo.latitude)
                ]
            }
            for (let i in customer) {
                if (i !== 'address') {
                    temp[i] = customer[i]
                }
            }
            ret.push(temp)
        }
    })
    // 对客户按照seq排序，防止地图路线显示错误
    ret.sort(function(a, b) {
        if (!a.seq || !b.seq) {
            return -1
        } else {
            return parseInt(a.seq) - parseInt(b.seq)
        }
    })
    return ret
}
/**
 * @desc 计算所有坐标点的中心点
 * @param {Array} coordinates 经纬度坐标点
 * @return {Array} 中心点坐标点
 */
const getCenterPoint = coordinates => {
    let total = coordinates.length
    let lng = 0
    let lat = 0

    coordinates.forEach((coordinate) => {
        lng += coordinate[0] * Math.PI / 180
        lat += coordinate[1] * Math.PI / 180
    })
    lng = lng / total * 180 / Math.PI
    lat = lat / total * 180 / Math.PI
    return [lng, lat]
}
/**
 * @desc 计算坐标中，所有点中最大距离两点的距离
 * @param {Array} coordinates 所有坐标
 * @return {Number} 最大距离两点的距离
 */
const getMaxDistance = coordinates => {
    let maxDistance = 0
    coordinates.forEach(coordinate1 => {
        coordinates.forEach(coordinate2 => {
            let distance = getDistance(coordinate1, coordinate2)
            if (parseFloat(distance) > parseFloat(maxDistance)) {
                maxDistance = distance
            }
        })
    })
    return maxDistance
}
/**
 * @desc 计算两经纬度坐标间的距离
 * @param {Array} coordinate1 第一点的纬度，经度坐标
 * @param {Array} coordinate2 第一点的纬度，经度坐标
 * @return {Number} 距离
 */
const getDistance = (coordinate1, coordinate2) => { // lat1, lng1, lat2, lng2
    let radLat1 = rad(coordinate1[1])
    let radLat2 = rad(coordinate2[1])
    let a = radLat1 - radLat2
    let b = rad(coordinate1[0]) - rad(coordinate2[0])
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
    s = s * 6378.137 // EARTH_RADIUS
    s = Math.round(s * 10000) / 10000 // 输出为公里
    s = s.toFixed(4)
    return s
}
/**
 * @desc 进行经纬度转换为距离的计算
 * @param {Number} d 经度或者纬度(经纬度坐标中[x,y]中的x或y)
 * @return 经纬度转换成三角函数中度分表形式
 */
const rad = d => {
    return d * Math.PI / 180.0 // 。
}
/**
 * @desc 根据stype的值查找节点及改节点的祖先节点id
 *       stype === '0' :深度优先遍历组织树，直到找到节点为人员的节点并返回该节点及改节点的所有祖先节点的orgstructid
 *       其中，人员节点用于设置组织树默认节点值，祖先节点用于设置组织树默认展开节点
 *       stype === '1' || stype === '1':找到第一个节点的最深子节点并返回该节点及改节点的所有祖先节点的orgstructid
 *       其中，人员节点用于设置组织树默认节点值，祖先节点用于设置组织树默认展开节点
 * @param {Array} treeData 组织树数据
 * @param {Array} defaultExpandedKeys 初始祖先节点的orgstructid组成的数组
 * @param {String} stype 根据这个值判断是找节点为人的节点还是找第一个节点的最深子节点
 * @return {Object} {defaultOrgStruct: Object(节点), defaultExpandedKeys: Array（祖先节点的orgstructid组成的数组）}
 */
const getDefaultTreeSetInfo = (treeData, defaultExpandedKeys, stype) => {
    let ret = {
        defaultOrgStruct: {},
        defaultExpandedKeys: defaultExpandedKeys
    }
    for (let node of treeData) {
        if (stype === '0') {
            if ((node.isorg + '') === '0') {
                ret.defaultOrgStruct = node
                ret.defaultExpandedKeys = defaultExpandedKeys
                break
            } else if (node.children && node.children.length > 0) {
                let defaultExpandedKeys = deepCopy(ret.defaultExpandedKeys)
                defaultExpandedKeys.push(node.orgstructid)
                ret = getDefaultTreeSetInfo(node.children, defaultExpandedKeys)
                if (ret.defaultOrgStruct.orgstructid) {
                    break
                }
            }
        } else {
            if (!node.children || node.children && node.children.length === 0) {
                ret.defaultOrgStruct = node
                ret.defaultExpandedKeys = defaultExpandedKeys
                break
            } else if (node.children && node.children.length > 0) {
                let defaultExpandedKeys = deepCopy(ret.defaultExpandedKeys)
                defaultExpandedKeys.push(node.orgstructid)
                ret = getDefaultTreeSetInfo(node.children, defaultExpandedKeys, stype)
                if (ret.defaultOrgStruct.orgstructid) {
                    break
                }
            }
        }
    }
    return ret
}
// 处理错误信息
const errorMessage = (vue, error) => {
    let msg = (error.body && error.body.error_code) || error.statusText || error
    vue.$message.error(msg)
}
/* 工具方法-end */

export {
    zoomArr,
    dayStruct,
    parseFrequency,
    CreateTree,
    frequencyOptions,
    deepCopy,
    dateFormat,
    GetWeek,
    getMonthDayCount,
    formatterAddressInfo,
    getCenterPoint,
    getMaxDistance,
    getDistance,
    rad,
    getDefaultTreeSetInfo,
    errorMessage
}
