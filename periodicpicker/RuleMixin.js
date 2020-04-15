export default {
  computed: {
    rules () {
      return this.required ? [{
        required: true,
        trigger: 'change',
        validator: function (rule, value, callback, source, options) {
          // 1.1
          // 控件在popview中
          if (this.isInPopView()) {
            // 有打开弹框
            if (this.hasPopViewOpen()) {
              // 打开弹框，但是不再弹框活跃状态的弹框 不用校验
              if (!this.isInTopPopView()) {
                callback()
                return
              }
            } else {
              // 没有打开弹框，不用检验
              callback()
              return
            }
          } else {
            // 打开弹框 不在弹框中的孔家你，不校验
            if (this.hasPopViewOpen()) {
              callback()
              return
            }
          }
          if (!this.inputValue) {
            // callback(this.$t('请选择') + ' ' + this.title)
            callback(this.translate('请选择\\(var)', {
              var: this.$t(this.title)
            }))
          }
          callback()
        }.bind(this)
      }] : []
    }
  }
}
