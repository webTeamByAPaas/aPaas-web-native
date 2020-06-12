export function getContent(type, num) {
    let result
    switch (type) {
        case 0:
            result = planPointerContent.call(this, num)
            break
        case 1:
            result = realPointerContent.call(this, num)
            break
        case 2:
            result = checkPointerContent.call(this)
            break
        case 3:
            result = monitorPointerContent.call(this)
            break
        case 6:
            result = stopPointerContent.call(this)
            break
        case 7:
            result = customerPointerContent.call(this)
            break
        case 8:
            result = realPointerContent.call(this, num)
            break
        case 99:
            // 起点
            result = startPointerContent.call(this, num)
            break
        case 100:
            // 终点
            result = endPointerContent.call(this, num)
            break
        default:
            result = monitorPointerContent.call(this)
    }
    return result
}

export function startPointerContent () {
    return {
        offset: new this.AMap.Pixel(-16, -53),
        content: `<i class="icon icon-start-map"></i>`
    }
}

export function endPointerContent () {
    return {
        offset: new this.AMap.Pixel(-24, -53),
        content: `<i class="icon icon-end-map"></i>`
    }
}

export function planPointerContent (num = 1) {
    return {
        offset: new this.AMap.Pixel(-20, -3),
        content: `<i class="icon icon-plan-map">
            <article>${num}</article>
        </i>`
    }
}

export function realPointerContent (num = 1) {
    return {
        offset: new this.AMap.Pixel(-20, -53),
        content: `<i class="icon icon-real-map">
            <article>${num}</article>
        </i>`
    }
}

let o1

export function monitorPointerContent () {
    if (o1) return o1
    o1 = {
        offset: new this.AMap.Pixel(-11, -11),
        content: `<i class="icon icon-monitor-map"></i>`
    }
    return o1
}

let o3

export function checkPointerContent () {
    if (o3) return o3
    o3 = {
        offset: new this.AMap.Pixel(-20, -53),
        content: `<i class="icon icon-check-map"></i>`
    }
    return o3
}

let o4

export function customerPointerContent () {
    if (o4) return o4
    o4 = {
        offset: new this.AMap.Pixel(-20, -53),
        content: `<i class="icon icon-customer-map"></i>`
    }
    return o4
}

let o5

export function stopPointerContent () {
    if (o5) return o5
    o5 = {
        offset: new this.AMap.Pixel(-20, -53),
        content: `<i class="icon icon-stop-map"></i>`
    }
    return o5
}

let o6

export function realPointerPlusContent () {
    if (o6) return o6
    o6 = {
        offset: new this.AMap.Pixel(-20, -53),
        content: `<i class="icon icon-real-map"></i>`
    }
    return o6
}
