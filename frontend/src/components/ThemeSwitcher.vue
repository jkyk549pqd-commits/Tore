<template>
  <div class="theme-switcher">
    <!-- 自定义主题色按钮 -->
    <div class="custom-color-wrapper" ref="colorPickerWrapper">
      <el-tooltip
        :content="$t('theme.selectColor')"
        placement="bottom"
        effect="light"
        :disabled="!showTooltips"
      >
        <el-button
          :icon="Sunset"
          circle
          :size="size"
          class="custom-color-button"
          @click="toggleColorPicker"
        />
      </el-tooltip>

      <!-- 颜色选择器面板 -->
      <div
        v-show="showColorPicker"
        class="color-picker-panel"
        ref="colorPickerPanel"
      >
        <div class="color-picker-content">
          <div class="preset-colors">
            <div
              v-for="color in presetColors"
              :key="color"
              class="preset-color"
              :class="{ active: themeColor === color }"
              :style="{ backgroundColor: color }"
              @click="handlePresetColor(color)"
            >
              <span v-if="themeColor === color" class="check-icon">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 浅色/深色主题切换按钮 -->
    <el-tooltip
      :content="
        currentTheme === 'dark'
          ? $t('theme.switchToDark')
          : $t('theme.switchToLight')
      "
      placement="bottom"
      effect="light"
      :disabled="!showTooltips"
    >
      <el-button
        :icon="currentTheme === 'dark' ? Moon : Sunny"
        circle
        :size="size"
        class="theme-button"
        @click="handleLightDarkToggle"
      />
    </el-tooltip>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useThemeStore } from "/@/store/modules/theme";
import { Sunny, Moon, Sunset } from "@element-plus/icons-vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { onClickOutside } from "@vueuse/core";

// 颜色选择器显示状态
const showColorPicker = ref(false);

// 获取颜色选择器面板和包装器的引用
const colorPickerWrapper = ref(null);
const colorPickerPanel = ref(null);

// 点击外部关闭颜色选择器
onClickOutside(
  colorPickerWrapper,
  () => {
    showColorPicker.value = false;
  },
  {
    ignore: [colorPickerPanel],
  }
);

// 定义 props
const props = defineProps({
  size: {
    type: String,
    default: "default",
    validator: (value) => ["large", "default", "small"].includes(value),
  },
});

// 主题 Store
const themeStore = useThemeStore();

// 计算属性
const currentTheme = computed(() => themeStore.currentTheme);
const themeColor = computed(() => themeStore.themeColor);
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// 预设颜色
const presetColors = [
  "#409EFF", // 蓝色（默认）
  "#2d8cff", // 商务蓝
  "#1E6DF2", // 深邃蓝
  "#626AEF", // 靛蓝
  "#67C23A", // 绿色
  "#28C76F", // 翠竹绿
  "#00B894", // 薄荷绿
  "#6C5B3E", // 橄榄绿
  "#F56C6C", // 红色
  "#FF4D4D", // 番茄红
  "#FF6B6B", // 珊瑚红
  "#5D6D7E", // 沉稳灰
  "#909399", // 灰色
  "#C0C4CC", // 浅灰
  "#4ECDC4", // 青色
  "#B37FEB", // 紫色
  "#9B51E0", // 香芋紫
  "#E6A23C", // 橙色
];

// 处理浅色/深色主题切换
const handleLightDarkToggle = () => {
  const newTheme = currentTheme.value === "dark" ? "light" : "dark";
  themeStore.setTheme(newTheme);
};

// 切换颜色选择器显示/隐藏
const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value;
};

// 处理预设颜色选择
const handlePresetColor = (color) => {
  themeStore.setThemeColor(color);
  showColorPicker.value = false;
};
</script>

<style scoped lang="less">
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-button,
.custom-color-button {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.theme-button:hover,
.custom-color-button:hover {
  transform: scale(1.1);
}

.custom-color-wrapper {
  position: relative;
}

.custom-color-button {
  position: relative;
}

.custom-color-button::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  border-radius: 2px;
  background-color: v-bind("themeColor");
  transition: background-color 0.3s ease;
}

.color-picker-content {
  padding: 12px;
  padding-top: 0;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.preset-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}
.preset-color:hover {
  transform: scale(1.2);
  border-color: var(--el-color-primary, #409eff);
}
.preset-color.active {
  transform: scale(1.2);
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.check-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.color-picker-panel {
  position: absolute;
  bottom: -190px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 12px;
  z-index: 1000;
  min-width: 200px;
}

.color-picker-panel::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background-color: var(--el-bg-color, #ffffff);
  border-left: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  transform: translateX(-50%) rotate(45deg);
}
</style>
