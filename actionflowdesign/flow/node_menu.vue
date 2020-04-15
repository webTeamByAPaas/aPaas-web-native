<template>
    <div class="flow-menu" ref="tool">
        <el-collapse v-model="activeNames">
            <el-collapse-item v-for="menu in nodeList" :key="menu.id" :name="menu.id">
                <template slot="title">
                    {{menu.name}}
                </template>
                <draggable @end="end" @start="move" v-model="menu.children" :options="draggableOptions">
                    <div :key="son.id" v-for="son in menu.children"
                        :type="son.type"
                        class="flow-node-menu" :style="son.style">
                        <div class="flow-node-menu-left"></div>
                        <div class="flow-node-menu-left-ico">
                            <i :class="son.ico"></i>
                        </div>
                        <div class="flow-node-menu-text">
                            {{son.name}}
                        </div>
                    </div>
                </draggable>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>
<script>
import draggable from 'vuedraggable'

var mousePosition = {
  left: -1,
  top: -1
}

export default {
  name: 'nodemenu',
  data () {
    return {
      activeNames: ['group_01', 'group_02'],
      // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
      draggableOptions: {
        preventOnFilter: false,
        sort: false,
        disabled: false,
        ghostClass: 'tt',
        // 不使用H5原生的配置
        forceFallback: true
        // 拖拽的时候样式
        // fallbackClass: 'flow-node-draggable'
      },
      // 默认打开的左侧菜单的id
      defaultOpeneds: ['1', '2'],
      nodeList: [
        {
          id: 'group_01',
          type: 'group',
          name: '功能节点',
          ico: 'el-icon-video-play',
          children: [
            {
              id: 'node_01',
              type: 'selectNode',
              name: '选择',
              ico: 'el-icon-menu',
              // 自定义覆盖样式
              style: {},
              show: true
            },
            {
              id: 'node_02',
              type: 'splitNode',
              name: '拆分',
              ico: 'el-icon-share',
              // 自定义覆盖样式
              style: {},
              show: true
            },
            {
              id: 'node_05',
              type: 'commNode',
              name: '沟通',
              ico: 'el-icon-message',
              // 自定义覆盖样式
              style: {},
              show: true
            },
            {
              id: 'node_06',
              type: 'userNode',
              name: '客群',
              ico: 'el-icon-information',
              // 自定义覆盖样式
              style: {},
              show: true
            },
            {
              id: 'node_07',
              type: 'exportNode',
              name: '导出',
              ico: 'el-icon-upload2',
              // 自定义覆盖样式
              style: {},
              show: true
            }
          ]
        },
        {
          id: 'group_02',
          type: 'group',
          name: '逻辑节点',
          ico: 'el-icon-video-play',
          children: [
            {
              id: 'node_03',
              type: 'andNode',
              name: '与',
              ico: 'el-icon-minus',
              // 自定义覆盖样式
              style: {},
              show: true
            },
            {
              id: 'node_04',
              type: 'orNode',
              name: '或',
              ico: 'el-icon-more',
              // 自定义覆盖样式
              style: {},
              show: true
            }
          ]
        }
      ],
      nodeMenu: {}
    }
  },
  components: {
    draggable
  },
  created () {
    /**
     * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
     * @param event
     */
    if (this.isFirefox()) {
      document.body.ondrop = function (event) {
        // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
        mousePosition.left = event.layerX
        mousePosition.top = event.clientY - 50
        event.preventDefault()
        event.stopPropagation()
      }
    }
  },
  methods: {
    // 根据类型获取左侧菜单对象
    getMenu (type) {
      for (let i = 0; i < this.nodeList.length; i++) {
        let children = this.nodeList[i].children
        for (let j = 0; j < children.length; j++) {
          if (children[j].type === type) {
            return children[j]
          }
        }
      }
    },
    // 拖拽开始时触发
    move (evt, a, b, c) {
      console.log(evt, a, b, c)
      var type = evt.item.attributes.type.nodeValue
      this.nodeMenu = this.getMenu(type)
    },
    // 拖拽结束时触发
    end (evt, e) {
      this.$emit('addNode', evt, this.nodeMenu, mousePosition)
    },
    // 是否是火狐浏览器
    isFirefox () {
      var userAgent = navigator.userAgent
      if (userAgent.indexOf('Firefox') > -1) {
        return true
      }
      return false
    }
  }
}
</script>
<style>
    .flow-menu {
        text-align: left;
    }

    .flow-tool-menu {
        background-color: #eeeeee;
        cursor: pointer;
        padding-left: 5px;
        height: 50px;
        line-height: 50px;
        border-bottom: 1px solid #979797
    }

    .flow-tool-submenu {
        background-color: white;
        padding-left: 20px;
        cursor: pointer;
        height: 50px;
        line-height: 50px;
        vertical-align: middle;
        border-bottom: 1px solid #d3d3d3
    }

    .flow-node-draggable {
        border: 1px solid #1879FF;
        height: 35px !important;
        width: 170px !important;
        line-height: 35px;
    }
    .flow-node-menu {
        text-align: center;
        margin: 10px;
        display: flex;
        width: 80%;
        height: 30px;
        border: 1px solid #E0E3E7;
        border-radius: 5px;
        background-color: #fff;
    }

    .flow-node-menu:hover {
        /* 设置移动样式*/
        cursor: move;
        background-color: #F0F7FF;
        /*box-shadow: #1879FF 0px 0px 12px 0px;*/
        background-color: #F0F7FF;
        border: 1px solid #1879FF;
    }

    .flow-node-menu-left {
        width: 4px;
        background-color: #1879FF;
        border-radius: 3px 0 0 3px;
    }

    .flow-node-menu-left-ico {
        line-height: 30px;
        margin-left: 4px;
    }

    .flow-node-menu-text {
        color: #565758;
        font-size: 12px;
        line-height: 30px;
        margin-left: 4px;
        width: 70px;
        /* 设置超出宽度文本显示方式*/
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
