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
        <section class="work-track-main-container" :class="{'hide-width': !isShow}" :style="{height: `${mainHeight}px`}">
            <el-tabs v-model="activeTab" @tab-click="handleClickTab">
                <el-tab-pane label="轨迹地图" name="track-map">
                    <track-map ref="trackMap" :userItem="userItem" :parentVM="this"></track-map>
                </el-tab-pane>
                <el-tab-pane label="拜访对比" name="compare-map">
                    <compare-map ref="compareMap" :userItem="userItem" :parentVM="this"></compare-map>
                </el-tab-pane>
            </el-tabs>
        </section>
    </div>
</template>

<style lang="less">
    @import "./css/index.less";
</style>

<script>
    import XtWeb from 'xtion-web'
    import SearchUserMenu from './SearchUserMenu'
    import TrackMap from './track-map/TrackMap'
    import CompareMap from './compare-map/CompareMap'
    import { getView, executeEvent, setView } from './api/utils.js'
    import openBtnSrc from './icon/open-btn'

    export default {
        name: 'work-track-plus',
        mixins: [XtWeb.Widget.UI.View],
        data() {
            return {
                activeTab: 'track-map',
                userItem: {},
                screenHeight: 600,
                isShow: true,
                openBtnSrc
            }
        },
        components: {
            SearchUserMenu,
            TrackMap,
            CompareMap
        },
        beforeCreate() {
            this._cacheOnload = true
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
            setView,
            handleClickUserItem(userItem) {
                this.userItem = Object.assign({}, userItem)
            },
            handleClickTab(vm) {
                let name = vm.name
                if (name === 'compare-map') {
                    this.$refs.compareMap.firstEnter()
                }
            }
        },
        computed: {
            mainHeight() {
                return this.screenHeight - 90
            }
        }
    }
</script>
