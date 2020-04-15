import { setParams, executeEvent } from './utils'
import _ from 'lodash'

// 获取人员列表参数
const selectMemberListDefaultParams = {
    orgstructid: '',
    orgname: '',
    codepath: ''
}
setParams('selectMemberList', selectMemberListDefaultParams)

// 获取人员列表
export function selectMemberList(params) {
    setParams('selectMemberList', Object.assign(selectMemberListDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'selectmemberlist', this, 'data', (data) => {
            let originData = data.member
            resolve(originData)
        }, (error) => {
            reject(error)
        })
    })
}

// 获取组织列表参数
const getOrganizeListDefaultParams = {
    orgname: '',
    status: '1',
    orgstructtypeid: ''
}
setParams('getOrganizeList', getOrganizeListDefaultParams)

// 获取组织列表
export function getOrganizeList(params) {
    setParams('getOrganizeList', Object.assign(getOrganizeListDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'getorganizelist', this, 'data', (data) => {
            let originData = data.pl_salearea
            if (originData.length !== 0) {
                originData.forEach((orgInstData, index) => {
                    originData[index] = Object.assign({}, orgInstData, {
                        label: orgInstData.orgname,
                        text: orgInstData.orgname,
                        key: orgInstData.orgid,
                        realkey: orgInstData.orgid,
                        id: orgInstData.orgid,
                        parentid: orgInstData.parentorgid,
                        parentkey: orgInstData.parentorgid,
                        codepath: orgInstData.codepath
                    })
                })
            }
            resolve(originData)
        }, (error) => {
            reject(error)
        })
    })
}


// 转移提交参数
const transferSubmitDefaultParams = {
    lineid: '',
    userid: ''
}
setParams('transferSubmit', transferSubmitDefaultParams)

// 转移提交
export function transferSubmit(params) {
    setParams('transferSubmit', Object.assign(transferSubmitDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'transfersubmit', this, 'data', (data) => {
            let originData = data.__dataprocessresult
            resolve(originData)
        }, (error) => {
            reject(error)
        })
    })
}

// 应用字典查询参数
const searchOptionsDefaultParams = {
    dictionarycode: '',
    code: '',
    parentdickey: '',
    level: '',
    status: '1',
    objectmark: ''
}
setParams('searchOptions', searchOptionsDefaultParams)

// 应用字典查询
export function searchOptions(params) {
    setParams('searchOptions', Object.assign(searchOptionsDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'searchoptions', this, 'data', (data) => {
            let originData = data.pl_dictionary
            let resultData = []
            if (params.objectmark === 'kx_channeltype' || params.objectmark === 'kx_storelevel') {
                resultData = originData.map(item => ({ key: item.dickey, label: item.dicvalue }))
            } else if (params.objectmark === 'kx_storetype' || params.objectmark === 'kx_channelcustomertype') {
                resultData = originData.map(item => ({
                    label: item.dicvalue,
                    text: item.dicvalue,
                    key: item.dickey,
                    realkey: item.dickey,
                    id: item.dickey,
                    parentid: item.parentdictionaryid,
                    parentkey: item.parentdictionaryid,
                    codepath: item.keypath,
                    ischeck: false
                }))
            }
            resolve(resultData)
        }, (error) => {
            reject(error)
        })
    })
}

// 导入循环路线接口参数
const inputAroundRouteDefaultParams = {}
setParams('inputAroundRoute', inputAroundRouteDefaultParams)

// 导入循环路线
export function inputAroundRoute(params) {
    setParams('inputAroundRoute', Object.assign(inputAroundRouteDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'inputaroundroute', this, 'data', (data) => {
            resolve(data)
        }, (error) => {
            reject(error)
        })
    })
}

// 导出循环路线接口参数
const outputAroundRouteDefaultParams = {}
setParams('outputAroundRoute', outputAroundRouteDefaultParams)

// 导出循环路线
export function outputAroundRoute(params) {
    setParams('outputAroundRoute', Object.assign(outputAroundRouteDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'outputaroundroute', this, 'data', (data) => {
            resolve(data)
        }, (error) => {
            reject(error)
        })
    })
}

// 导入定期路线接口参数
const inputRegularRouteDefaultParams = {
    'orgname': ''
}
setParams('inputRegularRoute', inputRegularRouteDefaultParams)

// 导入定期路线
export function inputRegularRoute(params) {
    setParams('inputRegularRoute', Object.assign(inputRegularRouteDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'inputregularroute', this, 'data', (data) => {
            resolve(data)
        }, (error) => {
            reject(error)
        })
    })
}

// 导出定期路线接口参数
const outputRegularRouteDefaultParams = {
    'orgname': ''
}
setParams('outputRegularRoute', outputRegularRouteDefaultParams)

// 导出定期路线
export function outputRegularRoute(params) {
    setParams('outputRegularRoute', Object.assign(outputRegularRouteDefaultParams, params))
    return new Promise((resolve, reject) => {
        executeEvent.call(this, 'outputregularroute', this, 'data', (data) => {
            resolve(data)
        }, (error) => {
            reject(error)
        })
    })
}
