<template>
    <div ref="member-list-main" class="member-list-main">
        <!-- 查询条件 -->
        <nav class="m-list-search">
            <section class="list-search-section">
                <el-input
                    style="width: 135px"
                    v-model="username"
                    placeholder="姓名"
                    icon="search"
                    :on-icon-click="usernameChange"
                    @keyup.enter.native="usernameChange">
                </el-input>
                <div class="spacer"></div>
                <xt-picktree
                    style="height: 36px;width: 135px"
                    :clearable="true"
                    :inputmodel="true"
                    :treeData="marketAreas"
                    :defaultProps="treeProps"
                    :onvaluechange="treeValueChange"
                    :defaultExpandedKeys="defaultExpandedKeys"
                    titlewidth="0"
                    nodeKey="orgstructid"
                    placeholder="营销组织">
                </xt-picktree>
            </section>
            <section class="list-search-section">
                <el-select v-model="monitorStatus" placeholder="监控状态" @change="monitorChange" clearable
                           style="width: 135px">
                    <el-option
                        v-for="item in monitorOptions"
                        :key="item.value"
                        :label="item.text"
                        :value="item.value">
                    </el-option>
                </el-select>
                <div class="spacer"></div>
                <el-select v-model="status" placeholder="人员状态" @change="statusChange" clearable
                           style="width: 135px">
                    <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.text"
                        :value="item.value">
                    </el-option>
                </el-select>
            </section>
        </nav>
        <!-- 人员列表 -->
        <el-row class="m-track-list">
            <el-table
                v-loading.body="usersLoading"
                :data="users"
                :show-header="false"
                :highlightCurrentRow="true"
                :height="tableHeight"
                @current-change="userChange"
                style="width: 100%!important;">
                <el-table-column prop="userinfoname" label="姓名">
                    <template slot-scope="scope">
                        <div>
                            <div>{{ scope.row.userinfoname }}</div>
                            <div style="color: #888;font-size: 12px;">
                                {{ scope.row.saleareaname }}
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    width="100"
                    prop="positionname"
                    label="岗位">
                </el-table-column>
            </el-table>
            <div class="pager">
                <div class="m-pagination">
                    <a class="btn btn-default btn-xs" @click="firstPage()">
                        <span class="glyphicon glyphicon-fast-backward"></span>
                    </a>
                    <a class="btn btn-default btn-xs" @click="prevPage()">
                        <span class="glyphicon glyphicon-backward"></span>
                    </a>
                    <span class="ml20">第 <span class="ng-binding">{{ userPager.pageindex + 1 }}</span> 页</span>
                    <span class="mr15">共 <span class="ng-binding">{{ userPageTotal }}</span> 页</span>
                    <a class="btn btn-default btn-xs" @click="nextPage()">
                        <span class="glyphicon glyphicon-forward"></span>
                    </a>
                    <a class="btn btn-default btn-xs" @click="lastPage()">
                        <span class="glyphicon glyphicon-fast-forward"></span>
                    </a>
                </div>
            </div>
        </el-row>
    </div>
</template>

<script>
    import XtWeb from 'xtion-web'
    import $ from 'jquery'

    export default {
        name: 'SearchUserMenu',
        components: {
            'xt-picktree': XtWeb.Widget.UI.Picktree
        },
        props: ['screenHeight'],
        data() {
            return {
                // 人员状态
                status: '1',
                orgstructid: '',
                marketAreas: [],
                defaultExpandedKeys: [],
                // 当前选中人员
                currentUser: null,
                // 查询 -> 姓名
                username: '',
                // 人员列表
                users: [],
                usersLoading: false,
                // 查询 -> 营销组织
                treeProps: {
                    label: 'orgname',
                    children: 'children'
                },
                // 人员列表分页
                userPager: {
                    pageindex: 0,
                    pagesize: 50,
                    itemcount: 0
                },
                // 是否监控
                monitorStatus: '1',
                monitorOptions: [{
                    text: '已监控',
                    value: '1'
                }, {
                    text: '未监控',
                    value: '0'
                }
                ],
                statusOptions: [{
                    text: '启用',
                    value: '1'
                }, {
                    text: '停用',
                    value: '2'
                }
                ],
                elTableScroll: null
            }
        },
        created() {
            this.loadMarketAreas() // 加载营销组织
            this.loadUsers() // 加载人员列表
        },
        mounted() {
            let $elTableScroll = $('.el-table__body-wrapper', this.$refs['member-list-main'])
            $elTableScroll[0] && (this.elTableScorll = $elTableScroll[0])
        },
        computed: {
            userPageTotal() {
                return Math.ceil(this.userPager.itemcount / this.userPager.pagesize)
            },
            tableHeight() {
                return this.screenHeight - 216
            }
        },
        methods: {
            scrollGoTop() {
                if (this.elTableScorll) this.elTableScorll.scrollTop = 0
            },
            // 切换用户名
            usernameChange() {
                this.userPager.pageindex = 0
                this.loadUsers()
            },
            // 切换营销组织
            treeValueChange(tree, node) {
                this.userPager.pageindex = 0
                if (node.length > 0) {
                    this.orgstructid = node[0].orgstructid
                } else {
                    this.orgstructid = ''
                }
                this.loadUsers()
            },
            // 切换监控状态
            monitorChange() {
                this.userPager.pageindex = 0
                this.loadUsers()
            },
            // 切换人员状态
            statusChange() {
                this.userPager.pageindex = 0
                this.loadUsers()
            },
            // 切换人员
            userChange(currentRow) {
                this.$emit('click-item', currentRow)
            },
            firstPage() {
                if (this.userPager.pageindex !== 0) {
                    this.userPager.pageindex = 0
                    this.loadUsers()
                }
            },
            prevPage() {
                if (this.userPager.pageindex > 0) {
                    this.userPager.pageindex--
                    this.loadUsers()
                }
            },
            nextPage() {
                if (this.userPager.pageindex < this.userPageTotal - 1) {
                    this.userPager.pageindex++
                    this.loadUsers()
                }
            },
            lastPage() {
                if (this.userPager.pageindex !== this.userPageTotal - 1) {
                    this.userPager.pageindex = this.userPageTotal - 1
                    this.loadUsers()
                }
            },
            // 加载营销组织
            loadMarketAreas() {
                let that = this
                let params = {
                    pl_orgstruct: {
                        orgname: '',
                        parentorgstructid: '',
                        status: '1'
                    }
                }
                let marketAreaUrl = '/api/teapi/dy-biz/100000000000000000/110000000000000000'

                that.$http.post(marketAreaUrl, params).then(response => {
                    let marketAreas = response.body.resp_data.pl_orgstruct
                    if (marketAreas.length !== 0) {
                        marketAreas.forEach(marketArea => {
                            marketArea.label = marketArea.orgname
                            marketArea.text = marketArea.orgname
                            marketArea.key = marketArea.orgstructid
                            marketArea.realkey = marketArea.orgstructid
                            marketArea.id = marketArea.orgstructid
                            marketArea.parentid = marketArea.parentorgstructid
                            marketArea.parentkey = marketArea.parentorgstructid
                        })
                        // TODO: xt-picktree控件更新，不需要传入树结构，只需要传入具有指定值（key,realkey,parentid,id,text)的数组即可
                        // that.marketAreas = that.buildTree(marketAreas, 'orgstructid', 'parentorgstructid', 'children')
                        that.marketAreas = marketAreas
                        that.defaultExpandedKeys = [marketAreas[0].orgstructid]
                    }
                }).catch(error => {
                    console.log('获取营销组织失败：' + error)
                })
            },
            // 加载人员列表
            loadUsers() {
                let that = this
                let userUrl = `/api/teapi/dy-biz/955688207075381346/955688207075381345`
                let params = {
                    member: {
                        saleareaid: that.orgstructid,
                        parentorgstructid: '',
                        orgname: that.username,
                        monitorstatus: that.monitorStatus,
                        status: that.status,
                        orgstructtypeid: '',
                        userinfoid: '',
                        orgtypeid: '',
                        orgstructdescr: '',
                        codepath: '',
                        fullname: '',
                        seq: ''
                    },
                    __paging: {
                        __pageindex: '' + that.userPager.pageindex,
                        __pagesize: '' + that.userPager.pagesize
                    }
                }

                that.usersLoading = true
                that.$http.post(userUrl, params).then(response => {
                    that.users = response.data.resp_data.member
                    let pager = response.body.resp_data.__paging
                    that.userPager.pageindex = parseInt(pager.__pageindex)
                    that.userPager.itemcount = parseInt(pager.__itemcount)
                    that.currentUser = null
                    that.usersLoading = false
                    that.scrollGoTop()
                }).catch(error => {
                    console.log('获取人员列表失败：' + error)
                    that.usersLoading = false
                })
            }
        }
    }
</script>
