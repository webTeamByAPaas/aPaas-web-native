var dataA = {
  name: '流程A',
  nodeList: [
    {
      id: 'nodeA',
      name: '流程A-节点A',
      type: 'task',
      left: '26px',
      top: '161px',
      ico: 'el-icon-user-solid',
      show: true
    },
    {
      id: 'nodeB',
      name: '流程A-节点B',
      type: 'task',
      left: '340px',
      top: '161px',
      ico: 'el-icon-goods',
      show: true
    },
    {
      id: 'nodeC',
      name: '流程A-节点C',
      type: 'task',
      left: '739px',
      top: '161px',
      ico: 'el-icon-present',
      show: true
    }
  ],
  lineList: [{
    from: 'nodeA',
    to: 'nodeB'
  }, {
    from: 'nodeB',
    to: 'nodeC'
  }]
}

export default dataA
