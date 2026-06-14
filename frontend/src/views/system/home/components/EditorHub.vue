<!--
  * 编辑器入口区组件
  * 展示三种编辑器的入口卡片，提供快速进入各编辑器的能力
-->
<template>
  <div class="editor-hub">
    <EditorCard
      :icon="CodeOutlined"
      :title="t('home.hub.code.title')"
      :description="isSimpleMode ? undefined : t('home.hub.code.desc')"
      :actions="isSimpleMode ? [] : codeActions"
      :simple-mode="isSimpleMode"
      @click="navigateToEditor('code')"
      @action="handleCodeAction"
    />
    <EditorCard
      :icon="FireOutlined"
      :title="t('home.hub.json.title')"
      :description="isSimpleMode ? undefined : t('home.hub.json.desc')"
      :actions="isSimpleMode ? [] : jsonActions"
      :simple-mode="isSimpleMode"
      @click="navigateToEditor('json')"
      @action="handleJsonAction"
    />
    <EditorCard
      :icon="FileTextOutlined"
      :title="t('home.hub.text.title')"
      :description="isSimpleMode ? undefined : t('home.hub.text.desc')"
      :actions="isSimpleMode ? [] : textActions"
      :simple-mode="isSimpleMode"
      @click="navigateToEditor('text')"
      @action="handleTextAction"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useFileRouter } from "../composables/useFileRouter";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import EditorCard from "./EditorCard.vue";
import {
  FireOutlined,
  CodeOutlined,
  FileTextOutlined,
} from "@ant-design/icons-vue";

const { t } = useI18n();
const { navigateToEditor } = useFileRouter();
const appConfigStore = useAppConfigStore();

// 当前布局模式
const layoutMode = computed(() => appConfigStore.homeLayoutMode || "standard");
const isSimpleMode = computed(() => layoutMode.value === "simple");

// JSON 编辑器快捷操作
const jsonActions = computed(() => [
  { key: "format", label: t("home.hub.json.format") },
  { key: "compress", label: t("home.hub.json.compress") },
  { key: "sort", label: t("home.hub.json.sort") },
]);

// Code 编辑器快捷操作
const codeActions = computed(() => [
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "go", label: "Go" },
]);

// Text 编辑器快捷操作
const textActions = computed(() => [
  { key: "yaml", label: "YAML" },
  { key: "sql", label: "SQL" },
  { key: "md", label: "Markdown" },
  { key: "shell", label: "Shell" },
]);

function handleJsonAction(key) {
  navigateToEditor("json", { action: key });
}

function handleCodeAction(format) {
  navigateToEditor("code", { format });
}

function handleTextAction(format) {
  navigateToEditor("text", { format });
}
</script>

<style scoped lang="less">
.editor-hub {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式
@media (max-width: 768px) {
  .editor-hub {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .editor-hub {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
