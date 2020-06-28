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
                    <h3></h3>
                    <article></article>
                </section>
                <section class="track-analyze-item-mid">
                    <!-- <i class="icon icon-start-circle" @click="handleClickRight(firstPoint, 'start')"></i> -->
                    <i class="icon icon-start-map" @click="handleClickRight(firstPoint, 'start')"></i>
                    <div class="line"></div>
                </section>
                <section class="track-analyze-item-right pointer"
                    @click="handleClickRight(firstPoint, 'start')">
                    <h4>起点</h4>
                    <!-- 起点如果是不在线或异常定位数据，则不显示起点 -->
                    <article v-if="firstPoint.type !== 4 && firstPoint.type !== 5 && analyzePointsRange.length > 0 && analyzePointsRange[0].address">
                        位置:{{analyzePointsRange[0].address}}
                    </article>
                </section>
            </li>
            <template v-for="(item, index) in listPoint">
                <li class="track-analyze-item" :key="item.uuid + 1">
                    <section class="track-analyze-item-left" v-if="index === 0">
                        <h3>{{firstPoint.startTimeHHMM}}</h3>
                        <article>电量:{{firstPoint.battery}}</article>
                    </section>
                    <section class="track-analyze-item-left" v-if="index !== 0">
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
                        <i class="icon" @click="handleClickRight(item)" :class="`icon-${typeOptions[item.type].circle}`"></i>
                        <div class="line"></div>
                    </section>
                    <section class="track-analyze-item-right pointer"
                             @click="handleClickRight(item)" @mouseenter="handleShowHeightLightItem(item)" @mouseleave="handleHideHeightLightItem(item)">
                        <h4>{{item.axis_label}}<span v-if="item.type !== 7">:{{timeDiffFormat(item.timediff)}}</span></h4>
                        <article v-if="item.type !== 7">时间:{{item.startTimeHHMM}}-{{item.endTimeHHMM}}</article>
                        <!--type:7，成功定位，只有一个时间点-->
                        <article v-if="item.type === 7">时间:{{item.startTimeHHMM}}</article>
                        <article v-if="item.type === 3">
                            <p>起:{{item.address[0].address}}</p>
                            <p>终:{{item.address[item.address.length - 1].address}}</p>
                        </article>
                        <article v-if="item.type === 6 || item.type === 7">位置:{{item.address}}</article>
                        <article v-if="!!item.reason && (item.type === 4 || item.type === 5 || item.type === 6)">原因:{{item.reason}}</article>
                        <article v-if="item.type === 5" style="color: red;">定位失败，请联系员工确认！</article>
                        <article v-if="item.type === 4" style="color: red;">请联系员工确认！</article>
                    </section>
                </li>
                <li class="track-analyze-item" v-if="index === lastPointIndex" :key="item.uuid + 3">
                    <!-- <section class="track-analyze-item-left">
                        <h3>{{item.endTimeHHMM}}</h3>
                        <article>电量:{{item.battery}}</article>
                    </section> -->
                    <section class="track-analyze-item-left">
                        <h3>{{lastPoint.endTimeHHMM}}</h3>
                        <article>电量:{{lastPoint.battery}}</article>
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
                    <h3></h3>
                    <article></article>
                </section>
                <section class="track-analyze-item-mid">
                    <div class="line"></div>
                    <!-- <i class="icon icon-end-circle" @click="handleClickRight(lastPoint, 'end')"></i> -->
                    <i class="icon icon-end-map" @click="handleClickRight(lastPoint, 'end')"></i>
                </section>
                <section class="track-analyze-item-right pointer"
                    @click="handleClickRight(lastPoint, 'end')">
                    <h4>终点</h4>
                    <article v-if="analyzePointsRange.length > 0 && analyzePointsRange[analyzePointsRange.length - 1].address">
                        位置:{{analyzePointsRange[analyzePointsRange.length - 1].address}}
                    </article>
                </section>
            </li>
        </ul>
    </div>
</template>

<script>
import { getTypeOptions } from '../api/options'
/**
 * @ 起点/终点坐标接口没有返回，只能自己取第一个/最后一个坐标点进行伪造
 */
export default {
    name: 'TrackAnalyze',
    props: ['analyzePoints', 'analyzePointsRange', 'timestampRange', 'MapCtrl', 'isMonitor'],
    data () {
        return {
            typeOptions: getTypeOptions(),
            selectType: ''
        }
    },
    computed: {
        timePoint () {
            // 定位数据的时间戳需要在时间访问之内
            if (!this.analyzePoints || !Array.isArray(this.analyzePoints)) return []
            return this.analyzePoints.filter(item => {
                if (!item.startTimestamp || !item.endTimestamp) return false
                return +item.startTimestamp >= this.timestampRange[0] && +item.endTimestamp <= this.timestampRange[1]
            })
        },
        listPoint () {
            if (!this.selectType) return this.timePoint
            return this.timePoint.filter(item => item.type === +this.selectType)
        },
        /**
         * 起点读取数据，根据起点后第一个定位分析点判断：
         *   1、不在线：读取不到定位数据，起点无数据，空
         *   2、定位异常：读取不到定位数据，起点无数据，空
         *   3、停留：读取停留点定位数据
         *   4、移动：读取移动的起点定位数据
         */
        firstPoint () {
            if (this.listPoint.length === 0) return null
            return this.listPoint[0]
        },
        lastPoint () {
            if (this.listPoint.length === 0) return null
            return this.listPoint[this.listPoint.length - 1]
        },
        lastPointIndex () {
            return this.listPoint.length - 1
        }
    },
    methods: {
        timeDiffFormat (timediff) {
            if (timediff === 0) return `1分钟之内`
            if (timediff < 60) return `${timediff}分钟`
            return `${Math.floor(timediff / 60)}小时${timediff % 60}分钟`
        },
        handleClickRight (item, sign) {
            let show = false
            if (item.type === 6 ||
             item.uuid === this.firstPoint.uuid ||
             item.uuid === this.lastPoint.uuid) {
                show = true
            }
            if (show) this.showInfoItem(item, sign)
        },
        showInfoItem (item, sign) {
            if (!this.MapCtrl) return
            let uuid = item.uuid
            // TODO: analyzePointsRange是地图标记物/画线的坐标点
            if (sign === 'start' && this.analyzePointsRange.length > 0) {
                uuid = this.analyzePointsRange[0].uuid + '-start'
            }
            if (sign === 'end' && this.analyzePointsRange.length > 0) {
                uuid = this.analyzePointsRange[this.analyzePointsRange.length - 1].uuid + '-end'
            }
            this.MapCtrl.showMarkerInfo(uuid)
        },
        handleShowHeightLightItem (item) {
            if (!this.MapCtrl) return
            this.MapCtrl.showHeightLightData(item.uuid)
        },
        handleHideHeightLightItem (item) {
            if (!this.MapCtrl) return
            this.MapCtrl.hideHeightLightData(item.uuid)
        }
    }
}
</script>

<style scoped>

</style>
