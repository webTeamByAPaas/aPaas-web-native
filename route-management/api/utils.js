const valuesObj = {}

export function setParams(type, param) {
    valuesObj[type] = param
}

export function getView(type, getter) {
    if (getter && getter.name && type) {
        if (type === 'value') { // 数组处理
            type = getter.ctrl.component
        }
        return valuesObj[type][getter.name]
    }
    return ''
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
