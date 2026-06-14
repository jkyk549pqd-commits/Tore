<!--
  * 高亮文本组件
  * 用于在搜索结果中高亮显示关键词
-->
<template>
  <span v-html="highlightedText" class="highlight-text"></span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  keyword: {
    type: String,
    default: "",
  },
});

const highlightedText = computed(() => {
  if (!props.keyword || !props.text) {
    return props.text;
  }

  const regex = new RegExp(`(${escapeRegExp(props.keyword)})`, "gi");
  return props.text.replace(regex, '<mark class="highlight">$1</mark>');
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
</script>

<style lang="less" scoped>
.highlight-text {
  :deep(.highlight) {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    padding: 0 4px;
    border-radius: 2px;
    font-weight: 600;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }
}
</style>
