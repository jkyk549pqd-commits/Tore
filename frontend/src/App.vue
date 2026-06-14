<!--
  * 主应用页面
  *
-->
<template>
  <a-config-provider :locale="antdLocale" :theme="antdThemeConfig">
    <el-config-provider :locale="elementLocale">
      <!---全局loading--->
      <a-spin
        :spinning="spinning"
        tip="稍等片刻，我在拼命加载中..."
        size="large"
      >
        <!--- 路由 -->
        <RouterView />
      </a-spin>
    </el-config-provider>
  </a-config-provider>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { theme } from "ant-design-vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { messages } from "/@/i18n";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useSpinStore } from "/@/store/modules/system/spin";
import { useThemeStore } from "/@/store/modules/theme";
import { useUserStore } from "/@/store/modules/system/user";
import _ from "lodash";
import { ipc } from "/@/utils/ipcRenderer";

// Store
const appConfigStore = useAppConfigStore();
const spinStore = useSpinStore();
const themeStore = useThemeStore();
const userStore = useUserStore();

// 国际化配置
const antdLocale = computed(() => messages[appConfigStore.language].antdLocale);
const dayjsLocale = computed(
  () => messages[appConfigStore.language].dayjsLocale
);
const elementLocale = computed(() => {
  return appConfigStore.language === "zh-CN" ? zhCn : en;
});

dayjs.locale(dayjsLocale);

// 主题状态
const isDark = ref(false);
const currentThemeColor = ref(themeStore.themeColor);

// ant-design-vue 主题配置
const antdThemeConfig = computed(() => ({
  algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: currentThemeColor.value,
    colorSuccess: "#67C23A",
    colorWarning: "#E6A23C",
    colorError: "#F56C6C",
    borderRadius: 6,
    fontSize: 14,
  },
}));

// 监听主题变化
const handleThemeChange = (e) => {
  isDark.value = e.detail === "dark";
};

// 监听主题色变化
const handleThemeColorChange = (e) => {
  currentThemeColor.value = e.detail;
};

// 监听主题 Store 的变化
watch(
  () => themeStore.currentTheme,
  (newTheme) => {
    isDark.value = newTheme === "dark";
  }
);

watch(
  () => themeStore.themeColor,
  (newColor) => {
    currentThemeColor.value = newColor;
  }
);

// 全局loading
const spinning = computed(() => spinStore.loading);

// 处理应用关闭事件
function handleBeforeUnload() {
  // 如果关闭了标签页持久化开关，清理标签页数据
  if (!appConfigStore.keepTabsOnClose) {
    localStorage.removeItem("user_tag_nav");
    localStorage.removeItem("instance_id_counter");
    return;
  }

  // 开关打开时:将当前标签页的运行时状态同步写入 SQLite
  // 仅保存 tagNavList 中真实存在的标签对应的状态(过滤掉已关闭的)
  try {
    const stateMap = userStore.instanceStateMap || {};
    const tagList = userStore.tagNavList || [];
    const validKeys = new Set();
    for (const tag of tagList) {
      const key = tag.instanceId
        ? `${tag.menuName}_instance_${tag.instanceId}`
        : `${tag.menuName}_default`;
      validKeys.add(key);
    }

    const list = [];
    for (const key of Object.keys(stateMap)) {
      if (!validKeys.has(key)) continue;
      const content = stateMap[key];
      if (!content || _.isEmpty(content)) continue;

      // 尝试序列化content，确保可以被IPC传输
      let serializableContent = null;
      try {
        // 如果content已经是字符串，直接使用
        if (typeof content === "string") {
          serializableContent = content;
        } else {
          // 否则尝试JSON序列化
          serializableContent = JSON.stringify(content);
        }

        // 验证序列化结果是否有效
        if (
          !serializableContent ||
          serializableContent === "null" ||
          serializableContent === "{}"
        ) {
          console.log("[beforeunload] Skipping invalid content for key:", key);
          continue;
        }

        list.push({ stateKey: key, content: serializableContent });
      } catch (e) {
        console.error(
          "[beforeunload] Failed to serialize content for key:",
          key,
          e
        );
        continue;
      }

      if (list.length >= 20) break;
    }

    if (ipc) {
      const result = ipc.sendSync("app:save-tab-states-sync", { list });
    } else {
      console.warn("[beforeunload] IPC not available in browser environment");
    }
  } catch (e) {
    console.error("[beforeunload] Error stack:", e.stack);
  }
}

// 将测试函数暴露到全局，便于在浏览器控制台调用
// if (typeof window !== "undefined") {
//   window.testManualSave = testManualSave;
// }

// 生命周期钩子
onMounted(() => {
  // 初始化主题状态
  isDark.value = themeStore.currentTheme === "dark";
  currentThemeColor.value = themeStore.themeColor;

  // 监听主题变化事件
  window.addEventListener("themeChange", handleThemeChange);
  window.addEventListener("themeColorChange", handleThemeColorChange);

  // 监听应用关闭事件
  window.addEventListener("beforeunload", handleBeforeUnload);

  // 添加额外的关闭事件监听作为备用
  window.addEventListener("pagehide", () => {
    handleBeforeUnload();
  });

  // 监听页面可见性变化
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handleBeforeUnload();
    }
  });

  // 定期监控 instanceStateMap 的变化
  // const checkInterval = setInterval(() => {
  //   const stateKeys = Object.keys(userStore.instanceStateMap || {});
  //   if (stateKeys.length > 0) {
  //     console.log(
  //       "[App.vue] State monitoring - Found",
  //       stateKeys.length,
  //       "state keys:",
  //       stateKeys
  //     );
  //   }
  // }, 5000);

  // 在组件卸载时清除监控
  // onUnmounted(() => {
  //   clearInterval(checkInterval);
  // });
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener("themeChange", handleThemeChange);
  window.removeEventListener("themeColorChange", handleThemeColorChange);
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>
<style scoped lang="less">
:deep(.ant-table-column-sorters) {
  align-items: flex-start !important;
}
</style>
