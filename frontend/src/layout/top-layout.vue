<template>
  <a-layout class="admin-layout">
    <!-- 顶部菜单  -->
    <a-layout-header class="top-menu" :theme="theme">
      <TopMenu />
    </a-layout-header>

    <!--中间内容-->
    <a-layout-content id="smartAdminLayoutContent" class="admin-layout-content">
      <!---标签页-->
      <div class="page-tag-div" v-show="pageTagFlag">
        <PageTag />
      </div>

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
</template>

<script setup>
import { computed, ref } from "vue";
import { useAppConfigStore } from "../store/modules/system/app-config";
import PageTag from "./components/page-tag/index.vue";
import TopMenu from "./components/top-menu/index.vue";
import { smartKeepAlive } from "./components/smart-keep-alive";
import IframeIndex from "/@/components/framework/iframe/iframe-index.vue";
import { useRouter } from "vue-router";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { useThemeStore } from "/@/store/modules/theme";

const windowHeight = ref(window.innerHeight);
//主题颜色
const theme = computed(() => useThemeStore().currentTheme);
const color = computed(() => {
  let isLight = useThemeStore().currentTheme === "light";
  return {
    color: isLight ? "#001529" : "#FFFFFF",
    background: isLight ? "#FFFFFF" : "#001529",
  };
});

//是否显示标签页
const pageTagFlag = computed(() => useAppConfigStore().$state.pageTagFlag);
// 页面宽度
const pageWidth = computed(() => useAppConfigStore().$state.pageWidth);
// 多余高度
const dueHeight = computed(() => {
  let due = "45px";
  if (useAppConfigStore().$state.pageTagFlag) {
    due = "85px";
  }
  return due;
});

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
</script>

<style lang="less" scoped>
.admin-layout {
  min-height: 100%;

  .top-menu {
    padding: 0px;
    height: 48px;
    line-height: 48px;
    width: 100%;
    z-index: 100;
    right: 0px;
    position: fixed;
    background-color: v-bind("color.background") !important;
  }

  .admin-layout-content {
    background-color: inherit;
    min-height: auto;
    position: relative;
    overflow-x: hidden;
    padding: 10px 0;
    width: v-bind(pageWidth);
    margin-top: v-bind(dueHeight);
    margin-left: auto;
    margin-right: auto;

    .page-tag-div {
      position: fixed;
      top: 48px;
      width: v-bind(pageWidth);
      height: 40px;
      line-height: 40px;
      z-index: 11;
    }
  }
}
</style>
