/**
# actionflowdesing 活动流程设计图
 */
import XtWeb from 'xtion-web'
import ActionFlowDesign from './ActionFlowDesign.vue'
export default {
  name: 'actionflowdesign',
  mixins: [XtWeb.Engine.UI.View],
  data: function () {
    // let viewRule = this.viewRule
    return {
      flowData: {
        name: '活动流程',
        nodeList: [],
        lineList: []
      },
      flowViewData: {
        name: '活动流程',
        nodeView: {}
      }
    }
  },
  created () {
    this.currentClickNode = null
    this.nodeTypeMap = {
      'selectNode': true,
      'splitNode': true,
      'commNode': true,
      'userNode': true,
      'exportNode': true,
      'andNode': true,
      'orNode': true
    }
    if (this.viewRule.value) {
      this.value = this.executeLogicExpression(this.viewRule.value, this.engine)
    }
  },
  methods: {
    // 通过trigger type分发事件
    executeEvent (triggerType, eventTarget, data, callback) {
      if (this.nodeTypeMap[triggerType]) {
        // 判断是节点点击事件，记录当前点击节点
        this.currentClickNode = data
      }
      // 改写，针对native组件的协议结构解析调用协议事件
      // console.log(triggerType)
      // console.log(eventTarget)
      // console.log(data)
      // console.log(callback)
      if (!this.eventList) return
      for (let event of this.eventList) {
        if (event.trigger === triggerType && event.handler) {
          this.engine.executeEvent(event.handler, this, data, callback)
          break
        }
      }
    },
    getView (type) {
      let targetData
      switch (type) {
        case 'getFlowInfo':
          // 取整个设计器控件的数据
          targetData = {
            flowData: this.flowData,
            flowViewData: this.flowViewData
          }
          break
        case 'getCurrentClickNode':
          targetData = this.currentClickNode
          break
        default:
          break
      }
      return targetData
    },
    setView (data, type) {
      switch (type) {
        case 'setFlowInfo':
          // 新建 or 编辑 给设计器赋值，结构如下
          // data = {
          //   flowData: {
          //     name: '活动流程xxx',
          //     nodeList: [],
          //     lineList: []
          //   },
          //   flowViewData: {
          //     name: '活动流程xxx',
          //     nodeView: []
          //   }
          // }
          this.flowData = data.flowData
          this.flowViewData = data.flowViewData
          break
        case 'setCurrentViewData':
          // 节点编辑视图数据
          // data = {
          //   nodedata: {},
          //   viewdata: {}
          // }
          let id = data.nodedata.id
          this.flowViewData.nodeView[id] = data.viewdata
          break
        default:
          break
      }
    }
  },
  render (h) {
    return h(ActionFlowDesign, {
      props: {
        ...this.translate(this.viewRule),
        ...this.logicExpression(this.viewRule),
        flowData: this.flowData,
        flowViewData: this.flowViewData,
        executeEvent: this.executeEvent
      },
      on: {
        updateflowdata: (data) => {
          this.flowData = data
        },
        updatelinelistbyflowdata: (linelist) => {
          this.flowData.lineList = linelist
        },
        updatenodelistbyflowdata: (nodelist) => {
          this.flowData.nodelist = nodelist
        },
        updateviewdata: (data) => {
          this.flowViewData = data
        }
      }
    })
  }
}
