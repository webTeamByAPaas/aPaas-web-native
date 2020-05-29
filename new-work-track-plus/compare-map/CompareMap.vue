<template>
    <div class="compare-map-container">
        <nav class="compare-map-search-nav">
            <section class="compare-map-search-nav-left">
                <el-checkbox v-model="search.realCustomerChecked">实际拜访客户</el-checkbox>
                <el-checkbox v-if="isShowCustomer" v-model="search.customerChecked">负责客户</el-checkbox>
                <el-date-picker v-model="search.date" type="daterange"
                                @change="loadData"
                                size="small"
                                class-name="date-picker"
                                placeholder="选择日期"
                                :clearable="false"></el-date-picker>
            </section>
        </nav>
        <section class="compare-map-main-container">
            <section class="gaode-map-section">
                <article id="work-compare-plus-gaode-map" class="gaode-map"></article>
                <footer class="pointer-footer">
                    <article class="pointer-icon" v-for="(item, index) in navPointer" :key="index">
                        <i class="icon" :class='`icon-${item.name}`'></i>
                        <span>{{item.label}}</span>
                    </article>
                </footer>
                <div class="top-left-info" v-if="visitCoverage">
                    拜访覆盖率：{{visitCoverage}}
                </div>
            </section>
        </section>
    </div>
</template>

<script>
import navPointer from '../icon/compare-nav-pointer.js'
import { getCompareData } from '../api/index'
import { WorkCompareMap } from '../map/extends/work-compare-map'
import { DateCreate, currentDate, currentTime, diffDD } from '../api/dealdate'

export default {
    name: 'CompareMap',
    props: {
        'userItem': Object || Array,
        'parentVM': Object,
        'isShowCustomer': Boolean
    },
    data () {
        return {
            search: {
                realCustomerChecked: true,
                customerChecked: true,
                date: [DateCreate(), DateCreate()]
            },
            isLoadData: false,
            navPointer,
            realPoints: [],
            customerPoints: [],
            MapCtrl: null,
            isFirstEnter: true,
            visitCoverage: ''
        }
    },
    watch: {
        'search.date' (value, old) {
            let dates = this.search.date
            if (diffDD(dates[0].getTime(), dates[1].getTime()) > 31) {
                this.search.date = old
                this.$message({
                    message: this.$t('最大选择一个月'),
                    type: 'warning',
                    showClose: true
                })
            }
        },
        userItem () {
            // 清除负责客户信息
            this.clearCustomer()
            this.isLoadData && this.loadData()
        },
        'search.realCustomerChecked' () {
            if (!this.MapCtrl) return
            let MapCtrl = this.MapCtrl
            console.log(MapCtrl.realMarkers)
            if (MapCtrl.realDataIsShow) {
                MapCtrl.hideRealData()
            } else {
                MapCtrl.showRealData()
            }
            MapCtrl.map.setFitView()
        },
        'search.customerChecked' (isShow) {
            if (!this.MapCtrl) return
            let MapCtrl = this.MapCtrl
            if (!isShow) {
                MapCtrl.hideCustomerData()
            } else {
                MapCtrl.showCustomerData(this.MapCtrl.map)
            }
            MapCtrl.map.setFitView()
        }
    },
    created () {
        this.isInitCustomerDataMap = false
    },
    mounted () {
        (async () => {
            this.MapCtrl = await new WorkCompareMap('work-compare-plus-gaode-map', {
                plugins: ['AMap.Walking']
            })
            this.MapCtrl.map.setFitView()
        })()
    },
    methods: {
        async getCompareData () {
            let { realData, customerData, visitCoverage } = await getCompareData.call(this.parentVM, {
                actualvisittime: `{"start":${new Date(this.search.date[0]).getTime()},"end":${new Date(this.search.date[1]).getTime()}}`,
                userid: this.userItem.orgstructid
            })
            this.customerPoints = customerData
            this.realPoints = realData
            this.visitCoverage = visitCoverage
        },
        async loadData () {
            if (!this.userItem || !this.userItem.orgstructid || this.search.date.length < 2) {
                return
            }
            await Promise.all([this.getCompareData()])
            if (this.MapCtrl) this.initMap()
            this.isLoadData = false
        },
        initMap () {
            this.isInitCustomerDataMap = true
            this.MapCtrl.setCustomerData(this.customerPoints, !this.search.customerChecked)
            this.MapCtrl.setRealData(this.realPoints, !this.search.realCustomerChecked)
            this.MapCtrl.map.setFitView()
        },
        // 销毁‘负责客户’相关数据
        clearCustomer () {
            // 负责客户数据重新请求
            this.isInitCustomerDataMap = false
            // 负责客户勾选状态重置
            this.search.customerChecked = true
            // 删除负责客户地图标记物
            this.MapCtrl && this.MapCtrl.clearMapData(this.MapCtrl.map)
        },
        firstEnter () {
            console.log('firstEnter')
            this.isLoadData = true
            if (!this.isInitCustomerDataMap) {
                this.loadData()
            }
            if (this.isFirstEnter) {
                setTimeout(() => {
                    if (this.MapCtrl) this.MapCtrl.map.setFitView()
                })
                this.isFirstEnter = false
            }
        }
    }
}
</script>
