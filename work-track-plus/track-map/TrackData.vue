<template>
    <div class="track-data-container">
        <header>
            <i class="icon icon-home" @click="$emit('back')"></i>
            <span>轨迹明细 > 数据上报</span>
        </header>
        <div class="empty-container" v-if="listPoints.length === 0">暂无数据</div>
        <ul v-else>
            <li class="track-data-item" v-for="(item, index) in listPoints" :key="index">
                <section class="track-data-item-left">
                    <i class="icon" :class="`icon-${typeOptions[item.type].circle}`"></i>
                    <article>{{typeOptions[item.type].label}}</article>
                    <div class="line"></div>
                </section>
                <section class="track-data-item-right pointer" @click="handleClickRight(item)">
                    <h3>{{item.timeHHMM}}</h3>
                    <div v-if="item.type === 1" @click.prevent="showDetailDialog(item)" class="track-detail-btn">详情</div>
                    <article v-if="item.type === 1">
                        <p>{{item.axis_label}}</p>
                        <p v-for="(_item, _index) in item.visitcontent" :key="_index">
                            {{_item.timeHHMM}}&nbsp;&nbsp;
                            {{_item.content}}
                        </p>
                    </article>
                    <article v-if="item.type === 2">{{item.axis_label}}: {{item.address}}</article>
                </section>
            </li>
        </ul>
    </div>
</template>

<script>
    import { getTypeOptions } from '../api/options'

    export default {
        name: 'TrackData',
        props: ['realPoints', 'timestampRange', 'MapCtrl'],
        data() {
            return {
                typeOptions: getTypeOptions()
            }
        },
        computed: {
            listPoints() {
                return this.realPoints.filter(item => {
                    return +item.timestamp > this.timestampRange[0] && +item.timestamp < this.timestampRange[1]
                })
            }
        },
        methods: {
            handleClickRight(item) {
                this.showInfoItem(item)
            },
            showInfoItem(item) {
                if (!this.MapCtrl) return
                this.MapCtrl.showMarkerInfo(item.uuid)
            },
            showDetailDialog(item) {
                this.$emit('showDetail', item)
            }
        }
    }
</script>

<style scoped>

</style>
