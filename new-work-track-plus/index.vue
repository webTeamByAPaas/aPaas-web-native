<template>
    <div class="page-work-track-plus">
        <div class="member-list-container" :class="{'hide-width': !isShow}">
            <search-user-menu @click-item="handleClickUserItem" :screenHeight="screenHeight" v-show="isShow"></search-user-menu>
            <div class="btn-toggle-show" @click="isShow = !isShow">
                <div class="bg" :class="{'triangle-rotate': !isShow}">
                    <img :src="isShow ? openBtnSrc[0] : openBtnSrc[1]">
                </div>
            </div>
        </div>
        <section v-if="isShowCompareMap" class="work-track-main-container" :class="{'hide-width': !isShow}" :style="{height: `${mainHeight}px`}">
            <el-tabs v-model="activeTab" @tab-click="handleClickTab">
                <el-tab-pane label="轨迹地图" name="track-map">
                    <track-map ref="trackMap" :userItem="userItem" :isShowCustomer="isShowCustomer" :parentVM="this"></track-map>
                </el-tab-pane>
                <el-tab-pane label="拜访对比" name="compare-map">
                    <compare-map ref="compareMap" :userItem="userItem" :isShowCustomer="isShowCustomer" :parentVM="this"></compare-map>
                </el-tab-pane>
            </el-tabs>
        </section>
        <section v-if="!isShowCompareMap" class="work-track-main-container" :class="{'hide-width': !isShow}" :style="{height: `${mainHeight}px`}" style="padding-top: 10px;">
            <track-map ref="trackMap" :userItem="userItem" :isShowCustomer="isShowCustomer" :parentVM="this"></track-map>
        </section>
    </div>
</template>

<style lang="less">
    @import "./css/index.less";
</style>

<script>
import XtWeb from 'xtion-web'
import SearchUserMenu from './SearchUserMenu.vue'
import TrackMap from './track-map/TrackMap.vue'
import CompareMap from './compare-map/CompareMap.vue'
import { getView, executeEvent, setView } from './api/utils.js'
import openBtnSrc from './icon/open-btn'

export default {
    name: 'work-track-plus',
    // mixins: [XtWeb.Widget.UI.View],
    mixins: [XtWeb.Engine.UI.View],
    data () {
        return {
            activeTab: 'track-map',
            userItem: {},
            screenHeight: 600,
            isShow: true,
            isShowCustomer: false, // 控制‘负责客户’的可配置属性
            isShowCompareMap: false, // 控制‘拜访对比’的可配置属性
            openBtnSrc
        }
    },
    components: {
        SearchUserMenu,
        TrackMap,
        CompareMap
    },
    beforeCreate () {
        this._cacheOnload = true
    },
    created () {
        // IDE注册的二开控件可以自定义参数，用于控制业务
        // viewRule变量，可在IDE上进行注册
        if (this.viewRule && this.viewRule.isshowcustomer === '1') {
            this.isShowCustomer = true
        }
        // 视图渲染全要确认是否渲染拜访对比的地图控件
        if (this.viewRule && this.viewRule.isshowcomparemap === '1') {
            this.isShowCompareMap = true
        }
    },
    mounted () {
        // 获取二开控件配置协议
        // this.viewRule
        let getScreenHeight = () => {
            this.screenHeight = document.body.offsetHeight
        }
        getScreenHeight()
        window.onresize = getScreenHeight
    },
    destroyed () {
        window.onresize = null
    },
    methods: {
        executeEvent,
        getView,
        setView,
        handleClickUserItem (userItem) {
            this.userItem = Object.assign({}, userItem)
        },
        handleClickTab (vm) {
            let name = vm.name
            if (name === 'compare-map') {
                this.$refs.compareMap.firstEnter()
            }
        }
    },
    computed: {
        mainHeight () {
            return this.screenHeight - 90
        }
    }
}
</script>
