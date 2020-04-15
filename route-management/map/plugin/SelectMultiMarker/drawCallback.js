export const options = {
    'polygon': {
        'text': '多边框选'
    },
    'rectangle': {
        'text': '矩形框选'
    }
}

function drawRectangle(obj) {
    let callback = this.drawCallback['rectangle']
    try {
        let positions = obj.Qi.path.map(item => ([item.lng, item.lat]))
        let range = dealPositions(positions)
        let markers = this.map.getAllOverlays('marker')
        let selectMarkers = markers.filter(marker => {
            let position = marker.getPosition()
            return position.lng >= range[0][0] &&
                position.lng <= range[0][1] &&
                position.lat >= range[1][0] &&
                position.lat <= range[1][1]
        })

        callback(selectMarkers, positions)
    } catch (e) {
        console.log(e)
    }
    clear.call(this, obj)
}

options['rectangle'].draw = drawRectangle

function drawPolygon(obj) {
    let callback = this.drawCallback['polygon']
    try {
        let positions = obj.Qi.path.map(item => ([item.lng, item.lat]))
        let markers = this.map.getAllOverlays('marker')
        let selectMarkers = markers.filter(marker => {
            let position = marker.getPosition()
            return isInPolygon([position.lng, position.lat], positions)
        })
        callback(selectMarkers, positions)
    } catch (e) {
        console.log(e)
    }
    clear.call(this, obj)
}

options['polygon'].draw = drawPolygon

function dealPositions(positions) {
    return [
        [positions[0][0], positions[2][0]].sort(),
        [positions[0][1], positions[2][1]].sort()
    ]
}

function clear(overdelay) {
    this.map.remove(overdelay)
}


function isInPolygon(checkPoint, polygonPoints) {
    let counter = 0
    let i
    let xinters
    let p1, p2
    let pointCount = polygonPoints.length
    p1 = polygonPoints[0]

    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount]
        if (
            checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
            if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                if (p1[0] !== p2[0]) {
                    xinters =
                        (checkPoint[0] - p1[0]) *
                        (p2[1] - p1[1]) /
                        (p2[0] - p1[0]) +
                        p1[1]
                    if (p1[1] === p2[1] || checkPoint[1] <= xinters) {
                        counter++
                    }
                }
            }
        }
        p1 = p2
    }
    return counter % 2 !== 0
}
