<template>
  <div class="markdown-preview" :class="{ 'is-hidden': !isVisible }">
    <div class="preview-header">
      <span class="preview-title">
        <ReadOutlined style="margin-right: 8px" />
        {{ t("textEditor.previewTitle") }}
      </span>
    </div>
    <div class="preview-content" v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from "vue";
import { marked } from "marked";
import { useI18n } from "vue-i18n";
import { ReadOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();

// 配置 marked 选项
marked.setOptions({
  breaks: true, // 启用换行符
  gfm: true, // 启用 GitHub Flavored Markdown
  headerIds: true,
  mangle: false, // 不混淆邮件地址
});

// 渲染 Markdown 内容
const renderedMarkdown = computed(() => {
  if (!props.content || props.content.trim() === "") {
    return `<div class="empty-preview">${t("textEditor.emptyPreview")}</div>`;
  }

  try {
    return marked(props.content);
  } catch (error) {
    console.error("Markdown 渲染失败:", error);
    return `<div class="error-preview">${t("textEditor.renderError")}</div>`;
  }
});

// 监听内容变化，可用于滚动同步等扩展功能
watch(
  () => props.content,
  (newContent) => {
    // 可以在这里添加滚动同步逻辑
  }
);

onMounted(() => {
  // 可以在这里初始化代码高亮等扩展功能
});
</script>

<style lang="less" scoped>
.markdown-preview {
  height: 100%;
  width: 100%;
  display: flex;
  margin-left: 10px;
  border-radius: 4px !important;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;

  &.is-hidden {
    display: none;
  }

  .preview-header {
    border-radius: 8px !important;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .preview-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .preview-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    line-height: 1.6;
    color: var(--el-text-color-regular);

    // Markdown 样式
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--el-text-color-primary);
    }

    :deep(h1) {
      font-size: 2em;
      border-bottom: 1px solid var(--el-border-color-lighter);
      padding-bottom: 0.3em;
    }

    :deep(h2) {
      font-size: 1.5em;
      border-bottom: 1px solid var(--el-border-color-lighter);
      padding-bottom: 0.3em;
    }

    :deep(h3) {
      font-size: 1.25em;
    }

    :deep(p) {
      margin-top: 0;
      margin-bottom: 16px;
    }

    :deep(a) {
      color: var(--el-color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 2em;
      margin-bottom: 16px;
    }

    :deep(li) {
      margin-bottom: 4px;
    }

    :deep(code) {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: var(--el-fill-color-light);
      border-radius: 6px;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
    }

    :deep(pre) {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: var(--el-fill-color-light);
      border-radius: 6px;
      margin-bottom: 16px;

      code {
        background-color: transparent;
        padding: 0;
        font-size: inherit;
      }
    }

    :deep(blockquote) {
      padding: 0 1em;
      color: var(--el-text-color-secondary);
      border-left: 0.25em solid var(--el-border-color);
      margin: 0 0 16px 0;
    }

    :deep(table) {
      border-spacing: 0;
      border-collapse: collapse;
      margin-bottom: 16px;
      width: 100%;

      th,
      td {
        padding: 6px 13px;
        border: 1px solid var(--el-border-color-lighter);
      }

      th {
        font-weight: 600;
        background-color: var(--el-fill-color-light);
      }

      tr:nth-child(2n) {
        background-color: var(--el-fill-color-blank);
      }
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 16px 0;
    }

    :deep(hr) {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: var(--el-border-color-lighter);
      border: 0;
    }

    :deep(.empty-preview),
    :deep(.error-preview) {
      text-align: center;
      padding: 40px 20px;
      color: var(--el-text-color-placeholder);
      font-size: 14px;
    }

    :deep(.error-preview) {
      color: var(--el-color-danger);
    }
  }
}

// 深色模式适配
[data-theme="dark"] {
  .markdown-preview {
    background-color: var(--el-bg-color);
    border-left-color: var(--el-border-color-lighter);

    .preview-header {
      background-color: var(--el-fill-color-light);
      border-bottom-color: var(--el-border-color-lighter);

      .preview-title {
        color: var(--el-text-color-primary);
      }
    }

    .preview-content {
      color: var(--el-text-color-regular);

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6) {
        color: var(--el-text-color-primary);
        border-bottom-color: var(--el-border-color-lighter);
      }

      :deep(a) {
        color: var(--el-color-primary-light-3);
      }

      :deep(code) {
        background-color: var(--el-fill-color-dark);
      }

      :deep(pre) {
        background-color: var(--el-fill-color-dark);
      }

      :deep(blockquote) {
        border-left-color: var(--el-border-color);
        color: var(--el-text-color-secondary);
      }

      :deep(table) {
        th,
        td {
          border-color: var(--el-border-color-lighter);
        }

        th {
          background-color: var(--el-fill-color-dark);
        }

        tr:nth-child(2n) {
          background-color: var(--el-fill-color-blank);
        }
      }

      :deep(hr) {
        background-color: var(--el-border-color-lighter);
      }
    }
  }
}
</style>
