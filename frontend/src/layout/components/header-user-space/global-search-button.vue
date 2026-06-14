<!--
  * 全局搜索按钮组件 (侧边菜单版本)
  * 支持主题切换和主题色适配
-->
<template>
  <div class="global-search-wrapper">
    <el-tooltip
      effect="light"
      placement="bottom"
      :disabled="!showTooltips"
      :content="$t('globalSearch.tooltip')"
    >
      <a-button
        type="text"
        @click="openSearch"
        class="search-button operate-icon"
      >
        <template #icon>
          <span class="icon-wrapper" :style="{ color: themeColor }">
            <search-outlined />
          </span>
        </template>
      </a-button>
    </el-tooltip>
    <span class="shortcut-hint" :class="{ 'dark-hint': isDarkTheme }">
      Ctrl+F
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useThemeStore } from "/@/store/modules/theme";
import { SearchOutlined } from "@ant-design/icons-vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";

const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// 主题 Store
const themeStore = useThemeStore();
const isDarkTheme = computed(() => themeStore.isDark);
const themeColor = computed(() => themeStore.themeColor);

// 定义 emit
const emit = defineEmits(["open-search"]);

// 打开搜索
function openSearch() {
  emit("open-search");
}

// 监听主题变化
onMounted(() => {
  window.addEventListener("themeChange", handleThemeChange);
  window.addEventListener("themeColorChange", handleThemeColorChange);
});

onUnmounted(() => {
  window.removeEventListener("themeChange", handleThemeChange);
  window.removeEventListener("themeColorChange", handleThemeColorChange);
});

function handleThemeChange(event) {
  // 主题切换时,样式会自动响应 CSS 变量变化
}

function handleThemeColorChange(event) {
  // 主题色切换时,样式会自动响应 CSS 变量变化
}
</script>

<style lang="less" scoped>
.global-search-wrapper {
  margin-right: 20px;
  height: @header-user-height;
  display: flex;
  align-items: center;
  gap: 4px;

  .search-button {
    width: 40px;
    height: 40px;
    margin-right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    transition: all 0.3s ease;

    &:hover {
      border-radius: 8px;
      color: var(--el-color-primary);
      background: rgba(var(--el-color-primary-rgb), 0.1);
      transform: scale(1.1);
    }

    .icon-wrapper {
      display: inline-block;
      line-height: 1;
      transition: color 0.3s ease;
    }
  }

  .shortcut-hint {
    font-size: 10px;
    color: var(--el-text-color-secondary);
    opacity: 0.7;
    transition: color 0.3s ease;

    &.dark-hint {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
