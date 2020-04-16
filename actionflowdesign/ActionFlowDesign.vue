<template>
  <div :style="viewStyle" class="xt-actionflowdesign">
    <div v-if="easyFlowVisible" style="height:100%">
        <!-- <el-row>
            <el-col :span="24">
                <div class="flow-tooltar">
                    <el-button icon="el-icon-document" @click="dataInfo(false)" size="mini">流程设计图</el-button>
                    <el-button icon="el-icon-document" @click="dataInfo(true)" size="mini">流程数据</el-button>
                    <el-button @click="dataReloadA" icon="el-icon-refresh" size="mini">切换流程A</el-button>
                    <el-button @click="dataReloadB" icon="el-icon-refresh" size="mini">切换流程B</el-button>
                    <el-button @click="dataReloadC" icon="el-icon-refresh" size="mini">切换流程C</el-button>
                    <el-button @click="changeLabel" icon="el-icon-edit-outline" size="mini">连线模式</el-button>
                    <div v-if="settingLineStatus" style="display: inline-block;">
                      <span>连线起点:[{{lineStar.name}}]</span>
                      <span>连线终点:[{{lineEnd.name}}]</span>
                    </div>
                    <el-button @click="setLine" icon="el-icon-edit-outline" size="mini">设置连线</el-button>
                    <el-button icon="el-icon-document" @click="checkFlow" size="mini">校验</el-button>
                    <el-button icon="el-icon-document" @click="executeFlow" size="mini">执行</el-button>
                </div>
            </el-col>
        </el-row> -->
        <div class="float-tools">
          <el-button class="tool-btn" icon="el-icon-document" @click="checkFlow" size="mini">校验</el-button>
          <el-button class="tool-btn" icon="el-icon-document" @click="executeFlow" size="mini">执行</el-button>
        </div>
        <div class="flow-main">
            <!--左侧可以拖动的菜单-->
            <div class="flow-nodemenu-tool g4" ref="nodeMenu">
                <node-menu @addNode="addNode"></node-menu>
            </div>
            <div class="flow-action-content g20">
                <!-- <el-row> -->
                    <!--画布-->
                    <!-- <el-col :span="16"> -->
                        <div id="flowContainer" ref="flowContainer" class="flowContainer">
                            <template v-for="node in data.nodeList">
                                <flow-node
                                    :key="node.id"
                                    v-show="node.show"
                                    :id="node.id"
                                    :node="node"
                                    @deleteNode="deleteNode"
                                    @changeNodeSite="changeNodeSite"
                                    @nodeRightMenu="nodeRightMenu"
                                    @clickNode="clickNode"
                                    @dblclickNode="dblclickNode"
                                >
                                </flow-node>
                            </template>
                        </div>
                    <!-- </el-col> -->
                <!-- </el-row> -->
            </div>
        </div>
        <!-- 流程数据详情 -->
        <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="showViewDataStatus ? flowViewData : flowData"></flow-info>
    </div>
  </div>
</template>

<script>
import XtWeb from 'xtion-web'
import './style.less'
import { jsPlumb } from 'jsplumb'
import { easyFlowMixin } from './easy_flow_mixin'
import flowNode from './flow/node.vue'
import nodeMenu from './flow/node_menu.vue'
import FlowInfo from './flow/info.vue'
// import FlowNodeForm from './flow/node_form.vue'
import { cloneDeep } from 'lodash'
import getDataA from './mock/dataA'
import getDataB from './mock/dataB'
import getDataC from './mock/dataC'

export default {
  // 一些基础配置移动该文件中
  mixins: [XtWeb.Widget.UI.View, easyFlowMixin],
  components: {
    // draggable,
    // FlowNodeForm,
    flowNode, nodeMenu, FlowInfo
  },
  props: {
    value: String,
    executeEvent: Function,
    flowData: Object,
    flowViewData: Object
  },
  data () {
    return {
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 控制流程数据显示与隐藏
      flowInfoVisible: false,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      // 流程设计图数据
      data: {},
      // 流程视图数据
      viewData: {},
      showViewDataStatus: false,
      // 连线状态
      settingLineStatus: false,
      lineStar: {
        id: '',
        name: ''
      },
      lineEnd: {
        id: '',
        name: ''
      }
    }
  },
  watch: {
    data (newVal, oldVal) {
      if (newVal) {
        this.$emit('updateflowdata', newVal)
      }
    },
    viewData (newVal, oldVal) {
      if (newVal) {
        this.$emit('flowViewData', newVal)
      }
    }
  },
  created () {
    this.data = cloneDeep(this.flowData)
    this.viewData = cloneDeep(this.flowViewData)
    this.tempLineList = []
  },
  mounted () {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      // 在这里可以根据具体的业务返回符合流程数据格式的数据即可
      this.dataReload(this.data)
    })
  },
  methods: {
    // 返回唯一标识
    getUUID () {
      return Math.random().toString(36).substr(3, 10)
    },
    jsPlumbInit () {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true)
        // 初始化节点
        this.loadEasyFlow()
        // 单点击了连接线,
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.$confirm('确定删除所点击的线吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.jsPlumb.deleteConnection(conn)
          }).catch(() => {
          })
        })
        // 连线
        this.jsPlumb.bind('connection', (evt) => {
          let from = evt.source.id
          let to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({
              from: from,
              to: to
            })
          }
        })
        // 删除连线回调
        this.jsPlumb.bind('connectionDetached', (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })
        // 改变线的连接节点
        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })
        // 连线右击
        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt)
        })
        // 连线
        this.jsPlumb.bind('beforeDrop', (evt) => {
          let from = evt.sourceId
          let to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环')
            return false
          }
          this.$message.success('连接成功')
          return true
        })

        // beforeDetach
        this.jsPlumb.bind('beforeDetach', (evt) => {
          console.log('beforeDetach', evt)
        })
      })
    },
    // 加载流程图
    loadEasyFlow () {
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions)
        // // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(node.id, { containment: 'parent' })
      }
      // 初始化连线
      for (let i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i]
        this.jsPlumb.connect({
          source: line.from,
          target: line.to
        }, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true
      })
    },
    // 删除线
    deleteLine (from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from === from && line.to === to) {
          return false
        }
        return true
      })
    },
    // 改变连线
    changeLine (oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    // 改变节点的位置
    changeNodeSite (data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode (evt, nodeMenu, mousePosition) {
      let width = this.$refs.nodeMenu.clientWidth
      let nodeId = this.getUUID()
      let left = mousePosition.left
      let top = mousePosition.top
      if (left < 0) {
        left = evt.originalEvent.layerX - (width / 2)
      }
      if (top < 0) {
        top = evt.originalEvent.clientY - 50
      }
      // 获取容器的坐标范围
      // var containerRect = this.$refs.flowContainer.getBoundingClientRect()
      // var containerX1 = containerRect.x, containerX2 = containerRect.x + containerRect.width
      // var containerY1 = containerRect.y, containerY2 = containerRect.y + containerRect.height
      // console.log(left, top)
      // console.log(containerX1, containerY1, containerX2, containerY2)
      // if (left <= containerX1 || left >= containerX2 || top <= containerY1 || top >= containerY2) {
      //     this.$message.error('请拖入到容器中')
      //     return false
      // }
      var node = {
        id: nodeId,
        // name: `${nodeMenu.name}(${nodeId})`,
        name: nodeMenu.name,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        check: 'undo', // undo: 不显示，pass:通过，fail:失败
        show: true
      }
      /**
       * 这里可以进行业务判断、是否能够添加该节点
       */
      this.data.nodeList.push(node)
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent'
        })
      })
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode (nodeId) {
      this.$confirm('确定要删除节点' + nodeId + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        /**
         * 这里需要进行业务判断，是否可以删除
         */
        this.data.nodeList = this.data.nodeList.filter(function (node) {
          if (node.id === nodeId) {
            // 伪删除，将节点隐藏，否则会导致位置错位
            node.show = false
          }
          return node.show
        })
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(nodeId)
        })
      }).catch(() => {})
      return true
    },
    // @ 记录连线信息
    recordLink (node) {
      // 记录连线节点
      if (this.lineStar.id === '') {
        this.lineStar.id = node.id
        this.lineStar.name = node.name
      } else if (this.lineStar.id !== node.id) {
        this.lineEnd.id = node.id
        this.lineEnd.name = node.name
      }
    },
    // @ 清楚连线信息
    clearRecordLink () {
      this.lineStar.id = ''
      this.lineStar.name = ''
      this.lineEnd.id = ''
      this.lineEnd.name = ''
    },
    clickNode (node) {
      if (this.settingLineStatus) {
        // 记录连线节点
        this.recordLink(node)
      }
      console.log('点击')
    },
    dblclickNode (node) {
      console.log('点击')
      this.executeEvent('clicknode', this, node, function () {})
      // this.$refs.nodeForm.init(this.data, nodeId)
    },
    // 是否具有该线
    hasLine (from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine (from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu (nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    // 流程数据信息
    dataInfo (state) {
      this.flowInfoVisible = true
      this.showViewDataStatus = state
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
    },
    // 加载流程图
    dataReload (data) {
      // TODO: this.data.lineList响应数据也被情况，所以使用this.tempLineList做全局记录下来上次所有连线数据
      // this.jsPlumb.getAllConnections().forEach(conn => {
      //   this.jsPlumb.deleteConnection(conn)
      // })
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      data = JSON.parse(JSON.stringify(data))
      this.$nextTick(() => {
        data = cloneDeep(data)
        this.easyFlowVisible = true
        this.data = data
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    // 模拟载入数据dataA
    dataReloadA () {
      this.dataReload(getDataA)
    },
    // 模拟载入数据dataB
    dataReloadB () {
      this.dataReload(getDataB)
    },
    // 模拟载入数据dataC
    dataReloadC () {
      this.dataReload(getDataC)
    },
    // @ 切换连线模式
    changeLabel () {
      this.settingLineStatus = !this.settingLineStatus
      if (!this.settingLineStatus) {
        this.clearRecordLink()
      }
    },
    // @ 设置2个节点连线
    setLine () {
      if (!this.lineStar.id || !this.lineEnd.id) {
        this.$message({
          message: '请设置连线的起点和终点节点',
          type: 'warning',
          duration: 1500,
          showClose: true
        })
        return
      }
      if (this.settingLineStatus) {
        let lineNode = {
          from: this.lineStar.id,
          to: this.lineEnd.id
        }
        // 清除旧画布连线内容
        // TODO: this.data.lineList响应数据也被情况，所以使用this.tempLineList做全局记录下来上次所有连线数据
        this.jsPlumb.getAllConnections().forEach(conn => {
          this.jsPlumb.deleteConnection(conn)
        })
        // 校验连线规则（简陋版）
        // 待处理规则：区分节点，头节点，结束节点，拆分节点，等
        let circulate = false
        this.data.lineList = cloneDeep(this.tempLineList).filter((line) => {
          let res = true
          if (line.from === lineNode.from && line.to === lineNode.to) {
            // 重复线段，过滤
            res = false
          }
          if ((line.from === lineNode.to && line.to === lineNode.from)) {
            this.$message({
              message: '不允许循环连线',
              type: 'warning',
              duration: 1500,
              showClose: true
            })
            circulate = true
          }
          return res
        })
        if (!circulate) {
          // 非循环节点，允许连线
          this.data.lineList.push(lineNode)
        }
        this.tempLineList = cloneDeep(this.data.lineList)

        this.dataReload(Object.assign(this.flowData, this.data))
      }
      // 清除连线记录
      this.clearRecordLink()
    },
    // @ 校验流程
    checkFlow () {
      this.$emit('checkflow', true)
    },
    // @ 执行流程
    executeFlow () {
      // this.checkFlow()
      this.executeEvent('executeflow', this, {}, function () {})
      // this.$emit('test')
    }
  }
}
</script>

<style scoped>
</style>
