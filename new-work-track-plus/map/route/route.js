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

export async function createSimpleRoute (originPoints, lineStyle, isHide) {
    originPoints = originPoints.filter(item => item.length >= 2)
    if (originPoints.length < 2) return
    let points = originPoints.map(item => new this.AMap.LngLat(item[0], item[1]))
    let PolylineParams = Object.assign({ map: this.map, path: points, visible: !isHide }, PolylineDefaultParams)
    console.log('originPoints--------')
    console.log(originPoints)
    if (lineStyle) {
        PolylineParams = Object.assign(PolylineParams, {
            path: points, // 设置线覆盖物路径
            // showDir: true,
            dirColor: 'white',
            isOutline: false,
            // strokeColor: 'rgb(204, 52, 0)', // 线颜色
            // strokeColor: 'hsla(0, 88%, 60%, 0.3)', // 线颜色
            // strokeColor: 'hsla(205, 70%, 44%, 0.8)', // 线颜色
            strokeColor: lineStyle || '#5e8de9', // 线颜色
            strokeWeight: 8 // 线宽
        })
    }
    // var bezierCurve = new this.AMap.BezierCurve(Object.assign(PolylineParams, {
    //     path: [
    //         // 每个弧线段有两种描述方式
    //         [116.39, 39.91, 116.37, 39.91], // 起点
    //         // 第一段弧线
    //         [116.380298, 39.907771, 116.38, 39.90], // 控制点，途经点
    //         // 第二段弧线
    //         [116.385298, 39.907771, 116.40, 39.90], // 控制点，途经点//弧线段有两种描述方式1
    //         // 第三段弧线
    //         [ // 弧线段有两种描述方式2
    //           [116.392872, 39.887391], // 控制点
    //           [116.40772, 39.909252], // 控制点
    //           [116.41, 39.89] // 途经点
    //         ],
    //         // 第四段弧线
    //         [116.423857, 39.889498, 116.422312, 39.899639, 116.425273, 39.902273]
    //         // 控制点，控制点，途经点，每段最多两个控制点
    //     ], // 设置线覆盖物路径
    //     // showDir: true,
    //     dirColor: 'pink',
    //     isOutline: false,
    //     // strokeColor: 'rgb(204, 52, 0)', // 线颜色
    //     strokeColor: 'hsla(0, 88%, 60%, 0.3)', // 线颜色
    //     // strokeColor: 'hsla(108, 62%, 53%, 0.8)', // 线颜色
    //     strokeWeight: 6 // 线宽
    // }))

    // bezierCurve.setMap(this.map)

    return new this.AMap.BezierCurve(PolylineParams)
}
