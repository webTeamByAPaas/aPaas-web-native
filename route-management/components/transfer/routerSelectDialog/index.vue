<template>
    <div class="route-select-dialog">
        <section class="transfer-section">
            <el-transfer
                filterable
                :filter-method="filterMethod"
                filter-placeholder="请输入关键字"
                :titles="['待选路线', '选中路线']"
                v-model="selectData"
                :data="routeList">
            </el-transfer>
        </section>
        <footer class="submit-form-footer">
            <div class="spacer"></div>
            <el-button @click="handleCancel">取消</el-button>
            <el-button @click="handleSubmit">确认</el-button>
        </footer>
    </div>
</template>

<script>
    import XtWeb from 'xtion-web'
    export default {
        name: 'routerSelectDialog',
        props: ['props'],
        data() {
            return {
                routeList: [],
                selectData: [],
                orgInstData: []
            }
        },
        mounted() {
            let routeList = JSON.parse(JSON.stringify(this.props.routeList))
            let selectData = JSON.parse(JSON.stringify(this.props.selectData))
            routeList.forEach(item => {
                item.key = item.lineid
                item.label = item.linename
            })
            this.routeList = routeList
            this.selectData = selectData
        },
        methods: {
            filterMethod(query, item) {
                let reg = new RegExp(query)
                return reg.test(item.label)
            },
            handleCancel() {
                XtWeb.Widget.UIService.SimpleModalService.pop()
            },
            handleSubmit() {
                this.props.handleSelect(this.selectData)
                XtWeb.Widget.UIService.SimpleModalService.pop()
            }
        }
    }
</script>
