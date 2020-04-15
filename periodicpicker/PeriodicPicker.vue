<template>
  <div :style="viewStyle" class="xt-periodicpicker">
    <el-form-item
      v-if="displayStyle !== 'text'"
      :label="title || ''"
      :prop="code"
      :label-width="titleWidthPix"
      :rules="rules"
      :error="errInputText"
    >
      <!-- {{ value }} -->
      <!-- {{ inputValue }} -->
      <!-- {{ inputLabel }} | {{ inputValue }} -->
      <el-popover
        ref="popover"
        popper-class="el-picker-panel time-select"
        placement="bottom"
        width="320"
        v-model="popoverStatus"
        :disabled="readonly"
        trigger="click"
        @hide="handlePopoverHide"
        @show="handlePopoverShow"
      >
        <div class="xt-periodicpicker-panel" v-if="popoverStatus">
          <section class="part" v-if="hasMonth">
            <header>月</header>
            <el-scrollbar wrap-class="el-picker-panel__content">
              <List
                :data="monthOptions"
                v-model="selectedValue[0]"
                @change="(newVal, oldVal) => this.handleItemChange(0, newVal, oldVal)"
              ></List>
            </el-scrollbar>
          </section>
          <section class="part" v-if="hasDay">
            <header>天</header>
            <el-scrollbar wrap-class="el-picker-panel__content">
              <List
                :data="dayOptions"
                v-model="selectedValue[1]"
                :disabled="dayDisabled"
                @change="(newVal, oldVal) => this.handleItemChange(1, newVal, oldVal)"
              ></List>
            </el-scrollbar>
          </section>
          <section class="part" v-if="hasHour">
            <header>时</header>
            <el-scrollbar wrap-class="el-picker-panel__content">
              <List
                :data="hourOptions"
                v-model="selectedValue[2]"
                :disabled="hourDisabled"
                @change="(newVal, oldVal) => this.handleItemChange(2, newVal, oldVal)"
              ></List>
            </el-scrollbar>
          </section>
          <section class="part" v-if="hasMinute">
            <header>分</header>
            <el-scrollbar wrap-class="el-picker-panel__content">
              <List
                :data="minuteOptions"
                v-model="selectedValue[3]"
                :disabled="minuteDisabled"
                @change="(newVal, oldVal) => this.handleItemChange(3, newVal, oldVal)"
              ></List>
            </el-scrollbar>
          </section>
        </div>
        <div class="el-time-panel__footer">
          <button type="button" class="el-time-panel__btn cancel" @click="handleCancel">取消</button>
          <button type="button" class="el-time-panel__btn confirm" @click="handleConfirm">确认</button>
        </div>
      </el-popover>
      <el-input
        v-model="inputLabel"
        :placeholder="placeholder"
        :icon="inputIcon"
        :readonly="true"
        :disabled="readonly"
        v-popover:popover
        :on-icon-click="handleIconClick"
        :size="size"
        @mouseenter.native="handleMouseEnterInput"
        @mouseleave.native="handleMouseLeaveInput"
      />
      <div class="warning-message" v-if="hasWarning">没有<span>{{ selectedValue && selectedValue[1] }}</span>号的月份，将自动处理为当月最后一日</div>
    </el-form-item>
  </div>
</template>

<script>
import XtWeb from 'xtion-web'
import './index.less'
import List from './List.vue'
import * as util from './util'
import RuleMixin from './RuleMixin'

export default {
  mixins: [XtWeb.Widget.UI.InputView, RuleMixin],
  components: {
    List
  },
  props: {
    selectRange: {
      type: String,
      default: 'hour-minute'
    },
    value: String
  },
  data () {
    return {
      // inputLabel: '',
      popoverStatus: false,
      // monthValue: '',
      // dayValue: '',
      // hourValue: '',
      // minuteValue: '',

      monthOptions: [],
      dayOptions: [],
      hourOptions: [],
      minuteOptions: [],

      selectedValue: ['', '', '', ''], // month, day, hour, minute
      oldValue: ['', '', '', ''],
      inputIcon: 'caret-bottom'
    }
  },
  computed: {
    // inputIcon() {
    //   return 'caret-bottom'
    // },
    inputLabel () {
      let selectRange = this.selectRange
      let month = this.selectedValue[0]
      let day = this.selectedValue[1]
      let hour = util.formatHourToChinese(this.selectedValue[2])
      let minute = util.fixedDateNumber(this.selectedValue[3])
      if (selectRange === 'hour') {
        return hour ? `每天${hour}` : ''
      } else if (selectRange === 'day') {
        return day ? `每月${day}号` : ''
      } else if (selectRange === 'month') {
        return month ? `每年${month}月` : ''
      } else if (selectRange === 'hour-minute') {
        return hour ? `每天${hour}时${minute}分` : ''
      } else if (selectRange === 'day-minute') {
        return day ? `每月${day}号${hour}时${minute}分` : ''
      } else if (selectRange === 'month-minute') {
        return month ? `每年${month}月${day}号${hour}时${minute}分` : ''
      } else {
        return ''
      }
    },
    inputValue () {
      // month, day, hour, minute
      let selectRange = this.selectRange
      if (selectRange === 'hour') {
        return this.selectedValue[2]
      } else if (selectRange === 'day') {
        return this.selectedValue[1]
      } else if (selectRange === 'month') {
        return this.selectedValue[0]
      } else if (selectRange === 'hour-minute') {
        return this.selectedValue[2] ? util.fixedDateNumber(this.selectedValue[2]) + ':' + util.fixedDateNumber(this.selectedValue[3]) : ''
      } else if (selectRange === 'day-minute') {
        return this.selectedValue[1] ? this.selectedValue[1] + ' ' + util.fixedDateNumber(this.selectedValue[2]) + ':' + util.fixedDateNumber(this.selectedValue[3]) : ''
      } else if (selectRange === 'month-minute') {
        return this.selectedValue[0] ? this.selectedValue[0] + '-' + this.selectedValue[1] + ' ' + util.fixedDateNumber(this.selectedValue[2]) + ':' + util.fixedDateNumber(this.selectedValue[3]) : ''
      } else {
        return ''
      }
    },
    hasWarning () {
      if (this.selectedValue[1] && parseInt(this.selectedValue[1]) > 28) {
        return true
      }
      return false
    },
    hasMonth () {
      return !!~this.selectRange.indexOf('month')
    },
    hasDay () {
      return this.selectRange === 'month-minute' || this.selectRange === 'day-minute' || this.selectRange === 'day'
    },
    hasHour () {
      return !!~this.selectRange.indexOf('minute') || this.selectRange === 'hour'
    },
    hasMinute () {
      return !!~this.selectRange.indexOf('minute')
    },
    dayDisabled () {
      return !this.selectedValue[0] && this.hasMonth
    },
    hourDisabled () {
      return !this.selectedValue[1] && this.hasDay
    },
    minuteDisabled () {
      return !this.selectedValue[2] && this.hasHour
    }
  },
  watch: {
    value (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updateValue()
      }
    }
  },
  created () {
    this.monthOptions = util.createOptions(12, 1)
    this.dayOptions = util.createOptions(31, 1)
    this.hourOptions = util.createOptions(24)
    this.minuteOptions = util.createOptions(60)
    if (this.value) {
      this.updateValue()
    }
  },
  methods: {
    updateValue () {
      let selectRange = this.selectRange
      if (!this.value) {
        return
      }
      if (selectRange === 'hour') {
        this.selectedValue.splice(2, 1, this.value + '')
      } else if (selectRange === 'day') {
        this.selectedValue.splice(1, 1, this.value + '')
      } else if (selectRange === 'month') {
        this.selectedValue.splice(0, 1, this.value + '')
      } else if (selectRange === 'hour-minute') {
        let [ hour, minute = '0' ] = this.value.split(':')
        this.selectedValue.splice(2, 1, hour + '')
        this.selectedValue.splice(3, 1, minute + '')
      } else if (selectRange === 'day-minute') {
        let [ day, other = ':' ] = this.value.split(' ')
        let [ hour, minute = '0' ] = other.split(':')
        this.selectedValue.splice(1, 1, day + '')
        this.selectedValue.splice(2, 1, hour + '')
        this.selectedValue.splice(3, 1, minute + '')
      } else if (selectRange === 'month-minute') {
        let [ monthAndDay, hourAndMinute = ':' ] = this.value.split(' ')
        let [ month, day = '0' ] = monthAndDay.split('-')
        let [ hour, minute = '0' ] = hourAndMinute.split(':')
        this.selectedValue.splice(0, 1, month + '')
        this.selectedValue.splice(1, 1, day + '')
        this.selectedValue.splice(2, 1, hour + '')
        this.selectedValue.splice(3, 1, minute + '')
      }
    },
    handleMouseEnterInput () {
      if (this.inputValue && !this.readonly) {
        this.inputIcon = 'circle-close'
      } else {
        this.inputIcon = 'caret-bottom'
      }
    },
    handleMouseLeaveInput () {
      this.inputIcon = 'caret-bottom'
    },
    handleIconClick (e) {
      if (this.readonly) {
        return
      }
      e.stopPropagation()
      this.clearValue()
    },
    clearValue () {
      this.oldValue = ['', '', '', '']
      this.selectedValue = ['', '', '', '']
      this.popoverStatus = false
      this.$emit('input', '')
      this.popoverStatus = false
      // 提交input事件
    },
    setDefaultValue () {
      if (this.hasMonth) {
        // this.selectedValue[0] = new Date().getMonth() + 1 + ''
        this.selectedValue.splice(0, 1, new Date().getMonth() + 1 + '')
        // this.oldValue[0] = this.selectedValue[0]
      }
      if (this.hasDay) {
        // this.selectedValue[1] = new Date().getDate() + ''
        this.selectedValue.splice(1, 1, new Date().getDate() + '')
        // this.oldValue[1] = this.selectedValue[1]
      }
      if (this.hasHour) {
        // this.selectedValue[2] = new Date().getHours() + ''
        this.selectedValue.splice(2, 1, new Date().getHours() + '')
        // this.oldValue[2] = this.selectedValue[2]
      }
      if (this.hasMinute) {
        // this.selectedValue[3] = new Date().getMinutes() + ''
        this.selectedValue.splice(3, 1, new Date().getMinutes() + '')
        // this.oldValue[3] = this.selectedValue[3]
      }
    },
    handleConfirm () {
      this.popoverStatus = false
    },
    // 点击取消的时候，还原历史值
    handleCancel () {
      this.oldValue.forEach((od, index) => {
        // this.selectedValue[index] = od || ''
        this.selectedValue.splice(index, 1, od || '')
      })
      this.popoverStatus = false
      this._clickCancel = true
    },
    // 每次手动变更的时候保存旧的值
    handleItemChange (index, newVal, oldValue) {
    //   // this.oldValue[index] = oldValue
    //   if (index === 1) {
    //     if (parseInt(newVal, 10) > 28) {
    //       // 需要提示确认是否真的选这个数据，因为不是每个月都有28以上得，2月 28 29

    //     }
    //   }
    },
    handlePopoverHide () {
      // 只有不是点击cancel的时候才执行confirm
      if (this._clickCancel) {
        this.$nextTick(() => {
          delete this._clickCancel
        })
        return
      }
      this.$emit('input', this.inputValue)
    },
    handlePopoverShow () {
      this.oldValue = this.selectedValue.map(item => {
        return item
      })
      if (!this.inputValue && !this.readonly) {
        this.setDefaultValue()
      }
    }
  }
}
</script>

<style scoped>
</style>
