const PolylineDefaultParams = {
    isOutline: true,
    borderWeight: 2,
    outlineColor: '#417AE8',
    strokeColor: '#608FE9',
    strokeWeight: 10,
    strokeStyle: 'solid',
    lineJoin: 'round',
    lineCap: 'round',
    showDir: true
}

const LineStyle = {
    height_light: {
        outlineColor: '#F85F00',
        strokeColor: '#FF9911'
    },
    red: {
        outlineColor: '#f81316',
        strokeColor: '#ff443c'
    },
    grey: {
        outlineColor: '#838383',
        strokeColor: '#A9A9A9'
    }
}

function searchPromise(start, end) {
    return new Promise((resolve, reject) => {
        this.search(start, end, function (status, result) {
            resolve({ result, start, end })
        })
    })
}

export async function createRoute(originPoints, lineStyle, isHide) {
    originPoints = originPoints.filter(item => item.length >= 2)
    if (originPoints.length < 2) return
    let points = originPoints.map(item => new this.AMap.LngLat(item[0], item[1]))
    let walking = new this.AMap.Walking({ hideMarkers: true })
    let promiseArr = []
    let allPath = [points[0]]
    for (let i = 0; i < points.length - 1; i++) {
        promiseArr.push(searchPromise.call(walking, points[i], points[i + 1]))
    }
    let results = await Promise.all(promiseArr)
    results.forEach(item => {
        let result = item.result
        let start = item.start
        let end = item.end
        if (result.info === 'ok') {
            let steps = result.routes[0].steps
            if (!(Array.isArray(steps))) return
            let path = steps.map(item => item.end_location)
            path.unshift(steps[0].start_location)
            path.unshift(start)
            path.push(end)
            allPath.push(...path)
        }
    })

    let PolylineParams = Object.assign({ map: this.map, path: allPath, visible: !isHide }, PolylineDefaultParams)
    if (lineStyle) PolylineParams = Object.assign(PolylineParams, LineStyle[lineStyle])
    return new this.AMap.Polyline(PolylineParams)
}

export async function createSimpleRoute(originPoints, lineStyle, isHide) {
    originPoints = originPoints.filter(item => item.length >= 2)
    if (originPoints.length < 2) return
    let points = originPoints.map(item => new this.AMap.LngLat(item[0], item[1]))
    let PolylineParams = Object.assign({ map: this.map, path: points, visible: !isHide }, PolylineDefaultParams)
    if (lineStyle) PolylineParams = Object.assign(PolylineParams, LineStyle[lineStyle])
    return new this.AMap.Polyline(PolylineParams)
}
