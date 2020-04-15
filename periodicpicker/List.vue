<template>
  <transition name="el-zoom-in-top">
    <div class="xt-periodicpicker-list">
      <div
        class="time-select-item"
        :class="{ 'selected': item.value == selectedValue, 'disabled': disabled}"
        v-for="(item, $index) of data"
        :key="$index"
        @click="handleClick(item)"
      >{{ item.title }}</div>
    </div>
  </transition>
</template>

<script>
import { scrollIntoView } from './util'
export default {
  props: {
    data: Array,
    value: String,
    disabled: Boolean
  },
  data () {
    return {
      selectedValue: ''
    }
  },
  watch: {
    value (newVal, oldValue) {
      if (newVal !== oldValue) {
        this.selectedValue = this.value
      }
    }
  },
  created () {
    if (this.value) {
      this.selectedValue = this.value
    }
  },
  mounted () {
    this.scrollToOption()
  },
  methods: {
    handleClick (item) {
      if (this.disabled) {
        return
      }
      let oldValue = this.selectedValue
      this.selectedValue = item.value
      this.$emit('input', this.selectedValue)
      this.$emit('change', this.selectedValue, oldValue)
    },
    scrollToOption (className = 'selected') {
      const menu = this.$parent.$el.querySelector('.el-picker-panel__content')
      scrollIntoView(menu, menu.getElementsByClassName(className)[0])
    }
  }
}
</script>

<style lang="less" scoped>
.xt-periodicpicker-list {
  list-style: none;
  > .time-select-item {
    text-align: center;
  }
}
</style>
