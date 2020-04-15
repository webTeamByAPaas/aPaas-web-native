<template>
    <div>
        <div class="order-list-container">
            <div class="title">
                <div class="line">
                    <div class="line-item">客户编码</div>
                    <div class="line-item">客户名称</div>
                    <div class="line-item">排序</div>
                </div>
            </div>
            <draggable v-model="customerList">
                <div class="line" v-for="(item, index) in customerList" :key="index">
                <div class="line-item">{{item.customercode}}</div>
                <div class="line-item">{{item.customername}}</div>
                <div class="line-item"><i class="fa fa-arrows"></i></div>
                </div>
            </draggable>
        </div>
        <div class="btn-container">
            <el-button @click="cancel">取消</el-button>
            <el-button @click="save" type="primary">保存</el-button>
        </div>
    </div>
</template>
<script>
    import { deepCopy } from '../utils'
    import draggable from 'vuedraggable'
    export default {
        props: ['param'],
        data: function() {
            return {
                customerList: []
            }
        },
        components: {
            draggable
        },
        created: function() {
            this.customerList = deepCopy(this.param)
        },
        methods: {
            cancel() {
                this.$emit('cancel')
            },
            save() {
                this.customerList.forEach((item, index) => {
                    item.seq = index + 1 + ''
                })
                this.$emit('save', this.customerList)
            }
        }
    }
</script>
<style scoped>
.order-list-container {border-left: 1px solid #DFE6EC;}
.order-list-container .title {border-top: 1px solid #DFE6EC;}
.order-list-container .title .line-item {background-color: #EEF1F6; font-weight: 700;}
.order-list-container .line {display: flex; line-height: 48px; text-align: center;}
.order-list-container .line:hover {background-color: #F5F7FA;}
.order-list-container .line .line-item {flex: 1; border-right: 1px solid #DFE6EC; border-bottom: 1px solid #DFE6EC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
.order-list-container .line .line-item i {cursor: pointer;}
</style>