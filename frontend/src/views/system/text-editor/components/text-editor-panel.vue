<template>
  <div
    :id="editorId"
    class="textarea-wrapper"
    :class="{ 'has-preview': showPreview && isMarkdown }"
  >
    <!-- 编辑器区域 -->
    <div
      class="editor-section"
      :class="{ 'with-preview': showPreview && isMarkdown }"
    >
      <Codemirror
        class="codemirror"
        v-model:value="localValue"
        :options="cmOptions"
        border
        :placeholder="placeholder"
        :style="{ fontSize: fontSize + 'px' }"
        @ready="handleReady"
        @change="handleChange"
      />

      <!-- 字符数统计显示 -->
      <div class="char-count-bar">
        <span class="char-count-info">
          {{ t("textEditor.characters") }}: <strong>{{ charCount }}</strong>
          {{ t("textEditor.lines") }}: <strong>{{ lineCount }}</strong>
          <span class="selected-info">
            | {{ t("textEditor.selected") }}:
            <strong>{{ selectedCharCount }}</strong>
          </span>
        </span>
      </div>
      <!-- 导入弹框 -->
      <TextEditorImportDialog
        v-model:visible="importDialogVisible"
        :t="t"
        @file-selected="handleFileSelected"
        @close="handleCloseImportDialog"
      />

      <!-- 剪贴板操作按钮组 -->
      <TextEditorButtons
        :button-states="buttonStates"
        :show-tooltips="showTooltips"
        :t="t"
        :show-format-buttons="showFormatButtons()"
        @copy="handleCopy"
        @paste="handlePaste"
        @import="handleImport"
        @export="handleExport"
        @demo="handleDemo"
        @clear="handleClear"
        @format="handleFormat"
        @compress="handleCompress"
      />
    </div>

    <!-- Markdown 预览区域 -->
    <MarkdownPreview
      v-if="isMarkdown"
      :content="localValue"
      :is-visible="showPreview"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import Codemirror from "codemirror-editor-vue3";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript.js";
// 多语言格式支持导入
import "codemirror/mode/yaml/yaml.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/toml/toml.js";
import "codemirror/mode/properties/properties.js";
import "codemirror/mode/dockerfile/dockerfile.js";
import "codemirror/mode/shell/shell.js";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/mode/sql/sql.js";
// Lint 相关导入
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
// 代码折叠相关导入
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/xml-fold.js";
// XML 自动闭合标签
import "codemirror/addon/edit/closetag.js";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useCodeMirrorThemes } from "../../json/composables/useCodeMirrorThemes";
import { useClipboardActions } from "../composables/useClipboardActions";
import { useFileImportExport } from "../composables/useFileImportExport";
import { useTextEditorOperations } from "../composables/useTextEditorOperations";
import TextEditorButtons from "./text-editor-buttons.vue";
import TextEditorImportDialog from "./text-editor-import-dialog.vue";
import MarkdownPreview from "./markdown-preview.vue";
import { GenRandomText, generateDemoContent } from "../composables/utils";
import { ElMessage } from "element-plus";

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  editorId: {
    type: String,
    required: true,
  },
  cmOptions: {
    type: Object,
    required: true,
  },
  fontSize: {
    type: Number,
    default: 14,
  },
  placeholder: {
    type: String,
    default: "",
  },
  currentFileFormat: {
    type: String,
    default: "text",
  },
  showPreview: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "ready", "change"]);

// 国际化
const { t } = useI18n();

// 获取配置 store
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.$state.showTooltips);

// 使用主题管理 Composable
const { loadTheme } = useCodeMirrorThemes();

// 本地值
const localValue = ref(props.modelValue);

// 创建响应式的 currentFileFormat ref
const reactiveFormat = computed(() => props.currentFileFormat);

// 判断当前是否为 Markdown 格式
const isMarkdown = computed(() => props.currentFileFormat === "md");

// 使用剪贴板操作 Composable
const {
  buttonStates: clipboardButtonStates,
  handleCopy,
  handlePaste,
  handleClear,
} = useClipboardActions({
  emit,
  t,
  localValue,
});

// 使用文本编辑器操作 Composable
const {
  buttonStates: textEditorButtonStates,
  handleFormat,
  handleCompress,
  showFormatButtons,
} = useTextEditorOperations({
  emit,
  t,
  localValue,
  currentFileFormat: reactiveFormat,
});

// 合并按钮状态
const buttonStates = computed(() => ({
  ...clipboardButtonStates.value,
  ...textEditorButtonStates.value,
}));

// 使用文件导入导出 Composable
const {
  importDialogVisible,
  handleImport,
  handleExport,
  handleCloseImportDialog,
  processFile,
} = useFileImportExport({
  emit,
  t,
  localValue,
  currentFileFormat: reactiveFormat,
});

// 编辑器实例
const cmInstance = ref(null);

// 选中文本统计
const selectedCharCount = ref(0);

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localValue.value) {
      localValue.value = newValue;
    }
  }
);

// 监听本地值变化，同步到外部
watch(localValue, (newValue) => {
  emit("update:modelValue", newValue);
});

// 监听 cmOptions 变化，动态更新 CodeMirror 配置
watch(
  () => props.cmOptions,
  async (newOptions, oldOptions) => {
    if (cmInstance.value && newOptions !== oldOptions) {
      // 主题变化时，先加载主题 CSS
      if (newOptions.theme !== oldOptions?.theme && newOptions.theme) {
        try {
          await loadTheme(newOptions.theme);
          cmInstance.value.setOption("theme", newOptions.theme);
        } catch (error) {
          // console.error("text-editor-panel: 加载主题失败:", error);
        }
      }
      if (newOptions.lineNumbers !== oldOptions?.lineNumbers) {
        cmInstance.value.setOption("lineNumbers", newOptions.lineNumbers);
      }
      if (newOptions.lineWrapping !== oldOptions?.lineWrapping) {
        cmInstance.value.setOption("lineWrapping", newOptions.lineWrapping);
      }
      if (newOptions.readOnly !== oldOptions?.readOnly) {
        cmInstance.value.setOption("readOnly", newOptions.readOnly);
      }
    } else {
      // console.log(
      //   "text-editor-panel: 跳过配置更新，cmInstance 不存在或配置未变化"
      // );
    }
  },
  { deep: true }
);

// 计算字符数
const charCount = computed(() => localValue.value.length);

// 计算行数
const lineCount = computed(() => {
  if (!localValue.value) return 0;
  return localValue.value.split("\n").length;
});

/**
 * 编辑器就绪回调
 */
async function handleReady(cm) {
  cmInstance.value = cm;

  // 加载初始主题
  if (props.cmOptions.theme) {
    try {
      await loadTheme(props.cmOptions.theme);
    } catch (error) {
      console.error("加载初始主题失败:", error);
    }
  }

  // 使用 requestAnimationFrame 优化 cursorActivity 事件处理，避免滚动时卡顿
  let rafId = null;

  // 监听选区变化，更新选中文本统计
  cm.on("cursorActivity", function (cm) {
    // 如果已有 RAF 在进行中，跳过当前事件
    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      const selection = cm.getSelection();
      selectedCharCount.value = selection.length;
      rafId = null;
    });
  });

  emit("ready", cm);
}

/**
 * 内容变化回调
 */
function handleChange(value) {
  emit("change", value);
}

/**
 * 处理文件选择
 */
function handleFileSelected(file) {
  processFile(file);
}

/**
 * 生成随机示例数据
 */
function handleDemo() {
  try {
    const demoContent = generateDemoContent(props.currentFileFormat);
    emit("update:modelValue", demoContent);
    buttonStates.value.delete = !buttonStates.value.delete;
  } catch (error) {
    console.error("生成示例内容失败:", error);
    ElMessage.error(t("json.editor.generateRandomJsonFailed"));
  }
}
</script>

<style lang="less">
.textarea-wrapper {
  position: relative;
  min-height: auto;
  height: auto;
  display: flex;
  flex-direction: column;
  animation: fadeInRight 0.15s ease-out 0.15s both;
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  // 添加 .editor-section 基础样式
  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  // 移除默认的 width: 100%，让父容器通过 CSS :has() 选择器控制宽度
  .codemirror {
    border-radius: 8px;
    flex: 1;
    min-height: calc(100vh - 340px);
    display: flex;
    flex-direction: column;
    overflow: auto;

    // 设置 CodeMirror 编辑器的背景色，确保空行也有背景色
    :deep(.CodeMirror) {
      background: var(--el-bg-color-page, #ffffff);
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;

      .CodeMirror-scroll {
        background: var(--el-bg-color-page, #ffffff);
        flex: 1;
        overflow-x: auto;
        overflow-y: auto;
      }

      .CodeMirror-gutters {
        background: var(--el-bg-color-page, #ffffff);
        border-right: 1px solid var(--el-border-color, #e4e7ed);
      }

      .CodeMirror-lines {
        // 确保所有行都有背景色
        background: var(--el-bg-color-page, #ffffff);
      }

      .CodeMirror-code {
        background: var(--el-bg-color-page, #ffffff);
      }
    }
  }
}

.char-count-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px;
  margin-top: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  animation: fadeInRight 0.4s ease-out 0.35s both;

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .char-count-info {
    display: flex;
    gap: 16px;

    strong {
      color: rgba(0, 0, 0, 0.88);
      font-weight: 500;
      min-width: 30px;
      display: inline-block;
      text-align: right;
    }
  }
}

.selected-info {
  margin-left: 8px;
}

/* 深色主题下的字符数统计栏样式 */
.dark .char-count-bar {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .char-count-info {
    strong {
      color: rgba(255, 255, 255, 0.88);
    }
  }
}

/* 深色主题下的 CodeMirror 编辑器样式 */
.dark .textarea-wrapper {
  .codemirror {
    :deep(.CodeMirror) {
      background: var(--el-bg-color-page, #1a1a1a);

      .CodeMirror-scroll {
        background: var(--el-bg-color-page, #1a1a1a);
      }

      .CodeMirror-gutters {
        background: var(--el-bg-color-page, #1a1a1a);
        border-right-color: var(--el-border-color, #333);
      }

      .CodeMirror-lines {
        background: var(--el-bg-color-page, #1a1a1a);
      }

      .CodeMirror-code {
        background: var(--el-bg-color-page, #1a1a1a);
      }
    }
  }
}
.button-group {
  position: absolute;
  justify-content: space-between;
  top: 5px;
  right: 1vw;
}

/* 分屏预览样式 */
.textarea-wrapper.has-preview {
  flex-direction: row;
  height: 100%;
  min-height: calc(100vh - 340px);

  .editor-section.with-preview {
    flex: 0 0 50%;
    max-width: 50%;
    min-height: 0;
    border-right: 1px solid var(--el-border-color-lighter);
  }
}

// 深色模式下的分屏样式
[data-theme="dark"] {
  .textarea-wrapper.has-preview {
    .editor-section.with-preview {
      border-right-color: var(--el-border-color);
    }
  }
}
</style>
