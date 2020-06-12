export const _extends = (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) {
                d.__proto__ = b
            }) ||
            function (d, b) {
                for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
            }
        return extendStatics(d, b)
    }
    return function (d, b) {
        extendStatics(d, b)

        function __() {
            this.constructor = d
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __())
    }
})()

/**
* @desc 对象(或数组)深拷贝
* @param {Object,Array} obj 待拷贝的对象或数组
* @return 传入的对象或数组的副本
**/
export const deepCopy = obj => {
    let i
    let ret
    if (obj instanceof Array) {
        ret = []
        for (i in obj) {
            if (typeof obj[i] === 'object') {
                if (obj[i]) {
                    ret.push(deepCopy(obj[i]))
                } else {
                    ret.push(null)
                }
            } else {
                ret.push(obj[i])
            }
        }
    } else {
        ret = {}
        for (i in obj) {
            ret[i] = typeof obj[i] === 'object' ? (obj[i] ? deepCopy(obj[i]) : null) : obj[i]
        }
    }
    return ret
}
