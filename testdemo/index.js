/**
# actionflowdesing 活动流程设计图
 */
import XtWeb from 'xtion-web'
import Testdemo from './Testdemo.vue'
export default {
  name: 'testdemo',
  mixins: [XtWeb.Engine.UI.View],
  data: function () {
    return {
      ctrlData: {
        name: ''
      }
    }
  },
  methods: {
    // 通过trigger type分发事件
    executeEvent (triggerType, eventTarget, data, callback) {
      if (!this.eventList) return
      for (let event of this.eventList) {
        if (event.trigger === triggerType && event.handler) {
          this.engine.executeEvent(event.handler, this, data, callback)
          break
        }
      }
    },
    // @ 组件通信
    getView (type, getter) {
      let targetData
      let targetType = ''
      if (getter && getter.ctrl && getter.ctrl.component) {
        targetType = getter.ctrl.component
      }
      switch (targetType) {
        case 'getData':
          // ....
          targetData = this.ctrlData
          break
        default:
          break
      }
      return targetData
    },
    // @ 组件通信
    setView (data, type, setter) {
      if (data &&
          typeof data === 'string' &&
          (data.indexOf('{') !== -1 || data.indexOf('\\{') !== -1 || data.indexOf('[') !== -1 || data.indexOf('\\[') !== -1)) {
        data = JSON.parse(data)
      }
      let targetType = ''
      if (setter && setter.ctrl && setter.ctrl.component) {
        targetType = setter.ctrl.component
      }
      switch (targetType) {
        case 'setData':
          // .....
          this.ctrlData = data
          break
        default:
          break
      }
    }
  },
  render (h) {
    return h(Testdemo, {
      props: {
        ...this.translate(this.viewRule),
        ...this.logicExpression(this.viewRule),
        executeEvent: this.executeEvent,
        ctrlData: this.ctrlData
      },
      ref: this.viewRule.code,
      on: {
        saveData: (data) => {
            this.ctrlData.name = data
        }
      }
    })
  }
}
