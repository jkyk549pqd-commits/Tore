<!--
  * 传统菜单
  * 
-->
<template>
  <!--左侧菜单分为两部分：1、顶部logo区域，包含 logo和名称;2、下方菜单区域-->

  <!-- 1、顶部logo区域 -->
  <div class="logo" @click="onGoHome" :style="sideMenuWidth" v-if="!collapsed">
    <img class="logo-img" :src="logoImg" />
    <div class="title title-dark" v-if="currentTheme === 'dark'">
      {{ websiteName }}
    </div>
    <div class="title title-light" v-else>
      {{ websiteName }}
    </div>
  </div>
  <div class="min-logo" @click="onGoHome" v-if="collapsed">
    <img class="logo-img" :src="logoImgMini" />
  </div>
  <el-divider class="custom-divider"></el-divider>
  <!-- 2、下方菜单区域： 这里使用一个递归菜单解决 -->
  <RecursionMenu :collapsed="collapsed" ref="menuRef" />
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import RecursionMenu from "./recursion-menu.vue";
import logoImg from "/@/assets/images/logo/logo.png";
import logoImgMini from "/@/assets/images/logo/logo-min.png";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useThemeStore } from "/@/store/modules/theme";

const websiteName = computed(() => useAppConfigStore().websiteName);
const sideMenuWidth = computed(
  () => "width:" + useAppConfigStore().sideMenuWidth + "px"
);
const currentTheme = computed(() => useThemeStore().currentTheme);

const props = defineProps({
  collapsed: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const menuRef = ref();

watch(
  () => props.collapsed,
  (newValue, oldValue) => {
    // 如果是展开菜单的话，重新获取更新菜单的展开项: openkeys和selectKeys
    if (!newValue) {
      nextTick(() => menuRef.value.updateOpenKeysAndSelectKeys());
    }
  }
);

const router = useRouter();
function onGoHome() {
  router.push({ name: HOME_PAGE_NAME });
}
</script>

<style lang="less" scoped>
.shadow {
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}
.custom-divider {
  display: block !important; /* 强制显示 */
  height: 1px !important;
  margin: 1px 0 !important; /* 调整上下间距 */
  background-color: #e6e6e6 !important; /* 自定义颜色 */
}
.side-menu {
  min-height: 100vh;
  overflow-y: auto;
  z-index: 10;

  .min-logo {
    height: @header-user-height;
    line-height: @header-user-height;
    padding: 0px 15px 0px 15px;
    width: 100%;
    z-index: 21;
    display: flex;
    justify-content: center;
    .logo-img {
      width: 32px;
      height: 32px;
    }
  }

  .logo {
    height: @header-user-height;
    line-height: @header-user-height;
    padding: 0px 15px 0px 20px;
    z-index: 21;
    display: flex;
    cursor: pointer;
    // justify-content: center;

    .logo-img {
      width: 40px;
      height: 40px;
    }

    .title {
      font-size: 16px;
      font-weight: 600;
      margin-left: 8px;
    }
  }
}

/* 修复：将 title-light 和 title-dark 样式移到 .logo 外部，使其能够匹配 */
.logo .title-light {
  color: #001529;
}

.logo .title-dark {
  color: #ffffff;
}

.menu {
  padding: 16px 0;
}
</style>
