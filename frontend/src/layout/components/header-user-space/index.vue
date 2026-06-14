<!--
  * 头部一整行
  *
-->
<template>
  <a-space style="gap: 0px">
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
  </a-space>
</template>

<script setup>
import HeaderSetting from "./header-setting.vue";
import ThemeSwitcher from "/@/components/ThemeSwitcher.vue";
import GlobalSearchButton from "./global-search-button.vue";
import GlobalSearchModal from "/@/layout/global-search-modal.vue";
import { ref } from "vue";

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
</script>

<style lang="less" scoped>
.theme-switcher-wrapper {
  height: @header-user-height;
  line-height: @header-user-height;
  vertical-align: middle;
  display: flex;
  align-items: center;
}

.setting {
  height: @header-user-height;
  line-height: @header-user-height;
  vertical-align: middle;
  display: flex;
  align-items: center;
}
.operate-icon {
  width: 40px;
  height: 40px;
  display: flex;
  margin-right: 5px;
  align-items: center;
  justify-content: center;
  padding: 0;
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
.operate-icon:hover :deep(.anticon) {
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
</style>
