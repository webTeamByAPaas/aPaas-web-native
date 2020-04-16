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
      'importNode': true,
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
      if (data && this.nodeTypeMap[data.type]) {
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
              nodedata: this.currentClickNode,
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
      // 判断data返回的类型
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
            try {
              this.flowData = data.flowData
              this.flowViewData = data.flowViewData
              // TODO：
              // 1、dataReload绘图不能传入监听对象结构
              // 2、不能短时间重复调用，必须渲染完成上一次操作。
              let fd = JSON.parse(JSON.stringify(this.flowData))
              this.$refs[this.viewRule.code] && this.$refs[this.viewRule.code].dataReload(fd)
            } catch (e) {
              console.error('[数据异常]：data结构不是 { flowData:{...}, flowViewData: {...}}')
            }
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
            if (node.id === data.nodedata.id) {
              node.name = data.nodedata.name
            }
          })
          // 更新节点视图数据
          if (data.viewdata) {
            this.flowViewData.nodeView[id] = data.viewdata
          }
          break
        default:
          if (data) {
            try {
              this.flowData = data.flowData
              this.flowViewData = data.flowViewData
              // this.$refs[this.viewRule.code] && this.$refs[this.viewRule.code].dataReload(this.flowData)
            } catch (e) {
              console.error('[数据异常]：data结构不是 { flowData:{...}, flowViewData: {...}}')
            }
          }
          break
      }
      // 数据改变，重新绘制流程图
      // TODO: 不能传双向绑定数据进来绘图，所以转换一层
      // let fd = JSON.parse(JSON.stringify(this.flowData))
      // this.$refs[this.viewRule.code] && this.$refs[this.viewRule.code].dataReload(fd)
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
      ref: this.viewRule.code,
      on: {
        checkflow: (status, targetArr) => {
          // check: 'undo', // nudo: 不显示，pass:通过，fail:失败
          this.flowData.nodeList.forEach((node) => {
            node.check = 'pass'
          })
          // 校验规则
          // 选择节点只能开1条分支
          // 拆分节点，客群节点可以任意分支
          // 与，或节点分支至少1条分支
          // 导出节点只能做接入
          // this.flowData.lineList
        },
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
