<template>
  <a-layout class="admin-layout" style="min-height: 100%">
    <!-- 侧边菜单 side-menu -->
    <a-layout-sider
      class="side-menu"
      :width="sideMenuWidth"
      :collapsed="collapsed"
      :theme="theme"
      :style="{ background: 'var(--el-bg-color)' }"
    >
      <!-- 左侧菜单 -->
      <SideMenu :collapsed="collapsed" />
    </a-layout-sider>

    <!--中间内容，一共三部分：1、顶部;2、中间内容区域;3、底部（一般是公司版权信息）;-->
    <a-layout
      id="smartAdminMain"
      :style="`height: ${windowHeight}px`"
      class="admin-layout-main"
    >
      <!-- 顶部头部信息 -->
      <a-layout-header class="layout-header">
        <a-row class="layout-header-user" justify="space-between">
          <a-col class="layout-header-left">
            <span class="collapsed-button">
              <menu-unfold-outlined
                v-if="collapsed"
                class="trigger"
                @click="() => (collapsed = !collapsed)"
              />
              <menu-fold-outlined
                v-else
                class="trigger"
                @click="() => (collapsed = !collapsed)"
              />
            </span>
            <template #title>{{ $t("home.home") }}</template>
            <el-tooltip
              :content="$t('home.home')"
              placement="right"
              effect="light"
              :disabled="!showTooltips"
              ><span class="home-button" @click="goHome">
                <home-outlined class="trigger" /> </span
            ></el-tooltip>
            <span class="location-breadcrumb">
              <MenuLocationBreadcrumb />
            </span>
          </a-col>
          <!---用戶操作区域-->
          <a-col class="layout-header-right">
            <HeaderUserSpace />
          </a-col>
        </a-row>
        <PageTag />
      </a-layout-header>

      <!--中间内容-->
      <a-layout-content
        id="smartAdminLayoutContent"
        class="admin-layout-content"
      >
        <!--不keepAlive的iframe使用单个iframe组件-->
        <IframeIndex
          v-if="iframeNotKeepAlivePageFlag"
          :key="route.name"
          :name="route.name"
          :url="route.meta.frameUrl"
        />
        <!--keepAlive的iframe 每个页面一个iframe组件-->
        <IframeIndex
          v-for="item in keepAliveIframePages"
          v-show="route.name == item.name"
          :key="item.name"
          :name="item.name"
          :url="item.meta.frameUrl"
        />
        <!--非iframe使用router-view-->
        <div
          v-show="
            !iframeNotKeepAlivePageFlag &&
            keepAliveIframePages.every((e) => route.name != e.name)
          "
        >
          <router-view v-slot="{ Component }">
            <keep-alive :include="keepAliveIncludes">
              <component :is="Component" :key="getInstanceKey(route)" />
            </keep-alive>
          </router-view>
        </div>
      </a-layout-content>
      <!--- 回到顶部 -->
      <a-back-top :target="backTopTarget" :visibilityHeight="80" />
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAppConfigStore } from "../store/modules/system/app-config";
import HeaderUserSpace from "./components/header-user-space/index.vue";
import MenuLocationBreadcrumb from "./components/menu-location-breadcrumb/index.vue";
import PageTag from "./components/page-tag/index.vue";
import SideMenu from "./components/side-menu/index.vue";
import { smartKeepAlive } from "./components/smart-keep-alive";
import IframeIndex from "/@/components/framework/iframe/iframe-index.vue";
import { useRouter } from "vue-router";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { useThemeStore } from "/@/store/modules/theme";

// 从路由中获取实例ID（统一返回字符串类型）
function getInstanceIdFromQuery(query) {
  if (!query) return null;
  for (let key in query) {
    if (key.startsWith("_instance_")) return String(query[key]);
  }
  return null;
}

// 获取实例级别的缓存key（统一返回字符串类型）
function getInstanceKey(route) {
  const instanceId = getInstanceIdFromQuery(route.query);
  if (instanceId) {
    // 如果有实例ID，返回实例ID ;例如: "1", "2"
    return instanceId;
  }
  // 否则返回路由名称
  return route.name; // 例如: "902"
}

const windowHeight = ref(window.innerHeight);
//菜单宽度
const sideMenuWidth = computed(() => useAppConfigStore().$state.sideMenuWidth);
//主题颜色
const theme = computed(() => useThemeStore().currentTheme);
//是否显示标签页
const pageTagFlag = computed(() => useAppConfigStore().$state.pageTagFlag);
// 多余高度
const dueHeight = computed(() => {
  let due = 40;
  if (useAppConfigStore().$state.pageTagFlag) {
    due = due + 40;
  }
  if (useAppConfigStore().$state.footerFlag) {
    due = due + 40;
  }
  return due;
});
//是否隐藏菜单
const collapsed = ref(false);
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

//回到顶部
const backTopTarget = () => {
  return document.getElementById("smartAdminMain");
};

const router = useRouter();
function goHome() {
  router.push({ name: HOME_PAGE_NAME });
}

window.addEventListener("resize", function () {
  windowHeight.value = window.innerHeight;
});

// ----------------------- keep-alive相关 -----------------------
let {
  route,
  keepAliveIncludes,
  iframeNotKeepAlivePageFlag,
  keepAliveIframePages,
} = smartKeepAlive();
</script>

<style lang="less" scoped>
:deep(.ant-layout-header) {
  height: auto;
}

:deep(.layout-header) {
  height: auto;
}

.layout-header {
  background: var(--el-bg-color, #fff);
  padding: 0;
  z-index: 21;
}

.layout-header-user {
  height: @header-user-height;
  border-bottom: 1px solid var(--el-border-color-lighter, #f6f6f6);
}

.layout-header-left {
  display: flex;
  height: @header-user-height;

  .collapsed-button {
    margin-left: 10px;
    line-height: @header-user-height;
  }

  .home-button {
    margin-left: 15px;
    cursor: pointer;
    padding: 0 5px;
    line-height: @header-user-height;
  }

  .location-breadcrumb {
    margin-left: 15px;
    line-height: @header-user-height;
  }
}

.layout-header-right {
  display: flex;
  height: @header-user-height;
}

.layout-container {
  height: calc(100vh - @header-height);
  overflow-x: hidden;
}

.admin-layout {
  .side-menu {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: scroll;
    &.fixed-side {
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
    }
  }

  .side-menu::-webkit-scrollbar {
    width: 4px;
  }
  .side-menu::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
  }
  .side-menu::-webkit-scrollbar-track {
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  .help-doc-sider {
    flex: 0 !important;
    min-width: 100px;
    height: 100vh;
    max-width: 100px;
    width: auto !important;

    &.fixed-side {
      position: fixed;
      height: 100vh;
      right: 0;
      top: 0;
    }
  }

  .virtual-side {
    transition: all 0.2s;
  }

  .virtual-header {
    transition: all 0.2s;
    opacity: 0;

    &.fixed-tabs.multi-page:not(.fixed-header) {
      height: 0;
    }
  }

  .admin-layout-main {
    overflow-y: hidden;
    overflow-x: hidden;
  }

  .admin-layout-content {
    background-color: inherit;
    min-height: auto;
    position: relative;
    overflow-x: hidden;
    padding: 10px 10px 0px 10px;
    height: calc(100% - v-bind(dueHeight) px);
  }
}
</style>
