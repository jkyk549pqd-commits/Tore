<template>
  <div class="diff-detail-container">
    <CodeDiff
      :old-string="localJsonStr1"
      :new-string="localJsonStr2"
      language="JSON"
      diffStyle="word"
      output-format="side-by-side"
      :theme="diffTheme"
    />
    <!-- 返回顶部按钮 -->
    <el-backtop
      target="#smartAdminLayoutContent"
      :visibility-height="160"
      :right="50"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, computed } from "vue";
import { CodeDiff } from "v-code-diff";
import { useThemeStore } from "/@/store/modules/theme";

const themeStore = useThemeStore();

// 根据系统主题映射到 CodeDiff 主题
const diffTheme = computed(() => {
  return themeStore.currentTheme === "light" ? "light" : "dark";
});

const localJsonStr1 = ref("");
const localJsonStr2 = ref("");

/**
 * 从 sessionStorage 获取 JSON 比较数据
 */
function loadCompareData() {
  try {
    const jsonDiffData = sessionStorage.getItem("jsonDiff");
    if (jsonDiffData) {
      const data = JSON.parse(jsonDiffData);
      localJsonStr1.value = data.jsonStr1 || "";
      localJsonStr2.value = data.jsonStr2 || "";
    }
  } catch (e) {
    console.warn("[JSON diff] 加载比较数据失败:", e);
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCompareData();
});

// keep-alive 激活时重新加载数据
onActivated(() => {
  loadCompareData();
});
</script>

<style scoped>
.diff-detail-container {
  height: 100%;
  overflow: hidden;
}
</style>
