<template>
  <div :style="viewStyle" class="xt-testdemo">
    <el-input v-model="name"></el-input>
    <div>{{ctrlData.name}}</div>
    <el-button @click="clickNode">点击</el-button>
  </div>
</template>

<script>
import XtWeb from 'xtion-web'
import './style.less'

export default {
  mixins: [XtWeb.Widget.UI.View],
  components: {},
  props: {
    value: String,
    executeEvent: Function,
    ctrlData: Object
  },
  data () {
    return {
      name: 'testdemo'
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    clickNode () {
      let newData = 'new test name'
      this.$emit('saveData', newData)
    }
  }
}
</script>

<style scoped>
</style>
