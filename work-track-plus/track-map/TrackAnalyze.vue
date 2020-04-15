<template>
    <div class="track-analyze-container">
        <header>
            <i class="icon icon-home" @click="$emit('back')"></i>
            <article>轨迹明细 > 轨迹分析</article>
            <el-select v-model="selectType" size="mini" placeholder="状态" clearable>
                <el-option label="全部" value="">全部</el-option>
                <el-option label="移动" value="3">移动</el-option>
                <el-option label="不在线" value="4">不在线</el-option>
                <el-option label="定位失败" value="5">定位失败</el-option>
                <el-option label="停留" value="6">停留</el-option>
            </el-select>
        </header>
        <div class="empty-container" v-if="listPoint.length === 0">
            <template v-if="isMonitor">暂无数据</template>
            <template v-else>没有对该员工开启被动定位，请在[定位人员设置]模块进行设置。</template>
        </div>
        <ul v-else>
            <li class="track-analyze-item">
                <section class="track-analyze-item-left">
                    <h3>{{firstPoint.startTimeHHMM}}</h3>
                    <article>电量:{{firstPoint.battery}}</article>
                </section>
                <section class="track-analyze-item-mid">
                    <i class="icon icon-start-circle"></i>
                    <div class="line"></div>
                </section>
                <section class="spacer"></section>
            </li>
            <template v-for="(item, index) in listPoint">
                <li class="track-analyze-item" :key="item.uuid + 1"
                    v-if="index > 0 && listPoint[index - 1].endTimeHHMM !== item.startTimeHHMM">
                    <section class="track-analyze-item-left">
                        <h3>{{item.startTimeHHMM}}</h3>
                        <article>电量:{{item.battery}}</article>
                    </section>
                    <section class="track-analyze-item-mid">
                        <div class="line"></div>
                        <i class="icon icon-gray-circle"></i>
                        <div class="line"></div>
                    </section>
                    <section class="spacer"></section>
                </li>
                <li class="track-analyze-item" :key="item.uuid + 2">
                    <section class="track-analyze-item-left"></section>
                    <section class="track-analyze-item-mid">
                        <div class="line"></div>
                        <i class="icon" :class="`icon-${typeOptions[item.type].circle}`"></i>
                        <div class="line"></div>
                    </section>
                    <section class="track-analyze-item-right pointer"
                             @click="handleClickRight(item)" @mouseenter="handleShowHeightLightItem(item)" @mouseleave="handleHideHeightLightItem(item)">
                        <h4>{{item.status}}:{{timeDiffFormat(item.timediff)}}</h4>
                        <article>时间:{{item.startTimeHHMM}}-{{item.endTimeHHMM}}</article>
                        <article v-if="item.type === 3">
                            <p>起:{{item.address[0].address}}</p>
                            <p>终:{{item.address[item.address.length - 1].address}}</p>
                        </article>
                        <article v-if="item.type === 6">位置:{{item.address}}</article>
                        <article v-if="!!item.reason && (item.type === 4 || item.type === 5 || item.type === 6)">原因:{{item.reason}}</article>
                    </section>
                </li>
                <li class="track-analyze-item" v-if="index !== lastPointIndex" :key="item.uuid + 3">
                    <section class="track-analyze-item-left">
                        <h3>{{item.endTimeHHMM}}</h3>
                        <article>电量:{{item.battery}}</article>
                    </section>
                    <section class="track-analyze-item-mid">
                        <div class="line"></div>
                        <i class="icon icon-gray-circle"></i>
                        <div class="line"></div>
                    </section>
                    <section class="spacer"></section>
                </li>
            </template>
            <li class="track-analyze-item track-analyze-item-last">
                <section class="track-analyze-item-left">
                    <h3>{{lastPoint.endTimeHHMM}}</h3>
                    <article>电量:{{lastPoint.battery}}</article>
                </section>
                <section class="track-analyze-item-mid">
                    <div class="line"></div>
                    <i class="icon icon-end-circle"></i>
                </section>
                <section class="spacer"></section>
            </li>
        </ul>
    </div>
</template>

<script>
    import { getTypeOptions } from '../api/options'

    export default {
        name: 'TrackAnalyze',
        props: ['analyzePoints', 'timestampRange', 'MapCtrl', 'isMonitor'],
        data() {
            return {
                typeOptions: getTypeOptions(),
                selectType: ''
            }
        },
        computed: {
            timePoint() {
                if (!this.analyzePoints || !Array.isArray(this.analyzePoints)) return []
                return this.analyzePoints.filter(item => {
                    if (!item.startTimestamp || !item.endTimestamp) return false
                    return +item.startTimestamp >= this.timestampRange[0] && +item.endTimestamp <= this.timestampRange[1]
                })
            },
            listPoint() {
                if (!this.selectType) return this.timePoint
                return this.timePoint.filter(item => item.type === +this.selectType)
            },
            firstPoint() {
                if (this.listPoint.length === 0) return null
                return this.listPoint[0]
            },
            lastPoint() {
                if (this.listPoint.length === 0) return null
                return this.listPoint[this.listPoint.length - 1]
            },
            lastPointIndex() {
                return this.listPoint.length - 1
            }
        },
        methods: {
            timeDiffFormat(timediff) {
                if (timediff < 60) return `${timediff}分钟`
                return `${Math.floor(timediff / 60)}小时${timediff % 60}分钟`
            },
            handleClickRight(item) {
                if (item.type === 6) this.showInfoItem(item)
            },
            showInfoItem(item) {
                if (!this.MapCtrl) return
                this.MapCtrl.showMarkerInfo(item.uuid)
            },
            handleShowHeightLightItem(item) {
                if (!this.MapCtrl) return
                this.MapCtrl.showHeightLightData(item.uuid)
            },
            handleHideHeightLightItem(item) {
                if (!this.MapCtrl) return
                this.MapCtrl.hideHeightLightData(item.uuid)
            }
        }
    }
</script>

<style scoped>

</style>
