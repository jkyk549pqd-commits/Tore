<!--
  * 通用快捷工具栏组件
  * 提供跨编辑器的通用操作：剪贴板粘贴、文件导入、历史记录
  * 全宽面板布局，与 EditorHub 和 RecentRecords 视觉对齐
-->
<template>
  <div class="quick-toolbar" :class="{ 'dark-mode': isDarkMode }">
    <div class="toolbar-item" @click="handleClipboard">
      <div class="toolbar-icon">
        <SnippetsOutlined />
      </div>
      <span class="toolbar-label">{{ t("home.toolbar.clipboard") }}</span>
    </div>
    <div class="toolbar-divider" />
    <div class="toolbar-item" @click="$emit('import')">
      <div class="toolbar-icon">
        <ImportOutlined />
      </div>
      <span class="toolbar-label">{{ t("home.toolbar.import") }}</span>
    </div>
    <div class="toolbar-divider" />
    <div class="toolbar-item" @click="handleHistory">
      <div class="toolbar-icon">
        <HistoryOutlined />
      </div>
      <span class="toolbar-label">{{ t("home.toolbar.history") }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  SnippetsOutlined,
  ImportOutlined,
  HistoryOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useFileRouter } from "../composables/useFileRouter";
import { useThemeStore } from "/@/store/modules/theme";
import { ElMessage } from "element-plus";

const { t } = useI18n();
const router = useRouter();
const { detectContentType, navigateToEditor } = useFileRouter();
const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDark);

defineEmits(["import"]);

/**
 * 读取剪贴板内容，自动识别类型并跳转
 */
async function handleClipboard() {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      ElMessage.warning(t("home.toolbar.clipboardNotSupported"));
      return;
    }
    const text = await navigator.clipboard.readText();
    if (!text || !text.trim()) {
      ElMessage.info(t("home.toolbar.clipboardEmpty"));
      return;
    }
    const detected = detectContentType(text);
    if (detected) {
      navigateToEditor(detected.editor, {
        format: detected.format,
        content: text,
      });
    } else {
      navigateToEditor("json", { content: text });
    }
  } catch {
    ElMessage.warning(t("home.toolbar.clipboardFailed"));
  }
}

/**
 * 跳转到历史记录页面
 */
function handleHistory() {
  router.push("/jsonHis");
}
</script>

<style scoped lang="less">
.quick-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 18px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  animation: fadeInUp 0.4s ease-out 0.3s both;

  .toolbar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 24px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.25s ease;
    flex: 1;
    justify-content: center;

    &:hover {
      background: var(--primary-lighter);
      transform: translateY(-1px);

      .toolbar-icon {
        color: var(--primary-color);
      }

      .toolbar-label {
        color: var(--primary-color);
      }
    }

    &:active {
      transform: translateY(0);
    }

    .toolbar-icon {
      font-size: 20px;
      color: #595959;
      transition: color 0.25s ease;
    }

    .toolbar-label {
      font-size: 14px;
      font-weight: 500;
      color: #595959;
      transition: color 0.25s ease;
      white-space: nowrap;
    }
  }

  .toolbar-divider {
    width: 1px;
    height: 28px;
    background: rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }
}

// 深色模式
.quick-toolbar.dark-mode {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

  .toolbar-item {
    .toolbar-icon {
      color: rgba(255, 255, 255, 0.75);
    }

    .toolbar-label {
      color: rgba(255, 255, 255, 0.75);
    }

    &:hover {
      background: var(--primary-hover);

      .toolbar-icon {
        color: #69c0ff;
      }

      .toolbar-label {
        color: #69c0ff;
      }
    }
  }

  .toolbar-divider {
    background: rgba(255, 255, 255, 0.1);
  }
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
  .quick-toolbar {
    padding: 14px 16px;

    .toolbar-item {
      padding: 8px 12px;
      gap: 6px;

      .toolbar-icon {
        font-size: 18px;
      }

      .toolbar-label {
        font-size: 13px;
      }
    }
  }
}
</style>
