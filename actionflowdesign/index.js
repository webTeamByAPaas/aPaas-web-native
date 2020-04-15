/**
# actionflowdesing 活动流程设计图
 */
import XtWeb from 'xtion-web'
import ActionFlowDesign from './ActionFlowDesign.vue'
export default {
  name: 'actionflowdesign',
  mixins: [XtWeb.Engine.UI.View],
  data: function () {
    let viewRule = this.viewRule
    return {
      eventlist: viewRule.eventlist,
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
      if (this.nodeTypeMap[data.type]) {
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
    getView (type, getter) {
      // type对应component单个取值，如果是整个取值则需要对应从getter中解析关系
      let targetData
      let targetType = ''
      if (getter && getter.ctrl && getter.ctrl.component) {
        targetType = getter.ctrl.component
      }
      switch (targetType) {
        case 'getFlowInfo':
          // 取整个设计器控件的数据
          targetData = {
            flowData: this.flowData,
            flowViewData: this.flowViewData
          }
          break
        case 'getCurrentClickNode':
          try {
            targetData = {
              nodedate: this.currentClickNode,
              viewdata: this.flowViewData.nodeView[this.currentClickNode.id] || null
            }
          } catch (e) {
            console.error('[数据异常]：currentClickNode不存在')
          }
          break
        default:
          targetData = {
            flowData: this.flowData,
            flowViewData: this.flowViewData
          }
          break
      }
      return targetData
    },
    setView (data, type, setter) {
      let targetType = ''
      if (setter && setter.ctrl && setter.ctrl.component) {
        targetType = setter.ctrl.component
      }
      switch (targetType) {
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
          if (data) {
            // 编辑
            this.flowData = data.flowData
            this.flowViewData = data.flowViewData
          } else {
            // 新增
          }
          break
        case 'setCurrentViewData':
          // 节点编辑视图数据
          // data = {
          //   nodedata: {},
          //   viewdata: {}
          // }
          let id = data.nodedata.id
          // 更新流程节点name
          this.flowData.nodeList.forEach(node => {
            node.name = data.nodedata.name
          })
          // 更新节点视图数据
          this.flowViewData.nodeView[id] = data.viewdata
          break
        default:
          if (data) {
            try {
              this.flowData = data.flowData
              this.flowViewData = data.flowViewData
            } catch (e) {
              console.error('[数据异常]：data结构不是 { flowData:{...}, flowViewData: {...}}')
            }
          }
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
