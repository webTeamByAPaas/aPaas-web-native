<template>
    <div class="compare-map-container">
        <nav class="compare-map-search-nav">
            <section class="compare-map-search-nav-left">
                <el-checkbox v-model="search.realCustomerChecked">实际拜访客户</el-checkbox>
                <el-checkbox v-model="search.customerChecked">负责客户</el-checkbox>
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
        props: ['userItem', 'parentVM'],
        data() {
            return {
                search: {
                    realCustomerChecked: true,
                    customerChecked: true,
                    date: [DateCreate(), DateCreate()]
                },
                navPointer,
                realPoints: [],
                customerPoints: [],
                MapCtrl: null,
                isFirstEnter: true,
                visitCoverage: ''
            }
        },
        watch: {
            'search.date'(value, old) {
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
            userItem() {
                this.loadData()
            },
            'search.realCustomerChecked'() {
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
            'search.customerChecked'() {
                if (!this.MapCtrl) return
                let MapCtrl = this.MapCtrl
                if (MapCtrl.customerDataIsShow) {
                    MapCtrl.hideCustomerData()
                } else {
                    MapCtrl.showCustomerData()
                }
                MapCtrl.map.setFitView()
            }
        },
        mounted() {
            (async () => {
                this.MapCtrl = await new WorkCompareMap('work-compare-plus-gaode-map', {
                    plugins: ['AMap.Walking']
                })
                this.MapCtrl.map.setFitView()
            })()
        },
        methods: {
            async getCompareData() {
                let { realData, customerData, visitCoverage } = await getCompareData.call(this.parentVM, {
                    actualvisittime: `{"start":${new Date(this.search.date[0]).getTime()},"end":${new Date(this.search.date[1]).getTime()}}`,
                    userid: this.userItem.orgstructid
                })
                this.customerPoints = customerData
                this.realPoints = realData
                this.visitCoverage = visitCoverage
            },
            async loadData() {
                if (!this.userItem || !this.userItem.orgstructid || this.search.date.length < 2) {
                    return
                }
                await Promise.all([this.getCompareData()])
                if (this.MapCtrl) this.initMap()
            },
            initMap() {
                this.MapCtrl.setCustomerData(this.customerPoints, !this.search.customerChecked)
                this.MapCtrl.setRealData(this.realPoints, !this.search.realCustomerChecked)
                this.MapCtrl.map.setFitView()
            },
            firstEnter() {
                console.log('firstEnter')
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
