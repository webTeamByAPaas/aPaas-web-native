import './index.less'
import { options } from './drawCallback.js'

export function selectMultiMarkerInit(callback, attr) {
    if (!options[attr.type]) return
    // 初始化 MouseTool
    if (!this.mouseTool) this.mouseTool = new this.AMap.MouseTool(this.map)
    // draw 回调函数集合
    if (!this.drawCallback) this.drawCallback = []
    this.drawCallback[attr.type] = callback

    // 初始化监听器
    if (!this.mouseToolOnDraw) {
        this.mouseToolOnDraw = true
        this.mouseTool.on('draw', e => {
            let { obj } = e
            options[this.drawType].draw.call(this, obj)
        })
    }

    // 创建框选按钮
    if (attr.isShow) {
        let btnCtrl = new CreateBtn(this, attr)
        // 收集控件
        if (!this.btnCtrls) this.btnCtrls = [btnCtrl]
        else this.btnCtrls.push(btnCtrl)

        this.el.appendChild(btnCtrl.body)
    }
}

function CreateBtn(ctrl, attr) {
    let option = options[attr.type] || {}
    let that = this
    let body = document.createElement('div')
    body.style = `
        position: absolute;
        ${attr.style}
    `
    let btn = document.createElement('div')
    body.appendChild(btn)
    btn.classList.add('i-select-pointer') // el-button--primary
    btn.innerText = option.text
    this.check = false
    btn.addEventListener('click', function () {
        // 开启当前控件则要关闭其他控件
        ctrl.btnCtrls.forEach(btnCtrl => {
            if (btnCtrl !== that) btnCtrl.btnOff()
        })
        if (that.check) {
            selectMultiMarkerOff.call(ctrl)
            that.btn.classList.remove('active')
        } else {
            selectMultiMarkerOn.call(ctrl, attr.type)
            that.btn.classList.add('active')
        }
        that.check = !that.check
    })

    this.body = body
    this.btn = btn
}

CreateBtn.prototype.btnOff = function () {
    this.btn.classList.remove('active')
    this.check = false
}

function selectMultiMarkerOn(type = 'polygon') {
    // 同Polygon的Option设置
    // 使用鼠标工具，在地图上画标记点
    if (!options[type]) return
    this.mouseTool.close(false)
    this.mouseTool[type]({
        fillColor: '#00b0ff',
        strokeColor: '#80d8ff'
    })
    this.drawType = type
}

function selectMultiMarkerOff() {
    this.mouseTool.close(false)
}
