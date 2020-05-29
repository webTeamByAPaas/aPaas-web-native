const valuesObj = {}
const setterObj = {}

// 用于生成uuid
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

export function guid() {
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

export function setParams(type, param) {
    valuesObj[type] = param
}

export function getView(type, getter) {
    if (getter && getter.name && type) {
        return valuesObj[type][getter.name]
    }
    return ''
}

export function setView(data, type, setter) {
    if (typeof data !== 'object' || !data.key || !data.value) return
    setterObj[data.key] = data.value
    console.log('setter', data)
}

export function getSetterObj(key) {
    return setterObj[key]
}

export function executeEvent(triggerType, eventTarget, data, callback, errCallback) {
    if (!this.eventList) return
    for (let event of this.eventList) {
        if (event.trigger === triggerType && event.handler) {
            this.engine.executeEvent(event.handler, this, data, callback, errCallback)
            break
        }
    }
}

export function isJsonString (data) {
    return data.indexOf('{') !== -1 || data.indexOf('\\{') !== -1 || data.indexOf('[') !== -1 || data.indexOf('\\[') !== -1
}
