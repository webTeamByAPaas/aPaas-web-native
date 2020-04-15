<template>
    <div class="visit-route-manager-container visit-module-container" v-loading.body="loading"
         :element-loading-text="loadingText">
        <div class="tree-view-container">
            <div class="filter">
                <div class="filter-item-container">
                    <el-input
                        :maxlength="100"
                        :placeholder="$t('组织名称/人员姓名')"
                        v-model="treeFilter.name"
                        icon="search"
                        :on-icon-click="loadOrgTreeData"
                        @keyup.native.enter="loadOrgTreeData"
                    >
                    </el-input>
                </div>
            </div>
            <div class="tree-container" style="margin-right: 10px">
                <xt-picktree
                    ref="orgTree"
                    style="height:100%"
                    :lazy="false"
                    :data="treeData"
                    :defaultExpandedKeys="defaultExpandedKeys"
                    :defaultSelectedKeys="(curOrgStruct && curOrgStruct.orgstructid !== '') != null ? [curOrgStruct.orgstructid] : []"
                    @onSelect="handleTreeNodeClick"
                >
                </xt-picktree>
            </div>
        </div>
        <div class="visit-route-container" id="routeContainer">
            <div class="import-export-container">
                <xt-button :onclicked="handleImport" text="导入" customicon="c-import" displaytype="default"></xt-button>
                <xt-button :onclicked="handleExport" text="导出" customicon="c-export" displaytype="default"></xt-button>
            </div>
            <el-tabs v-model="routeTab">
                <el-tab-pane label="循环路线" name="first">
                    <route-manage
                        v-if="routeTab === 'first'"
                        :lineType="'1'" :routeTab="routeTab"
                        :orgStruct="curOrgStruct" key="1"
                        :sysConfigSType="sysConfigSType"
                        :channelCustomerTypeVisible="systemConfig.channelCustomerType"
                        :auth="routeAuth"
                        :parentVM="this"
                        :searchOptionsData="searchOptionsData"
                        :screenHeight="screenHeight"
                    ></route-manage>
                </el-tab-pane>
                <el-tab-pane label="定期路线" name="second">
                    <route-manage
                        v-if="routeTab === 'second'"
                        :lineType="'2'"
                        :routeTab="routeTab"
                        :orgStruct="curOrgStruct"
                        key="2"
                        :sysConfigSType="sysConfigSType"
                        :channelCustomerTypeVisible="systemConfig.channelCustomerType"
                        :auth="routeAuth"
                        :parentVM="this"
                        :searchOptionsData="searchOptionsData"
                        :screenHeight="screenHeight"
                    ></route-manage>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<script>
    import XtWeb from 'xtion-web'
    import { searchOptions, inputAroundRoute, outputAroundRoute, inputRegularRoute, outputRegularRoute } from './api'
    import { getView, executeEvent } from './api/utils.js'
    import { CreateTree, deepCopy, getDefaultTreeSetInfo, errorMessage } from './utils'
    import RouteManage from './components/RouteManage'
    const ROUTE_TRANSFER = '1188993877676265571'
    const STORE_ROW_LEVEL = '1188993877676265567'
    const STORE_EXTRA_SEARCH = '1188993877676265565'

    export default {
        name: 'route-manager',
        mixins: [XtWeb.Widget.UI.View],
        data: function () {
            return {
                loading: false,
                loadingText: '',
                treeFilter: {
                    name: '',
                    type: '',
                    isCountRoute: false
                },
                orgTreeData: [],
                defaultProps: {
                    children: 'children',
                    label: 'orgname'
                },
                routeTab: 'first',
                activeDimension: '',
                dimensions: [],
                orgstructtypeid: '',
                curOrgStruct: '',
                defaultExpandedKeys: [],
                filename: '',
                icon: 'c-add',
                sysConfigSType: '', // 系统配置，根据该配置值判断路线是否可以挂接在组织，0-只能挂接在人员，1-路线可以挂接在人和组织，但只能在末级节点新增路线和计划,3-只能在组织上新增路线和计划，默认为0
                systemConfig: {
                    channelCustomerType: true // 是否显示客户列表中的渠道客户类型字段
                },
                routeAuth: {
                    showCustomerDetail: false,
                    routeTransfer: false,
                    storeRowLevel: false,
                    storeExtraSearch: false,
                    storeTableIsPage: false
                },
                searchOptionsData: {
                    channelTypeData: [],
                    storeLevelData: [],
                    storeTypeData: [],
                    channelCustomerTypeData: []
                },
                screenHeight: 800,
                treeData: []
            }
        },
        components: {
            RouteManage,
            'xt-picktree': XtWeb.Widget.UI.Atree,
            'xt-button': XtWeb.Widget.UI.Button
        },
        created: function () {
            this.loadOrgTreeData()
            this.loadSystemConfig()
            this.getSearchOptions()
            this.routeAuth = {
                showCustomerDetail: (this.viewRule && this.viewRule.showcustomerdetail === '1'),
                routeTransfer: this.isJudgeFunctioncode('route_transfer'),
                storeRowLevel: this.isJudgeFunctioncode('store_row_level'),
                storeExtraSearch: this.isJudgeFunctioncode('store_extra_search'),
                storeTableIsPage: (this.viewRule && this.viewRule.storetableispage === '1')
            }
        },
        mounted() {
            let getScreenHeight = () => {
                this.screenHeight = document.body.offsetHeight
            }
            getScreenHeight()
            window.onresize = getScreenHeight
        },
        destroyed() {
            window.onresize = null
        },
        methods: {
            executeEvent,
            getView,
            // 获取系统配置信息,通过系统配置实现一些租户的特定需求
            loadSystemConfig() {
                this.loading = true
                this.$http.post('/api/teapi/dy-biz/1038977060778938467/1144514592366530659', {
                    pl_globalconfig: {
                        key: 'visitlistconfig'
                    }
                }).then(res => {
                    this.loading = false
                    let confjson = res.data.resp_data.confjson
                    if (confjson && confjson.channelcustomertype && confjson.channelcustomertype === '0') {
                        // 如果配置了‘channelcustomertype’参数，‘0’-不显示渠道客户类型字段，‘1’-显示该字段，
                        this.systemConfig.channelCustomerType = false
                    } else {
                        // 默认显示渠道客户类型字段
                        this.systemConfig.channelCustomerType = true
                    }
                }).catch(error => {
                    this.loading = false
                    errorMessage(this, error)
                })
            },
            // 过滤树节点
            filterNode(value, data) {
                if (!value) return true
                return data.orgname.indexOf(value) !== -1
            },
            // 组织树节点点击回调
            handleTreeNodeClick(node) {
                this.curOrgStruct = node
            },
            // 加载组织树数据
            loadOrgTreeData() {
                this.loading = true
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103458932594184282', {
                    pl_orgstruct: {
                        orgname: this.treeFilter.name
                    }
                }).then(res => {
                    let respData = res.data.resp_data
                    let orgTreeData = new CreateTree(respData.pl_orgstruct).init('orgstructid', 'parentorgstructid', 'orgname') || []
                    let tempOrgInstDatas = respData.pl_orgstruct
                    let defaultTreeSetInfo
                    this.sysConfigSType = respData.visitconfig && respData.visitconfig.stype ? respData.visitconfig.stype : '0'
                    defaultTreeSetInfo = getDefaultTreeSetInfo(orgTreeData, [], this.sysConfigSType)
                    if (tempOrgInstDatas.length !== 0) {
                        tempOrgInstDatas.forEach((orgInstData, index) => {
                            tempOrgInstDatas[index] = Object.assign({}, orgInstData, {
                                label: orgInstData.orgname,
                                text: orgInstData.orgname,
                                key: orgInstData.orgstructid,
                                realkey: orgInstData.orgstructid,
                                id: orgInstData.orgstructid,
                                parentid: orgInstData.parentorgstructid,
                                parentkey: orgInstData.parentorgstructid,
                                codepath: orgInstData.codepath
                            })
                        })
                    }
                    // TODO: xt-picktree控件更新，不需要传入树结构，只需要传入具有指定值（key,realkey,parentid,id,text)的数组即可
                    this.treeData = tempOrgInstDatas
                    this.curOrgStruct = defaultTreeSetInfo.defaultOrgStruct
                    this.defaultExpandedKeys = defaultTreeSetInfo.defaultExpandedKeys
                    this.loading = false
                }).catch(error => {
                    this.loading = false
                    errorMessage(this, error)
                })
            },
            // 导入
            handleImport() {
                // 判断导入的是循环路线还是定期路线（first-循环路线，second-定期路线）
                if (this.routeTab === 'first') {
                    inputAroundRoute.call(this)
                } else {
                    inputRegularRoute.call(this)
                }
            },
            // 导出
            handleExport() {
                // 判断导出的是循环路线还是定期路线（first-循环路线，second-定期路线）
                if (this.routeTab === 'first') {
                    outputAroundRoute.call(this, {
                        'orgname': this.curOrgStruct ? this.curOrgStruct.orgname : ''
                    })
                } else {
                    outputRegularRoute.call(this, {
                        'orgname': this.curOrgStruct ? this.curOrgStruct.orgname : ''
                    })
                }
            },
            /* @API */
            apiUrl: function (url, body) {
                let _this = this
                return this.$http.post(url, body)
            },
            setView(data, type, setter) { // 重写引擎取控件值的方法
                if (this.$refs.posinst && this.$refs.posinst) {
                    return this.$refs.posinst.setView(data, type, setter)
                }
            },
            getSearchOptions() {
                (async () => {
                    let channelTypeData = await searchOptions.call(this, {
                        dictionarycode: '893269583996260404',
                        objectmark: 'kx_channeltype'
                    })
                    let storeLevelData = await searchOptions.call(this, {
                        dictionarycode: '893293206815510625',
                        objectmark: 'kx_storelevel'
                    })
                    let storeTypeData = await searchOptions.call(this, {
                        dictionarycode: '893269583996260403',
                        objectmark: 'kx_storetype'
                    })
                    let channelCustomerTypeData = await searchOptions.call(this, {
                        dictionarycode: '893288512944738328',
                        objectmark: 'kx_channelcustomertype'
                    })
                    this.searchOptionsData = {
                        channelTypeData,
                        storeLevelData,
                        storeTypeData,
                        channelCustomerTypeData
                    }
                })()
            },
            // 校验功能点方法
            isJudgeFunctioncode(code) {
                let functioncode
                switch (code) {
                    case 'route_transfer':
                        functioncode = ROUTE_TRANSFER
                        break
                    case 'store_row_level':
                        functioncode = STORE_ROW_LEVEL
                        break
                    case 'store_extra_search':
                        functioncode = STORE_EXTRA_SEARCH
                        break
                }
                return XtWeb.Service.Permission.checkFunc(functioncode)
            }
        }
    }
</script>
<style src='./assets/styles/common.css'></style>
<style src='./assets/styles/route.css'></style>
