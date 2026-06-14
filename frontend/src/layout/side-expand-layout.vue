<!--
  *  展开菜单模式
  * 
-->
<template>
  <a-layout class="admin-layout" style="min-height: 100%">
    <!-- 侧边菜单 side-menu -->
    <a-layout-sider
      :theme="theme"
      class="side-menu"
      :collapsed="collapsed"
      :trigger="null"
    >
      <!-- 左侧菜单 -->
      <SideExpandMenu :collapsed="collapsed" />
    </a-layout-sider>

    <!--中间内容，一共三部分：1、顶部;2、中间内容区域;3、底部（一般是公司版权信息）;-->
    <a-layout
      class="admin-layout-main"
      :style="`height: ${windowHeight}px`"
      id="smartAdminMain"
    >
      <!-- 顶部头部信息 -->
      <a-layout-header class="smart-layout-header">
        <a-row justify="space-between" class="smart-layout-header-user">
          <a-col class="smart-layout-header-left">
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
            <el-tooltip
              :content="$t('home.home')"
              effect="light"
              placement="right"
              :disabled="!showTooltips"
            >
              <span class="home-button" @click="goHome">
                <home-outlined class="trigger" />
              </span>
            </el-tooltip>
            <span class="location-breadcrumb">
              <MenuLocationBreadcrumb />
            </span>
          </a-col>
          <!---用戶操作区域-->
          <a-col class="smart-layout-header-right">
            <HeaderUserSpace />
          </a-col>
        </a-row>
        <PageTag />
      </a-layout-header>

      <!--中间内容-->
      <a-layout-content
        class="admin-layout-content"
        id="smartAdminLayoutContent"
      >
        <!--不keepAlive的iframe使用单个iframe组件-->
        <IframeIndex
          v-show="iframeNotKeepAlivePageFlag"
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
      <!---- 回到顶部 --->
      <a-back-top :target="backTopTarget" :visibilityHeight="80" />
    </a-layout>
  </a-layout>
</template>
<script setup>
import { computed, ref } from "vue";
import HeaderUserSpace from "./components/header-user-space/index.vue";
import MenuLocationBreadcrumb from "./components/menu-location-breadcrumb/index.vue";
import PageTag from "./components/page-tag/index.vue";
import SideExpandMenu from "./components/side-expand-menu/index.vue";
import { smartKeepAlive } from "./components/smart-keep-alive";
import IframeIndex from "/@/components/framework/iframe/iframe-index.vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useRouter } from "vue-router";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { useThemeStore } from "/@/store/modules/theme";

const windowHeight = ref(window.innerHeight);

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

window.addEventListener("resize", function () {
  windowHeight.value = window.innerHeight;
});

//回到顶部
const backTopTarget = () => {
  return document.getElementById("smartAdminMain");
};

// ----------------------- keep-alive相关 -----------------------

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

let {
  route,
  keepAliveIncludes,
  iframeNotKeepAlivePageFlag,
  keepAliveIframePages,
} = smartKeepAlive();
const router = useRouter();
function goHome() {
  router.push({ name: HOME_PAGE_NAME });
}
</script>
<style scoped lang="less">
:deep(.ant-layout-header) {
  height: auto;
}
:deep(.layout-header) {
  height: auto;
}

.smart-layout-header {
  background: var(--el-bg-color, #fff);
  padding: 0;
  z-index: 21;
}

.smart-layout-header-user {
  height: @header-user-height;
  border-bottom: 1px solid var(--el-border-color-lighter, #f6f6f6);
}

.smart-layout-header-left {
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

.smart-layout-header-right {
  display: flex;
  height: @header-user-height;
}

.admin-layout {
  .side-menu {
    flex: 0 !important;
    min-width: inherit !important;
    max-width: none !important;
    width: auto !important;
    &.fixed-side {
      position: fixed;
      height: 100vh;
      left: 0;
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
    overflow-x: hidden;
  }

  .admin-layout-content {
    background-color: inherit;
    min-height: auto;
    position: relative;
    padding: 10px 10px 0px 10px;
    height: calc(100% - v-bind(dueHeight) px);
    overflow-x: hidden;
  }
}
</style>
