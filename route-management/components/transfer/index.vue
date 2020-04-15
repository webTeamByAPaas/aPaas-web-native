<template>
    <div class="member-route-transfer-dialog">
        <section class="submit-form-section">
            <div class="form-item route-select-item">
                <label>转移路线选择</label>
                <div class="faker-input route-select-input" @click="handleOpenSelectRouteDialog">
                    {{routeDataText}}
                </div>
            </div>
            <div class="form-item member-select-item">
                <label>转移人员选择</label>
                <div class="faker-input member-select-input" @click="handleOpenSelectMemberDialog">
                    {{memberDataText}}
                </div>
            </div>
            <footer>提示：选择的转移人员必须负责路线内的所有客户，才可以将路线成功转移给他/她</footer>
        </section>
        <footer class="submit-form-footer">
            <div class="spacer"></div>
            <el-button @click="handleCancel">取消</el-button>
            <el-button @click="handleSubmit">确认</el-button>
        </footer>
    </div>
</template>

<script>
    import './css/index.less'
    import XtWeb from 'xtion-web'
    import routerSelect from './routerSelectDialog'
    import memberSelect from './memberSelectDialog'
    import { getOrganizeList, transferSubmit } from '../../api'

    export default {
        name: 'transfer',
        props: ['props'],
        data() {
            return {
                selectRouteData: [],
                selectMemberData: null,
                orgInstData: []
            }
        },
        created() {
            (async () => {
                this.orgInstData = await getOrganizeList.call(this.props.parentVM)
            })()
        },
        computed: {
            routeDataText() {
                if (this.selectRouteData.length === 0 || this.props.routeList.length === 0) return '请选择路线'
                let filterList = this.props.routeList.filter(item => {
                    return this.selectRouteData.findIndex(_item => item.lineid === _item) > - 1
                })
                filterList = filterList.map(item => item.linename)
                if (filterList.length > 0) return `已选择${filterList[0]}等，共${filterList.length}条路线`
                else return '请选择路线'
            },
            memberDataText() {
                if (!this.selectMemberData) return '请选择人员'
                return this.selectMemberData.orgname
            }
        },
        methods: {
            handleOpenSelectRouteDialog() {
                XtWeb.Widget.UIService.SimpleModalService.push(this, {
                    title: this.$t('选择路线'),
                    body: routerSelect,
                    customClass: 'dialog-select-route-detail apass-dialog-form',
                    props: {
                        routeList: this.props.routeList,
                        selectData: this.selectRouteData,
                        handleSelect: (selectData) => {
                            this.selectRouteData = JSON.parse(JSON.stringify(selectData))
                        }
                    },
                    close: function() {

                    }
                })
            },
            handleOpenSelectMemberDialog() {
                XtWeb.Widget.UIService.SimpleModalService.push(this, {
                    title: this.$t('选择人员'),
                    body: memberSelect,
                    customClass: 'dialog-select-member-detail apass-dialog-form',
                    props: {
                        parentVM: this.props.parentVM,
                        memberId: this.props.memberId,
                        routeList: this.props.routeList,
                        selectData: this.selectMemberData,
                        orgInstData: this.orgInstData,
                        handleSelect: (selectData) => {
                            this.selectMemberData = selectData
                        }
                    },
                    close: function() {

                    }
                })
            },
            handleCancel() {
                XtWeb.Widget.UIService.SimpleModalService.pop()
            },
            async handleSubmit() {
                if (this.selectRouteData.length < 1) {
                    this.$message.warning('请先选择转移路线')
                    return
                }
                if (!this.selectMemberData) {
                    this.$message.warning('请先选择转移人员')
                    return
                }
                await transferSubmit.call(this.props.parentVM, {
                    lineid: JSON.stringify(this.selectRouteData),
                    userid: this.selectMemberData.orgstructid
                })
                XtWeb.Widget.UIService.SimpleModalService.pop()
            }
        }
    }
</script>
