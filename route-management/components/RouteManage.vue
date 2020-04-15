<template>
    <div class="route-container" v-loading.body="loading || loadingHandle">
        <div class="route-list">
            <div class="button-container">
                <el-button :disabled="disabledAddRoute" size="small" class="org-button" @click="routeAdd">
                    {{$t('新增')}}
                </el-button>
                <el-button :disabled="!curRoute.lineid" size="small" class="org-button" @click="routeEdit">
                    {{$t('编辑')}}
                </el-button>
                <el-button :disabled="!curRoute.lineid" size="small" class="org-button" @click="routeDelete">
                    {{$t('删除')}}
                </el-button>
                <el-button v-if="auth.routeTransfer" :disabled="!orgStruct.orgstructid || routeList.length === 0"
                           size="small" class="org-button"
                           @click="showTransformModel">
                    {{$t('转移')}}
                </el-button>
            </div>
            <div class="filter">
                <el-input
                    :maxlength="100"
                    :placeholder="$t('路线名称')"
                    v-model="filterRouteList.name"
                    icon="search"
                    :on-icon-click="handleSearch"
                    @keyup.native.enter="handleSearch">
                </el-input>
            </div>
            <div class="list">
                <ul>
                    <li v-for="item in routeList" :key="item.lineid" :class="{active: item.lineid === curRoute.lineid}"
                        @click="routeSwitch(item)">
                        <div class="name">路线名称：{{item.linename}}</div>
                        <div v-if="lineType === '2'" class="day">拜访星期：{{item.tn_weekdaytext}}</div>
                        <div class="customer-count">客户总数：{{item.customercount}}</div>
                    </li>
                </ul>
                <div v-if="routeList.length === 0" style="line-height: 36px; text-align: center;">
                    <span>暂无数据</span>
                </div>
            </div>
            <div
                style="position:absolute;bottom:0;left:0;width:100%;border:1px solid #dfe6ec;"
                class="pager">
                <div class="m-pagination">
                    <a href="javascript:void(0);" class="btn btn-default btn-xs" @click="firstPage();">
                        <span class="glyphicon glyphicon-fast-backward" title="第一页"></span>
                    </a>
                    <a href="javascript:void(0);" class="btn btn-default btn-xs" @click="prevPage();">
                        <span class="glyphicon glyphicon-backward" title="上一页"></span>
                    </a>
                    <span class="ml20">第 <span ng-bind="pageNo"
                                               class="ng-binding">{{ routeListPage.pageindex + 1 }}</span> 页</span>
                    <span class="mr15">共 <span ng-bind="pageCount" class="ng-binding">{{ routeListPageTotal }}</span> 页</span>
                    <a href="javascript:void(0);" class="btn btn-default btn-xs" @click="nextPage();">
                        <span class="glyphicon glyphicon-forward" title="下一页"></span>
                    </a>
                    <a href="javascript:void(0);" class="btn btn-default btn-xs" @click="lastPage();">
                        <span class="glyphicon glyphicon-fast-forward" title="最后一页"></span>
                    </a>
                </div>
            </div>
        </div>
        <div class="customer-container">
            <el-tabs v-model="customerTab">
                <el-tab-pane label="客户（列表）" name="first">
                </el-tab-pane>
                <el-tab-pane label="客户（地图）" name="second">
                </el-tab-pane>
            </el-tabs>
            <div class="filter-container">
                <div class="filter">
                    <div class="filter-item-container">
                        <el-select v-model="filterCustomer.isInline" @change="customerSearchList">
                            <el-option value="1" label="已添加客户"></el-option>
                            <el-option value="0" label="未添加客户"></el-option>
                        </el-select>
                    </div>
                    <div class="filter-item-container">
                        <el-select clearable v-model="filterCustomer.customerType" placeholder="客户类型"
                                   @change="customerSearchList">
                            <el-option value="905324680615956480" label="终端客户"></el-option>
                            <el-option value="905324761813487616" label="渠道客户"></el-option>
                        </el-select>
                    </div>
                    <div class="filter-item-container" v-show="isEndCustomer">
                        <el-select clearable v-model="filterCustomer.channelType" placeholder="渠道类型"
                                   @change="customerSearchList">
                            <el-option :label="item.label" :value="item.key" :key="item.key"
                                       v-for="item in channelTypeData"></el-option>
                        </el-select>
                    </div>
                    <div class="filter-item-container" v-show="isEndCustomer" v-if="storeTypeData.length > 0">
                        <el-form label-width="90px">
                            <xt-picktree ref="storeType"
                                         :inputmodel="true"
                                         :treeData="storeTypeData"
                                         :initValue="[]"
                                         :onvaluechange="(vm, [obj], type) => getTreeNode(obj, type, 'storeType')"
                                         titlewidth="0"
                                         nodeKey="key"
                                         placeholder="终端类型"
                                         :clearable="true"
                            >
                            </xt-picktree>
                        </el-form>
                    </div>
                    <div class="filter-item-container" v-show="isEndCustomer">
                        <el-select clearable v-model="filterCustomer.storeLevel" placeholder="终端级别"
                                   @change="customerSearchList">
                            <el-option :label="item.label" :value="item.key" :key="item.key"
                                       v-for="item in storeLevelData"></el-option>
                        </el-select>
                    </div>
                    <div class="filter-item-container" v-show="isChannelCustomer">
                        <el-form label-width="90px">
                            <xt-picktree ref="channelCustomerType"
                                         :inputmodel="true"
                                         :treeData="channelCustomerTypeData"
                                         :initValue="[]"
                                         :onvaluechange="(vm, [obj], type) => getTreeNode(obj, type, 'channelCustomer')"
                                         titlewidth="0"
                                         nodeKey="key"
                                         placeholder="渠道客户类型"
                                         :clearable="true"
                            >
                            </xt-picktree>
                        </el-form>
                    </div>
                    <div class="filter-item-container">
                        <el-input
                            :maxlength="100"
                            :placeholder="$t('客户名称')"
                            icon="search"
                            :on-icon-click="customerSearchList"
                            v-model="filterCustomer.name"
                            @keyup.native.enter="customerSearchList"
                        >
                        </el-input>
                    </div>
                </div>
            </div>
            <div v-show="customerTab === 'first'" class="tab-content" :style="{'height': `${tabContentHeight}px`}">
                <div class="list-container">
                    <div class="tools">
                        <xt-button :disabled="customerSelection.length === 0" v-if="filterCustomer.isInline === '1'"
                                   :onclicked="customerDelete" :text="$t('移除')" customicon="delete"
                                   displaytype="default"></xt-button>
                        <xt-button :disabled="customerList.length === 0" v-if="filterCustomer.isInline === '1'"
                                   :onclicked="customerSeq" :text="$t('排序')" customicon="c-sort"
                                   displaytype="default"></xt-button>
                        <xt-button :disabled="customerSelection.length === 0" v-if="filterCustomer.isInline === '0'"
                                   :onclicked="customerAdd" :text="$t('添加')" customicon="c-add"
                                   displaytype="default"></xt-button>
                        <!-- <el-button :disabled="customerSelection.length === 0" v-if="filterCustomer.isInline === '1'" class="org-button" @click="customerDelete">
                            <i class="icon-z-delete"></i>{{$t('移除')}}
                        </el-button>
                        <el-button :disabled="customerList.length === 0" v-if="filterCustomer.isInline === '1'" class="org-button" @click="customerSeq">
                            <i class="icon-z-sort"></i>{{$t('排序')}}
                        </el-button>
                        <el-button :disabled="customerSelection.length === 0" v-if="filterCustomer.isInline === '0'" class="org-button" @click="customerAdd">
                            <i class="icon-z-add"></i>{{$t('添加')}}
                        </el-button> -->
                    </div>
                    <div class="table-container">
                        <el-table :data="customerList" @select="customerSelect" @select-all="customerSelect"
                                  style="width:100%;" :height="tableHeight">
                            <el-table-column type="selection" :width="55"></el-table-column>
                            <el-table-column label="客户编码" prop="customercode" :min-width="140"></el-table-column>
                            <el-table-column label="客户名称" prop="customername" :min-width="140"></el-table-column>
                            <el-table-column label="客户类型" prop="customertype" :min-width="120"></el-table-column>
                            <el-table-column label="渠道类型" prop="channeltype" :min-width="120">
                                <template slot-scope="scope">
                                    <span>{{scope.row.customertype === '终端客户' ? scope.row.channeltype : ''}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="终端类型" prop="storetype" :min-width="120">
                                <template slot-scope="scope">
                                    <span>{{scope.row.customertype === '终端客户' ? scope.row.storetype : ''}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column v-if="auth.storeRowLevel" label="终端级别"
                                             prop="customerid__storelevel__dicvalue"
                                             :min-width="120"></el-table-column>
                            <el-table-column v-if="auth.showCustomerDetail" label="终端细分" prop="storesubdivide"
                                             :min-width="120"></el-table-column>
                            <el-table-column v-if=channelCustomerTypeVisible label="渠道客户类型"
                                             prop="channelcustomertype" min-width="140">
                                <template slot-scope="scope">
                                    <span>{{scope.row.customertype === '终端客户' ? '' : scope.row.channelcustomertype}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="客户地址" prop="address" :min-width="200">
                                <template slot-scope="scope">
                                    <span>{{scope.row.address ? JSON.parse(scope.row.address).address : ''}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column v-if="filterCustomer.isInline === '1'" label="频率" :min-width="160">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.custom_frequency"
                                               @change="customerChangeFrequency(scope.row)"
                                               :key="scope.row.customerid">
                                        <el-option-group v-for="(item, index) in period" :label="item.title"
                                                         :key="index">
                                            <el-option
                                                v-for="item1 in item.options"
                                                :value="item1.value"
                                                :label="item1.label"
                                                :key="item1.value"
                                            ></el-option>
                                        </el-option-group>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column v-if="filterCustomer.isInline === '1'" label="顺序" prop="seq"
                                             :width="75"></el-table-column>
                        </el-table>
                        <section v-if="auth.storeTableIsPage" class="xt-table-footer">
                            <el-pagination
                                class="xt-pagination"
                                @current-change="handleCurrentPageChange"
                                :current-page="page.current"
                                :page-size="page.size"
                                layout="prev, pager, next, jumper, total"
                                :total="page.total"
                            ></el-pagination>
                        </section>
                    </div>
                </div>
            </div>
            <div v-show="customerTab === 'second'" class="tab-content" :style="{'height': `${tabContentHeight}px`}">
                <div class="list-container">
                    <div class="map-container">
                        <el-amap
                            :vid="`amap-${lineType}`"
                            class="customer-list-map"
                            ref="customerListMap"
                            :amap-manager="mapData.amapManager"
                            :zoom="mapData.zoom"
                            :events="mapData.events"
                        >
<!--                            <div class="el-message" style="z-index: 2016;">-->
<!--                                <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSI0MHB4IiBoZWlnaHQ9IjQwcHgiIHZpZXdCb3g9IjAgMCA0MCA0MCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4NCiAgICA8dGl0bGU+aWNvbl9zdWNjZXNzPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkVsZW1lbnQtZ3VpZGVsaW5lLXYwLjIuNCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+DQogICAgICAgIDxnIGlkPSJNZXNzYWdlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNjAuMDAwMDAwLCAtMjEyLjAwMDAwMCkiPg0KICAgICAgICAgICAgPGcgaWQ9IuW4puWAvuWQkV/kv6Hmga8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLjAwMDAwMCwgMjEyLjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgIDxnIGlkPSJSZWN0YW5nbGUtMiI+DQogICAgICAgICAgICAgICAgICAgIDxnIGlkPSJpY29uX3N1Y2Nlc3MiPg0KICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS0yIiBmaWxsPSIjMTNDRTY2IiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiPjwvcmVjdD4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNy44MjU1ODE0LDE3LjE0ODQzNTcgTDE5LjAxNzQ0LDI1LjgyODEyMTMgQzE4LjkwMTE2MDksMjUuOTQyNzA4MyAxOC43NjU1MDMzLDI2IDE4LjYxMDQ2NywyNiBDMTguNDU1NDI3LDI2IDE4LjMxOTc2OTMsMjUuOTQyNzA4MyAxOC4yMDM0ODY1LDI1LjgyODEyMTMgTDE4LjAyOTA3MTYsMjUuNjU2MjUgTDEzLjE3NDQxODYsMjAuODQzNzUgQzEzLjA1ODEzOTUsMjAuNzI5MTYzIDEzLDIwLjU5NTQ4MzcgMTMsMjAuNDQyNzA0NyBDMTMsMjAuMjg5OTI5MyAxMy4wNTgxMzk1LDIwLjE1NjI1IDEzLjE3NDQxODYsMjAuMDQxNjY2NyBMMTQuMzY2Mjc3MiwxOC44NjcxODU3IEMxNC40ODI1NiwxOC43NTI2MDIzIDE0LjYxODIxNzcsMTguNjk1MzEwNyAxNC43NzMyNTc3LDE4LjY5NTMxMDcgQzE0LjkyODI5NCwxOC42OTUzMTA3IDE1LjA2Mzk1MTYsMTguNzUyNjAyMyAxNS4xODAyMzA3LDE4Ljg2NzE4NTcgTDE4LjYxMDQ2NywyMi4yNzYwMzggTDI1LjgxOTc2OTMsMTUuMTcxODcxMyBDMjUuOTM2MDQ4NCwxNS4wNTcyODggMjYuMDcxNzA2LDE1IDI2LjIyNjc0MjMsMTUgQzI2LjM4MTc4MjMsMTUgMjYuNTE3NDQsMTUuMDU3Mjg4IDI2LjYzMzcyMjgsMTUuMTcxODcxMyBMMjcuODI1NTgxNCwxNi4zNDYzNTIzIEMyNy45NDE4NjA1LDE2LjQ2MDkzNTcgMjgsMTYuNTk0NjE1IDI4LDE2Ljc0NzM5NCBDMjgsMTYuOTAwMTczIDI3Ljk0MTg2MDUsMTcuMDMzODUyMyAyNy44MjU1ODE0LDE3LjE0ODQzNTcgTDI3LjgyNTU4MTQsMTcuMTQ4NDM1NyBaIiBpZD0iUGF0aCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPg0KICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgPC9nPg0KICAgICAgICAgICAgPC9nPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+" alt="" class="el-message__img">-->
<!--                                <div class="el-message__group">-->
<!--                                    <p>移除成功</p>-->
<!--                                </div>-->
<!--                            </div>-->
                            <!-- 全屏按钮-start -->
                            <div class="fullscreen">
                                <div v-if="isFullscreen" class="i-exit-fullscreen" @click="exitFullscreen"></div>
                                <div v-else class="i-fullscreen" @click="fullscreen"></div>
                            </div>
                            <!-- 全屏按钮-end -->
                            <el-amap-polyline
                                strokeStyle="solid"
                                strokeColor="#3394FF"
                                :path="routePath"
                            ></el-amap-polyline>
                        </el-amap>
                    </div>
                    <el-pagination
                        class="map__pagination"
                        @size-change="pageSizeChange"
                        @current-change="pageChange"
                        :current-page="page.current"
                        :page-sizes="[20, 40, 60, 80, 100, 200, 500, 1000, 2000]"
                        :page-size="page.size"
                        layout="sizes, prev, pager, next, jumper, total"
                        :total="page.total">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog :title="`${dialogEditRouteTitle}路线`" v-model="dialogEditRouteVisible">
            <route-edit
                v-if="dialogEditRouteVisible"
                :lineType="lineType"
                :param="paramEditRoute"
                @cancel="cancelEditRoute"
                @save="saveEditRoute"
            ></route-edit>
        </el-dialog>
        <el-dialog title="客户拜访排序" v-model="dialogOrderVisible">
            <order
                v-if="dialogOrderVisible"
                :param="customerList"
                @cancel="cancelOrder"
                @save="saveOrder"
            ></order>
        </el-dialog>
    </div>
</template>
<style lang="less">
    .route-list {
        .button-container {
            display: flex;
            padding: 6px;
        }
    }
</style>
<style scoped>
    /*分页 -start*/
    .pager {
        margin: 0;
    }

    .pager > div > .btn-default {
        background-color: transparent;
        border: none;
    }

    .pager .btn + .btn {
        margin: 0
    }

    .pager input {
        text-align: center !important;
    }

    .pager * {
        font-size: 14px;
    }

    .pager .btn {
        color: #428bca;
    }

    /*分页 -end*/
</style>
<script>
    import XtWeb from 'xtion-web'
    import $ from 'jquery'
    import RouteEdit from './RouteEdit'
    import Transfer from './transfer'
    import Order from './Order'
    import screenfull from 'screenfull'
    import {
        zoomArr,
        frequencyOptions,
        parseFrequency,
        dayStruct,
        formatterAddressInfo,
        getCenterPoint,
        getMaxDistance,
        errorMessage
    } from '../utils'

    let amapManager = new XtWeb.VueAMap.AMapManager()
    let AMap, AMapUI

    import { initMap } from '../map-ctrl/index'

    let mapCtrl

    export default {
        props: ['lineType', 'routeTab', 'orgStruct', 'sysConfigSType', 'channelCustomerTypeVisible', 'parentVM',
            'searchOptionsData', 'auth', 'screenHeight'],
        data: function () {
            mapCtrl = {
                el: '',
                AMap: '',
                map: '',
                AMapUI: '',
                vm: '',
                callback() {
                    AMap = window.AMap
                    AMapUI = window.AMapUI
                }
            }
            return {
                isFullscreen: false,
                loading: false,
                loadingHandle: false,
                routeListHeight: 350,
                period: frequencyOptions,
                customerTab: 'first',
                filterRouteList: {
                    name: ''
                },
                routeListPage: {
                    pageindex: 0,
                    pagesize: 20,
                    itemcount: 0
                },
                filterCustomer: {
                    name: '',
                    isInline: '1',
                    customerType: '',
                    channelType: '',
                    storeLevel: '',
                    storeType: '',
                    channelCustomer: ''
                },
                routeList: [],
                customerList: [],
                isUpdatingCustomerList: false,
                curRoute: '',
                curUserId: '',
                dialogEditRouteVisible: false,
                dialogEditRouteTitle: '',
                paramEditRoute: {
                    lineid: '',
                    linename: '',
                    tn_weekday: ''
                },
                customerSelection: [],
                dialogOrderVisible: false,
                mapData: {
                    amapManager,
                    zoom: 15,
                    routeCustomers: [],
                    customersMarkers: [],
                    events: {
                        init: initMap.bind(mapCtrl)
                    },
                    infoWindow: ''
                },
                disabledAddRoute: true,
                channelTypeData: [],
                storeLevelData: [],
                storeTypeData: [],
                channelCustomerTypeData: [],
                form: {},
                page: {
                    size: 20,
                    total: 0,
                    current: 1
                }
            }
        },
        computed: {
            isEndCustomer() {
                return this.auth.storeExtraSearch && this.filterCustomer.customerType === '905324680615956480'
            },
            isChannelCustomer() {
                return this.auth.storeExtraSearch && this.filterCustomer.customerType === '905324761813487616'
            },
            routePath() {
                let path = []
                if (this.customerTab === 'second' && this.filterCustomer.isInline === '1') {
                    path = this.mapData.routeCustomers.map((customer) => {
                        return customer.coordinate
                    })
                }
                return path
            },
            customerCoordinate() {
                return this.mapData.routeCustomers.map((customer) => {
                    return customer.coordinate
                })
            },
            routeListPageTotal: function () {
                return Math.ceil(this.routeListPage.itemcount / this.routeListPage.pagesize)
            },
            customerPageList: function () {
                if (!this.customerList.length) return []
                if (!this.auth.storeTableIsPage) return this.customerList
                let pageSize = this.page.size
                let start = (this.page.current - 1) * pageSize
                return this.customerList.slice(start, start + pageSize)
            },
            tableHeight() {
                if (!this.screenHeight) return 300
                let otherHeight = 315
                if (this.auth.storeTableIsPage) otherHeight = 355
                return this.screenHeight - otherHeight
            },
            tabContentHeight() {
                if (!this.screenHeight) return 400
                return this.screenHeight - 250
            }
        },
        watch: {
            'filterCustomer.customerType'() {
                if (!this.isEndCustomer) {
                    let storeTypeVM = this.$refs.storeType
                    this.filterCustomer.channelType = ''
                    this.filterCustomer.storeLevel = ''
                    storeTypeVM.clearDataFn()
                }
                if (!this.isChannelCustomer) {
                    let channelCustomerTypeVM = this.$refs.channelCustomerType
                    channelCustomerTypeVM.clearDataFn()
                }
            },
            customerTab() {
                if (this.curRoute && this.curRoute.lineid) {
                    this.loadCustomerList()
                }
            },
            orgStruct(val) {
                this.setAddRouteDisabled(val)
                this.loadRouteList()
            },
            curRoute(val) {
                if (val) {
                    this.loadCustomerList()
                } else {
                    if (this.customerTab === 'first') {
                        // 客户列表
                        this.customerList = []
                    } else {
                        // 客户地图
                        this.mapData.routeCustomers = []
                        this.setMapZoom()
                        this.createMarkers()
                    }
                }
            },
            searchOptionsData() {
                let { channelTypeData, storeLevelData, storeTypeData, channelCustomerTypeData } = this.searchOptionsData
                const isArray = Array.isArray
                if (isArray(channelTypeData) && channelTypeData.length > 0) this.channelTypeData = JSON.parse(JSON.stringify(channelTypeData))
                if (isArray(storeLevelData) && storeLevelData.length > 0) this.storeLevelData = JSON.parse(JSON.stringify(storeLevelData))
                if (isArray(storeTypeData) && storeTypeData.length > 0) this.storeTypeData = JSON.parse(JSON.stringify(storeTypeData))
                if (isArray(channelCustomerTypeData) && channelCustomerTypeData.length > 0) this.channelCustomerTypeData = JSON.parse(JSON.stringify(channelCustomerTypeData))
            }
        },
        components: {
            RouteEdit,
            Order,
            'xt-button': XtWeb.Widget.UI.Button,
            'xt-picktree': XtWeb.Widget.UI.Picktree
        },
        created() {
            if (this.orgStruct && this.orgStruct.orgstructid) {
                this.setAddRouteDisabled(this.orgStruct)
                this.loadRouteList()
            }

            mapCtrl.vm = this
        },
        mounted() {
            let that = this
            // 地图添加移除客户
            $('.map-container').off('click.handleCustomer').on('click.handleCustomer', '.handle-customer-btn', function () {
                let id = $(this).data('id') + ''
                let handleCustomers = that.getCustomersById(id)
                if (that.filterCustomer.isInline === '1') { // 当前地图显示已添加客户，点击的是移除按钮
                    that.customerDelete(handleCustomers)
                } else { // 当前地图显示未添加客户，点击的是添加按钮
                    that.customerAdd(handleCustomers)
                }
            })
            // 地图取消弹窗
            $('.map-container').off('click.cancel').on('click.cancel', '.info-window-btn-cancel', function () {
                that.mapData.infoWindow.close()
            })
            // 地图全屏状态切换
            screenfull.onchange(() => {
                that.isFullscreen = screenfull.isFullscreen
            })
        },
        methods: {
            handleSearch() {
                this.routeListPage.pageindex = 0
                this.loadRouteList()
            },
            handleCurrentPageChange(val) {
                this.page.current = val
            },
            getTreeNode: function (obj, type, key) {
                if (typeof obj === 'object' && this.filterCustomer[key] !== obj.codepath) {
                    this.filterCustomer[key] = obj.codepath
                    this.customerSearchList()
                } else if (type === 'clear' && this.filterCustomer[key] !== '') {
                    this.filterCustomer[key] = ''
                    this.customerSearchList()
                }
            },
            // 判断是否能新增路线
            setAddRouteDisabled(orgStruct) {
                // 控制新增路线权限
                if (orgStruct.orgstructid) {
                    if ((this.sysConfigSType === '0' && orgStruct.isorg + '' === '1') ||
                        (this.sysConfigSType === '1' && orgStruct.children && orgStruct.children.length > 0) ||
                        (this.sysConfigSType === '2' && orgStruct.isorg + '' !== '1')) {
                        // 在租户系统参数stype === '0'时，只能在人员新增路线和计划
                        // stype === '1'时，只能在末级节点新增路线和计划
                        // stype === '2'时，只能在组织上新增路线和计划
                        this.disabledAddRoute = true
                    } else {
                        this.disabledAddRoute = false
                    }
                } else {
                    this.disabledAddRoute = true
                }
            },
            // 地图全屏
            fullscreen() {
                let map = this.$refs.customerListMap.$el
                screenfull.request(map)
            },
            // 地图退出全屏
            exitFullscreen() {
                screenfull.exit()
            },
            // 路线新增
            routeAdd() {
                this.initParamEditRoute()
                this.dialogEditRouteTitle = '新增'
                this.dialogEditRouteVisible = true
            },
            // 路线编辑
            routeEdit() {
                this.initParamEditRoute(this.curRoute)
                this.dialogEditRouteTitle = '编辑'
                this.dialogEditRouteVisible = true
            },
            // 路线删除
            routeDelete() {
                this.$confirm('确定删除?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103490922966028369', {
                        kx_visit_line: [{
                            lineid: this.curRoute.lineid
                        }]
                    }).then(res => {
                        this.$message('删除成功！')
                        let resData = res.data.resp_data.kx_visit_linecustomer
                        this.loadRouteList()
                    }).catch(error => {
                        errorMessage(this, error)
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    })
                })
            },
            // 初始化传给路线编辑弹窗的数据
            initParamEditRoute(data = {}) {
                for (let i in this.paramEditRoute) {
                    this.paramEditRoute[i] = data[i] ? data[i] : ''
                }
            },
            // 切换路线
            routeSwitch(data) {
                this.curRoute = data
                this.curUserId = data.userid
            },
            /**
             * @desc 加载路线列表
             * @param {Boolean} 加载数据成功后是否需要更新当前路线
             */
            loadRouteList(remainCurRoute, doSetMapZoom = true) {
                if (this.sysConfigSType === '0' && this.orgStruct.isorg + '' !== '0') {
                    // 如果为组织，清空路线列表和客户列表
                    this.routeList = []
                    this.customerList = []
                    this.curRoute = {}

                } else {
                    this.loading = true
                    this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103125598362013795', {
                        kx_visit_line: {
                            issearchemptyline: '1',
                            linestatus: '',
                            linename: this.filterRouteList.name,
                            userid: this.orgStruct.orgstructid,
                            tn_linetype: this.lineType,
                            tn_saleareaid: '',
                            orgstructid: this.orgStruct.orgstructid
                        },
                        __paging: {
                            __pagesize: this.routeListPage.pagesize + '',
                            __pageindex: this.routeListPage.pageindex + ''
                        }
                    }).then(res => {
                        let resData = res.data.resp_data.kx_visit_line
                        this.routeList = resData
                        this.routeListPage.itemcount = parseInt(res.data.resp_data.__paging.__itemcount)
                        if (remainCurRoute === true) {
                            this.loadCustomerList(doSetMapZoom)
                        } else {
                            this.curRoute = resData[0] ? resData[0] : ''
                            this.curUserId = resData[0] ? resData[0].userid : ''
                        }
                        this.loading = false
                    }).catch(error => {
                        this.loading = false
                        errorMessage(this, error)
                    })
                }
            },
            // 路线分页-第一页
            firstPage: function () {
                if (this.routeListPage.pageindex !== 0) {
                    this.routeListPage.pageindex = 0
                    this.loadRouteList()
                }
            },
            // 路线分页-上一页
            prevPage: function () {
                if (this.routeListPage.pageindex > 0) {
                    this.routeListPage.pageindex--
                    this.loadRouteList()
                }
            },
            // 路线分页-下一页
            nextPage: function () {
                if (this.routeListPage.pageindex < this.routeListPageTotal - 1) {
                    this.routeListPage.pageindex++
                    this.loadRouteList()
                }
            },
            // 路线分页-最后一页
            lastPage: function () {
                if (this.routeListPage.pageindex !== this.routeListPageTotal - 1) {
                    this.routeListPage.pageindex = this.routeListPageTotal - 1
                    this.loadRouteList()
                }
            },
            // 客户列表客户选择
            customerSelect(selection) {
                this.customerSelection = selection
            },
            // 客户（列表）筛选
            customerSearchList() {
                // if (this.customerTab === 'first') {
                this.loadCustomerList()
                // }
            },
            // 客户（地图）筛选
            customerSearchMap() {
                if (this.customerTab === 'second') {
                    this.loadCustomerList()
                }
            },
            // 加载客户列表数据
            loadCustomerList(doSetMapZoom = true) {
                if (this.sysConfigSType === '0' && this.orgStruct.isorg + '' !== '0') {
                    // 如果为组织不加载客户列表
                    return
                }
                if (!this.curRoute || !this.curRoute.lineid) {
                    this.$message.warning('请选择路线')
                    return
                }
                this.loading = true
                // 判断当前加载的是列表显示状态的客户还是地图显示状态的客户
                let filterParam = this.filterCustomer
                let { size, current } = this.page
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103130551193309279', {
                    kx_visit_linecustomer: {
                        saleareaid: '',
                        storelevelname: '',
                        channeltype: filterParam.channelType, // 渠道类型
                        storetype: filterParam.storeType, // 终端类型
                        storelevel: filterParam.storeLevel, // 终端级别
                        store_channeltype: filterParam.channelCustomer, // 渠道客户级别
                        lineid__tn_linetype: '',
                        isinline: filterParam.isInline,
                        lineid: this.curRoute.lineid,
                        userid: this.curUserId,
                        customername: filterParam.name,
                        customertype: filterParam.customerType,
                        orgstructid: this.orgStruct && this.orgStruct.orgstructid ? this.orgStruct.orgstructid : ''
                    },
                    __paging: {
                        __pageindex: parseInt(current) - 1 + '',
                        __pagesize: size + ''
                    }
                }).then(res => {
                    let __paging = res.data.resp_data.__paging

                    if (this.customerTab === 'first') {
                        // 客户列表
                        let customerList = res.data.resp_data.kx_visit_linecustomer

                        // 已添加客户按顺序排序显示
                        if (customerList.length && customerList.length > 0 && this.filterCustomer.isInline === '1') {
                            customerList.sort((a, b) => {
                                return parseInt(a.seq) - parseInt(b.seq)
                            })
                        }
                        this.isUpdatingCustomerList = true
                        this.customerList = this.parseCustomerList(customerList)

                        this.$nextTick(() => {
                            this.isUpdatingCustomerList = false
                        })
                    } else {
                        // 客户地图
                        let { kx_visit_linecustomer } = res.data.resp_data
                        this.mapData.routeCustomers = formatterAddressInfo(kx_visit_linecustomer)
                        if (this.mapData.infoWindow && this.mapData.infoWindow.close) {
                            this.mapData.infoWindow.close()
                        }
                        if (doSetMapZoom) this.setMapZoom()
                        this.createMarkers()
                    }

                    this.page.total = parseInt(__paging.__itemcount)
                    this.loading = false
                }).catch(error => {
                    this.loading = false
                    errorMessage(this, error)
                })
            },
            // 处理后台接口返回客户数据，将拜访频率处理为前端展示格式
            parseCustomerList(data = []) {
                if (data.length > 0) {
                    data.forEach(item => {
                        item.custom_frequency = parseFrequency(item.tn_frequency, item.tn_visitnum)
                    })
                }
                return data
            },
            // 设置地图中心点与缩放比例
            setMapZoom() {
                if (this.customerCoordinate.length !== 0) {
                    let coordinates = this.customerCoordinate
                    let centerPoint = getCenterPoint(coordinates)
                    let map = this.mapData.amapManager.getMap()

                    let zoom = 15
                    // 有两个点以上，才计算缩放级别
                    if (coordinates.length > 1) {
                        let maxDistance = getMaxDistance(coordinates)
                        let minPx = Math.min(this.$refs.customerListMap.$el.clientWidth, this.$refs.customerListMap.$el.clientHeight)

                        for (var i = 0; i < zoomArr.length; i++) {
                            let zoomConfig = zoomArr[i]
                            // 地图可显示最大距离
                            let mapMaxDistance = minPx / zoomConfig.px * zoomConfig.distance
                            if (mapMaxDistance > maxDistance) {
                                zoom = zoomConfig.zoom
                                break
                            }
                        }
                    }

                    map.setZoomAndCenter(zoom, centerPoint)
                }
            },
            // 创建客户在地图上的标识点
            createMarkers() {
                let map = this.mapData.amapManager.getMap()
                map.remove(this.mapData.customersMarkers)
                this.mapData.customersMarkers = []
                this.mapData.routeCustomers.forEach(customer => {
                    this.createMarker({
                        map,
                        customer,
                        handleMarkers: this.mapData.customersMarkers
                    })
                })
            },
            // 创建地图标识点
            createMarker(option) {
                let customer = option.customer
                AMapUI.loadUI(['overlay/SimpleMarker'], SimpleMarker => {
                    let markerOption = {
                        topWhenClick: true,
                        map: option.map,
                        position: customer.coordinate,
                        animation: 'AMAP_ANIMATION_DROP',
                        iconLabel: {
                            innerHTML: customer.seq || '',
                            style: {
                                top: '5px',
                                color: '#3394FF'
                            }
                        },
                        label: {
                            content: customer.customername,
                            offset: new AMap.Pixel(30, 5)
                        },
                        offset: new AMap.Pixel(-15.5, -49),
                        iconStyle: {
                            // 终端客户-红色图标，渠道客户-蓝色图标
                            src: customer.customertype === '终端客户' ? '/static/img/gaode-marker-plan-visit.png' : '/static/img/gaode-marker-react-visit.png'
                        }
                    }
                    let marker = new SimpleMarker(markerOption)
                    marker.extData = customer
                    // 客户门店marker注册点击事件
                    marker.on('click', e => {

                        AMapUI.loadUI(['overlay/SimpleInfoWindow'], SimpleInfoWindow => {
                            let infoWindowOptions = {
                                infoTitle: '',
                                infoBody: `<div class="info-window-btn-container"
                                ><span class="info-window-btn-primary handle-customer-btn" data-id="${customer.customerid}">${this.filterCustomer.isInline === '1' ? '移除' : '添加'}</span
                                ><span class="info-window-btn-cancel">取消</span></div>`,
                                offset: new AMap.Pixel(0, -50)
                            }
                            let infoWindow = new SimpleInfoWindow(infoWindowOptions)
                            let lnglat = new AMap.LngLat(customer.coordinate[0], customer.coordinate[1])
                            infoWindow.open(option.map, lnglat)
                            this.mapData.infoWindow = infoWindow
                        })
                    })
                    option.handleMarkers.push(marker)
                })
            },
            // 添加用户
            customerAdd(customers) {
                let handleCustomers = customers.length && customers.length > 0 ? customers : this.customerSelection
                let selectedCustomer = this.assembleSelectedCustomer(handleCustomers, true)
                this.loadingHandle = true
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103549125540057186', {
                    kx_visit_linecustomer: selectedCustomer,
                    kx_visit_line: {
                        lineid: this.curRoute.lineid
                    }
                }).then(res => {
                    this.loadingHandle = false
                    this.$message.success('添加成功！')
                    this.loadRouteList(true, false)
                }).catch(error => {
                    this.loadingHandle = false
                    errorMessage(this, error)
                })
            },
            // 移除用户
            customerDelete(customers) {
                let handleCustomers = customers.length && customers.length > 0 ? customers : this.customerSelection
                let selectedCustomer = this.assembleSelectedCustomer(handleCustomers)
                this.loadingHandle = true
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1110000533344751653', {
                    kx_visit_linecustomer: selectedCustomer,
                    kx_visit_line: {
                        lineid: this.curRoute.lineid
                    }
                }).then(res => {
                    this.loadingHandle = false
                    this.$message.success('移除成功！')
                    this.loadRouteList(true, false)
                }).catch(error => {
                    this.loadingHandle = false
                    errorMessage(this, error)
                })
            },
            // 显示用户排序弹窗
            customerSeq() {
                this.dialogOrderVisible = true
            },
            // 客户拜访频率修改
            customerChangeFrequency(data) {
                if (this.isUpdatingCustomerList) return
                let frequencyInfo = parseFrequency(data.custom_frequency)
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103549125540057186', {
                    kx_visit_linecustomer: [{
                        customerid: data.customerid,
                        tn_frequency: frequencyInfo.frequency,
                        tn_visitnum: frequencyInfo.visitnum,
                        tn_id: data.tn_id,
                        customertype: data.customertype,
                        seq: data.seq + ''
                    }],
                    kx_visit_line: {
                        lineid: this.curRoute.lineid
                    }
                }).then(res => {
                    this.$message.success('修改成功！')
                    this.loadCustomerList()
                }).catch(error => {
                    errorMessage(this, error)
                })
            },
            // 路线弹窗取消
            cancelEditRoute() {
                this.dialogEditRouteVisible = false
            },
            // 路线编辑保存
            saveEditRoute(data) {
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103490922966028386', {
                    kx_visit_line: {
                        lineid: data.lineid,
                        linename: data.linename,
                        tn_weekday: data.tn_weekday,
                        tn_linetype: this.lineType,
                        linestatus: '1',
                        userid: this.orgStruct.orgstructid,
                        orgstructid: this.orgStruct.orgstructid
                    }
                }).then(res => {
                    this.$message.success('保存成功！')
                    this.loadRouteList()
                    this.dialogEditRouteVisible = false
                }).catch(error => {
                    errorMessage(this, error)
                })
            },
            // 排序弹窗关闭
            cancelOrder() {
                this.dialogOrderVisible = false
            },
            // 排序保存
            saveOrder(data) {
                let selectedCustomer = this.assembleSelectedCustomer(data, true)
                this.$http.post('/api/teapi/dy-biz/1103117003973070933/1103549125540057186', {
                    kx_visit_linecustomer: selectedCustomer,
                    kx_visit_line: {
                        lineid: this.curRoute.lineid
                    }
                }).then(res => {
                    this.$message.success('修改成功！')
                    this.loadCustomerList()
                    this.dialogOrderVisible = false
                }).catch(error => {
                    errorMessage(this, error)
                })
            },
            /**
             * @desc 根据客户ID查找客户信息
             * @param {String} id 客户id
             * @return {Array} 对应的客户组成的数组
             */
            getCustomersById(id) {
                let ret = []
                let handleCustomerList = this.customerTab === 'first' ? this.customerList : this.mapData.routeCustomers
                for (let customer of handleCustomerList) {
                    if (customer.customerid === id) {
                        ret.push(customer)
                        break
                    }
                }
                return ret
            },
            /**
             * @desc 组装已选择的客户项的数据，用于调用后台接口入参
             * @param {Array} data 客户项列表
             * @param {Boolean} completeInfo 是否需要每个客户的完整信息
             */
            assembleSelectedCustomer(data, completeInfo) {
                let ret = []
                if (data.length > 0) {
                    data.forEach(item => {
                        let temp = {
                            customerid: item.customerid,
                            tn_id: item.tn_id
                        }
                        if (completeInfo) {
                            temp.customertype = item.customertype
                            temp.seq = item.seq ? item.seq + '' : ''
                            temp.tn_frequency = item.tn_frequency
                            temp.tn_visitnum = item.tn_visitnum
                            temp.isapp = item.isapp
                        }
                        ret.push(temp)
                    })
                }
                return ret
            },
            /*
            * 打开转移模态框
            * */
            showTransformModel() {
                XtWeb.Widget.UIService.SimpleModalService.push(this, {
                    title: this.$t('转移路线给他人'),
                    body: Transfer,
                    customClass: 'dialog-transfer-detail apass-dialog-form',
                    props: {
                        memberId: this.orgStruct.orgstructid,
                        routeList: this.routeList,
                        parentVM: this.parentVM
                    },
                    close: function () {

                    }
                })
            },
            /**
             * 地图每页显示条数改变
             */
            pageSizeChange(size) {
                this.page.size = size
                this.loadCustomerList()
            },
            /**
             * 地图页码改变
             */
            pageChange(current) {
                this.page.current = current
                this.loadCustomerList()
            }
        }
    }
</script>
