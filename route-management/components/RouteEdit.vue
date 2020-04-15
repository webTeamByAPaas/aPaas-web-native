<template>
    <div>
        <el-form ref="form" :model="form" label-width="126px" :rules="formRules" @submit.native.prevent>
            <el-form-item :label="$t('路线名称')" prop="linename">
                <el-input :maxlength="100" :placeholder="$t('请输入路线名称')" v-model="form.linename"></el-input>
            </el-form-item>
            <el-form-item v-if="lineType === '2'" :label="$t('拜访星期')" prop="tn_weekday">
                <el-select :maxlength="100" :placeholder="$t('请选择拜访星期')" v-model="form.tn_weekday">
                    <el-option v-for="item in dayStruct" :value="item.value" :label="item.label" :key="item.value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div class="btn-container">
            <el-button @click="cancel">取消</el-button>
            <el-button @click="save" type="primary">保存</el-button>
        </div>
    </div>
</template>
<script>
    import { dayStruct } from '../utils'
    export default {
        props: ['param', 'lineType'],
        data: function() {
            return {
                formRules: {
                    linename: { required: true, message: '请输入路线名称' },
                    tn_weekday: { required: true, message: '请选择拜访星期' }
                },
                form: {
                    linename: '',
                    tn_weekday: ''
                },
                dayStruct: dayStruct
            }
        },
        created() {
            this.init()
        },
        methods: {
            init() {
                this.form.lineid = this.param.lineid ? this.param.lineid : ''
                this.form.linename = this.param.linename ? this.param.linename : ''
                this.form.tn_weekday = this.param.tn_weekday ? this.param.tn_weekday : ''
            },
            save() {
                this.$refs['form'].validate(value => {
                    if (value) {
                        this.$emit('save', this.form)
                    } else {
                        return false
                    }
                })
            },
            cancel() {
                this.$emit('cancel')
            }
        }
    }
</script>
