<template>
    <div class="track-map-container">
        <nav class="track-map-search-nav">
            <section class="track-map-search-nav-left">
                <el-checkbox v-model="search.realRouteChecked">实际路线</el-checkbox>
                <el-checkbox v-model="search.planRouteChecked">计划路线</el-checkbox>
                <el-checkbox v-model="search.customerChecked">负责客户</el-checkbox>
                <div class="date-picker-block">
                    <div class="left-btn" @click="() => handleChangeDate(-1)"></div>
                    <el-date-picker v-model="search.date" type="date"
                                    @change="loadData"
                                    size="small"
                                    class-name="date-picker"
                                    placeholder="选择日期"
                                    :clearable="false"></el-date-picker>
                    <div class="right-btn" @click="() => handleChangeDate(1)"></div>
                </div>
                <section class="time-picker-section">
                    <span>时间段</span>
                    <el-time-picker ref="timePicker" is-range v-model="search.timeRange"
                                    popper-class="work-track-plus-time-picker"
                                    @change="handleChangeTimeRange"
                                    size="small"
                                    class-name="time-picker"
                                    format='HH:mm'
                                    :picker-options="{format: 'HH:mm', 'value-format': 'HH:mm'}"
                                    range-separator="-"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    placeholder="选择时间范围"
                                    :clearable="false">
                    </el-time-picker>
                </section>
            </section>
            <div class="spacer"></div>
            <section class="switch-section">
                <span>轨迹明细</span>
                <el-switch v-model="showTrackDetail"
                           on-text="" realPoints
                           off-text=""
                           on-color="#4cd864"></el-switch>
            </section>
        </nav>
        <section class="track-map-main-container">
            <section class="gaode-map-section">
                <article id="work-track-plus-gaode-map" class="gaode-map"></article>
                <footer class="pointer-footer">
                    <article class="pointer-icon" v-for="(item, index) in navPointer" :key="index" v-if="item.exist">
                        <i class="icon" :class='`icon-${item.name}`'></i>
                        <span>{{item.label}}</span>
                    </article>
                </footer>
            </section>
            <nav v-show="showTrackDetail" class="track-detail-nav"
                 :class="{'track-analyze-width': activeTrackDetail === 'track-analyze'}">
                <section v-show="activeTrackDetail === 'menu'">
                    <header class="track-detail-header" v-show="mileage">
                        <span>里程 共{{mileage}}</span>
                    </header>
                    <ul class="track-detail-list">
                        <li @click="activeTrackDetail = 'track-analyze'"><span>轨迹分析</span><i
                            class="icon icon-right-arrow"></i>
                        </li>
                        <li @click="activeTrackDetail = 'track-data'"><span>数据上报</span><i
                            class="icon icon-right-arrow"></i>
                        </li>
                    </ul>
                </section>
                <section v-show="activeTrackDetail === 'track-analyze'">
                    <track-analyze :analyzePoints="analyzePoints" :timestampRange="timestampRange" :isMonitor="isMonitor"
                                   @back="activeTrackDetail = 'menu'" :MapCtrl="MapCtrl"></track-analyze>
                </section>
                <section v-show="activeTrackDetail === 'track-data'">
                    <track-data :realPoints="realPoints" :timestampRange="timestampRange" @showDetail="showDetail"
                                @back="activeTrackDetail = 'menu'" :MapCtrl="MapCtrl"></track-data>
                </section>
            </nav>
        </section>
    </div>
</template>

<script>
    import navPointer from '../icon/nav-pointer.js'
    import { getWorkTrackData, getWorkTrackAnalyze, getCompareData, workTrackDetail, configMapIcon } from '../api/index'
    import { getSetterObj } from '../api/utils'
    import TrackData from './TrackData'
    import TrackAnalyze from './TrackAnalyze'
    import { WorkTrackMap } from '../map/extends/work-track-map'
    import { DateCreate, currentDate, currentTime } from '../api/dealdate'
    import $ from 'jquery'

    export default {
        name: 'TrackMap',
        props: ['userItem', 'parentVM'],
        components: {
            TrackData,
            TrackAnalyze
        },
        data() {
            return {
                showTrackDetail: true, // 查看轨迹明细
                activeTrackDetail: 'menu', // 轨迹明细显示页
                search: {
                    realRouteChecked: true,
                    planRouteChecked: true,
                    customerChecked: false,
                    date: DateCreate(),
                    timeRange: [DateCreate('2019-01-01 00:00:00'), DateCreate('2019-01-01 23:59:59')]
                },
                selectTimeRange: null,
                navPointer,
                realPoints: [],
                planPoints: [],
                routePoints: [],
                analyzePoints: [],
                customerPoints: [],
                MapCtrl: null,
                elTimePickerDialog: null,
                getElRunning: false,
                addListenerRunning: false,
                mileage: '',
                isMonitor: true
            }
        },
        watch: {
            userItem() {
                this.loadData()
            },
            'search.realRouteChecked'() {
                if (!this.MapCtrl) return
                let MapCtrl = this.MapCtrl
                if (MapCtrl.realDataIsShow) {
                    MapCtrl.hideRealData()
                } else {
                    MapCtrl.showRealData()
                }
                MapCtrl.map.setFitView()
            },
            'search.planRouteChecked'() {
                if (!this.MapCtrl) return
                let MapCtrl = this.MapCtrl
                if (MapCtrl.planDataIsShow) {
                    MapCtrl.hidePlanData()
                } else {
                    MapCtrl.showPlanData()
                }
                MapCtrl.map.setFitView()
            },
            'search.customerChecked'() {
                if (!this.MapCtrl) return
                let MapCtrl = this.MapCtrl
                if (MapCtrl.customerDataIsShow) {
                    MapCtrl.hideCustomerData()
                } else {
                    MapCtrl.showCustomerData()
                }
                MapCtrl.map.setFitView()
            },
            selectTimeRange() {
                if (!this.MapCtrl) return
                if (this.routePointsRange.length === 0 && this.planPoints.length === 0) this.$message.warning('所选日期没有该人员的路线信息')
                this.MapCtrl.setRealData(this.routePointsRange, this.analyzePointsRange, !this.search.realRouteChecked)
                this.MapCtrl.map.setFitView()
            }
        },
        mounted() {
            this.configIcon()
            ;(async () => {
                this.MapCtrl = await new WorkTrackMap('work-track-plus-gaode-map', {
                    plugins: ['AMap.Walking']
                })
            })()
        },
        computed: {
            timestampRange() {
                let timeRange = this.selectTimeRange
                if (!this.search.date) return [DateCreate('2010-01-01').getTime(), DateCreate('2050-01-01').getTime()]
                let date = currentDate(this.search.date.getTime())
                if (!timeRange || !Array.isArray(timeRange) || timeRange.length < 2) {
                    return [DateCreate(`${date} 00:00:00`).getTime(), DateCreate(`${date} 23:59:59`).getTime()]
                }
                let startTime = currentTime(timeRange[0].getTime())
                let endTime = currentTime(timeRange[1].getTime())
                return [DateCreate(`${date} ${startTime}`).getTime(), DateCreate(`${date} ${endTime}`).getTime()]
            },
            routePointsRange() {
                if (this.routePoints.length === 0) return []
                return this.routePoints.filter(item => item.timestamp >= this.timestampRange[0] && item.timestamp <= this.timestampRange[1])
            },
            analyzePointsRange() {
                if (this.analyzePoints.length === 0) return []
                return this.analyzePoints.filter(item => {
                    if (!item.startTimestamp || !item.endTimestamp) return false
                    return +item.startTimestamp >= this.timestampRange[0] && +item.endTimestamp <= this.timestampRange[1]
                })
            }
        },
        methods: {
            async getWorkTrackData() {
                let { planPoints, realPoints, routePoints, mileage } = await getWorkTrackData.call(this.parentVM, {
                    date: `${new Date(this.search.date).getTime()}`,
                    memberid: this.userItem.orgstructid
                })
                this.planPoints = planPoints
                this.realPoints = realPoints
                this.routePoints = routePoints
                this.mileage = mileage
                console.log('getWorkTrackData', routePoints)
                // console.log(JSON.stringify(routePoints))
            },
            async getWorkTrackAnalyze() {
                let { data, isMonitor } = await getWorkTrackAnalyze.call(this.parentVM, {
                    collecttime: `${new Date(this.search.date).getTime()}`,
                    memberid: this.userItem.orgstructid
                })
                this.analyzePoints = data
                this.isMonitor = isMonitor
                console.log('getWorkTrackAnalyze', this.analyzePoints)
                // console.log(JSON.stringify(this.analyzePoints))
            },
            async getWorkTrackCustomer() {
                let { customerData } = await getCompareData.call(this.parentVM, {
                    actualvisittime: `{"start":${new Date(this.search.date).getTime()},"end":${new Date(this.search.date).getTime() + 24 * 60 * 60 * 1000}}`,
                    userid: this.userItem.orgstructid
                })
                this.customerPoints = customerData
                console.log('getWorkTrackCustomer', this.customerPoints)
                // console.log(JSON.stringify(routePoints))
            },
            async loadData() {
                if (!this.userItem || !this.userItem.orgstructid || !this.search.date) {
                    return
                }
                await Promise.all([this.getWorkTrackData(), this.getWorkTrackAnalyze(), this.getWorkTrackCustomer()])
                if (this.MapCtrl) this.initMap()
            },
            initMap() {
                if (this.routePointsRange.length === 0 && this.planPoints.length === 0) this.$message.warning('所选日期没有该人员的路线信息')
                this.MapCtrl.closeInfoWindow()
                this.MapCtrl.setPlanData(this.planPoints, !this.search.planRouteChecked)
                this.MapCtrl.setCustomerData(this.customerPoints, !this.search.customerChecked)
                this.MapCtrl.setRealData(this.routePointsRange, this.analyzePointsRange, !this.search.realRouteChecked)
                this.MapCtrl.map.setFitView()
            },
            showDetail(item) {
                if (!this.userItem || !this.userItem.orgstructid || !this.search.date) {
                    return
                }
                workTrackDetail.call(this.parentVM, {
                    userid: this.userItem.orgstructid,
                    customerid: item.customerid,
                    customertype: item.customertype,
                    visitdate: item.timestamp + '',
                    visittype: item.visittype + ''
                })
            },
            async configIcon() {
                await configMapIcon.call(this.parentVM)
                let config = getSetterObj('configMapIcon')
                for (let key in config) {
                    let item = this.navPointer.find(item => item.name === key)
                    if (item) item.exist = config[key]
                }
            },
            handleChangeDate(value) {
                let newDate = new Date(this.search.date)
                newDate.setDate(newDate.getDate() + value)
                this.search.date = newDate
            },
            async handleChangeTimeRange() {
                if (!this.getElRunning) {
                    await this.getTimePickerDialogEl()
                }
                if (!this.addListenerRunning) {
                    this.addTimePickerDialogListener()
                }
            },
            async getTimePickerDialogEl() {
                this.getElRunning = true
                return new Promise((resolve, reject) => {
                    let f = () => {
                        setTimeout(() => {
                            let el = document.querySelector('.work-track-plus-time-picker')
                            if (el) {
                                this.elTimePickerDialog = el
                                resolve()
                            } else {
                                f()
                            }
                        })
                    }
                    f()
                })
            },
            addTimePickerDialogListener() {
                if (this.elTimePickerDialog) {
                    this.addListenerRunning = true
                    let $btn = $('.el-time-panel__btn', this.elTimePickerDialog)
                    if ($btn.length < 1) return
                    let that = this
                    $btn.on('click', function () {
                        that.handleSelectTimeRange()
                    })
                }
            },
            handleSelectTimeRange() {
                this.selectTimeRange = this.search.timeRange
            }
        }
    }
</script>

<style scoped>

</style>
