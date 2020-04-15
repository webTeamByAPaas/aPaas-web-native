<template>
    <div class="member-select-dialog">
        <header class="member-select-dialog-header">
            <div class="spacer"></div>
            <el-input v-model="searchName" placeholder="人员名称" style="width: 200px" type="search"></el-input>
            <el-form ref="form" :model="form" label-width="90px">
                <xt-picktree ref="orgInst"
                             :inputmodel="true"
                             :treeData="orgInstData"
                             :initValue="initValue.organize"
                             :onvaluechange="(vm, [obj], type) => getTreeNode(obj, type)"
                             titlewidth="0"
                             nodeKey="key"
                             placeholder="请选择营销组织"
                             :clearable="true"
                >
                </xt-picktree>
            </el-form>
        </header>
        <nav class="member-select-dialog-nav">
            <el-button :disabled="!selectRow" @click="handleSelect">选择</el-button>
        </nav>
        <section class="member-select-dialog-section">
            <el-table class="minheight" :height="400" v-loading.body="loading" :data="pageData"
                      row-key="id" stripe resizable border>
                <el-table-column class-name="radio-td" prop="positionname" :label="$t('')" width="44">
                    <template slot-scope="scope">
                        <div>
                            <el-radio class="radio" v-model="selectRow" :label="scope.row.orgstructid"></el-radio>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="fullname" :label="$t('营销组织')">
                </el-table-column>
                <el-table-column prop="orgname" :label="$t('人员姓名')">
                </el-table-column>
                <el-table-column prop="positionname" :label="$t('岗位')">
                </el-table-column>
                <el-table-column prop="phonenumber" :label="$t('手机号')">
                </el-table-column>
            </el-table>
            <section class="xt-table-footer">
                <el-pagination class="xt-pagination" @current-change="handleCurrentPageChange"
                               :current-page="currentPage" :page-size="pageSize"
                               layout="prev, pager, next, jumper, total" :total="totalSize">
                </el-pagination>
            </section>
        </section>
    </div>
</template>

<script>
    import XtWeb from 'xtion-web'
    import { selectMemberList } from '../../../api'
    export default {
        name: 'memberSelectDialog',
        props: ['props'],
        data() {
            return {
                loading: false,
                tableData: [],
                pageSize: 20,
                currentPage: 1,
                selectRow: '',
                searchName: '',
                selectOrganize: null,
                orgInstData: [],
                initValue: {
                    organize: []
                },
                form: {}
            }
        },
        components: {
            'xt-picktree': XtWeb.Widget.UI.Picktree
        },
        created() {
            this.orgInstData = JSON.parse(JSON.stringify(this.props.orgInstData))
            this.initValue.organize = [null]
        },
        mounted() {
            if (this.props.selectData) {
                let selectData = JSON.parse(JSON.stringify(this.props.selectData))
                this.selectRow = selectData.orgstructid
            }
            (async () => {
                this.tableData = await selectMemberList.call(this.props.parentVM, {
                    orgstructid: this.props.memberId
                })
            })()
        },
        computed: {
            nameFilterData() {
                if (!this.searchName) return this.tableData
                let reg = new RegExp(this.searchName)
                return this.tableData.filter(item => reg.test(item.orgname))
            },
            orgFilterData() {
                if (!this.selectOrganize) return this.nameFilterData
                let reg = new RegExp(this.selectOrganize.orgname)
                return this.nameFilterData.filter(item => reg.test(item.fullname))
            },
            totalSize() {
                return this.orgFilterData.length
            },
            // 计算当前页的数据
            pageData() {
                if (!this.orgFilterData.length) return []
                let pageSize = this.pageSize
                let start = (this.currentPage - 1) * pageSize
                return this.orgFilterData.slice(start, start + pageSize)
            }
        },
        methods: {
            getTreeNode: function (obj, type) {
                if (typeof obj === 'object' && type === 'select') {
                    this.selectOrganize = obj
                } else if (type === 'clear') {
                    this.selectOrganize = null
                }
            },
            // 切换表格页事件
            handleCurrentPageChange(val) {
                this.currentPage = val
            },
            handleSelect() {
                let item = this.tableData.find(item => item.orgstructid === this.selectRow)
                if (item) this.props.handleSelect(item)
                XtWeb.Widget.UIService.SimpleModalService.pop()
            }
        }
    }
</script>
