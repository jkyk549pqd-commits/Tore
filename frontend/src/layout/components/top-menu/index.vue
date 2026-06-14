<!--
  * 顶部菜单
  * 
-->
<template>
  <!--总共3部分：1、logo区域，包含 logo和名称; 2、菜单区域  ;3、用户操作区域-->
  <div class="header-main">
    <!-- 1、logo区域 -->
    <div class="logo" @click="onGoHome">
      <img class="logo-img" :src="logoImg" />
      <div class="title title-light" v-if="currentTheme === 'light'">
        {{ websiteName }}
      </div>
      <div class="title title-dark" v-if="currentTheme === 'dark'">
        {{ websiteName }}
      </div>
    </div>
    <!-- 2、菜单区域 -->
    <RecursionMenu ref="menuRef" />

    <!-- 3、用户操作区域 -->
    <div class="user-space">
      <!-- 全局搜索按钮 -->
      <GlobalSearchButton @open-search="handleOpenSearch" />

      <div class="theme-switcher-wrapper">
        <!---主题切换--->
        <ThemeSwitcher size="default" />
      </div>
      <div class="setting">
        <!---设置--->
        <a-button type="text" @click="showSetting" class="operate-icon">
          <template #icon>
            <span class="icon-wrapper">
              <setting-outlined />
            </span>
          </template>
        </a-button>
      </div>
      <HeaderSetting ref="headerSetting" />

      <!-- 全局搜索弹框 -->
      <GlobalSearchModal ref="searchModalRef" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import RecursionMenu from "./recursion-menu.vue";
import logoImg from "/@/assets/images/logo/logo.png";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import HeaderSetting from "../header-user-space/header-setting.vue";
import ThemeSwitcher from "/@/components/ThemeSwitcher.vue";
import { useThemeStore } from "/@/store/modules/theme";
import GlobalSearchButton from "./global-search-button.vue";
import GlobalSearchModal from "/@/layout/global-search-modal.vue";

// 设置
const headerSetting = ref();
function showSetting() {
  headerSetting.value.show();
}

// 全局搜索弹框引用
const searchModalRef = ref();

// 处理打开搜索
function handleOpenSearch() {
  if (searchModalRef.value) {
    searchModalRef.value.openSearch();
  }
}

const websiteName = computed(() => useAppConfigStore().websiteName);
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
      menuRef.value.updateSelectKeys();
    }
  }
);

const color = computed(() => {
  let isLight = useAppConfigStore().$state.sideMenuTheme === "light";
  return {
    color: isLight ? "#001529" : "#FFFFFF",
    background: isLight ? "#FFFFFF" : "#001529",
  };
});

const router = useRouter();
function onGoHome() {
  router.push({ name: HOME_PAGE_NAME });
}
</script>

<style lang="less" scoped>
.header-main {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  padding-left: 16px;
  height: 48px;
  z-index: 21;
  border-bottom: 1px solid rgb(238, 238, 238);

  .logo {
    min-width: 192px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .logo-img {
      display: inline-block;
      height: 45px;
      vertical-align: middle;
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      margin-left: 8px;
    }
    .title-light {
      color: #001529;
    }
    .title-dark {
      color: #ffffff;
    }
  }

  .user-space {
    min-width: 208px;
    margin-left: auto;
    color: v-bind("color.color");
    display: flex;
    flex-direction: row;
    vertical-align: middle;
    align-items: center;
    justify-content: flex-end;

    .setting {
      height: @header-user-height;
      line-height: @header-user-height;
      vertical-align: middle;
      display: flex;
      align-items: center;

      :deep(.ant-badge) {
        color: v-bind("color.color");
      }
    }
    .operate-icon {
      width: 40px !important;
      height: 40px !important;
      margin-right: 6px;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
    }
    .operate-icon:hover {
      color: #1677ff;
      background: transparent;
    }
    .icon-wrapper {
      display: inline-block;
      line-height: 1;
    }
    .icon-wrapper :deep(.anticon) {
      display: inline-block;
      transform-origin: center center;
    }
    .operate-icon:hover .icon-wrapper :deep(.anticon) {
      animation: rotate 1s forwards;
    }
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .user-space-item {
      margin-left: 10px;
    }
  }
}

:deep(.ant-menu-horizontal) {
  border-bottom: 0;
}
</style>
