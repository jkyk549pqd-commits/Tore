<template>
  <div
    :id="editorId"
    class="textarea-wrapper"
    :class="{ 'compare-json': isCompare }"
  >
    <Codemirror
      class="codemirror"
      v-model:value="localValue"
      :options="cmOptions"
      border
      placeholder="test placeholder"
      :style="{ fontSize: fontSize + 'px' }"
      @ready="handleReady"
    />

    <!-- 字符数统计显示 -->
    <div class="char-count-bar">
      <span class="char-count-info">
        {{ t("json.editor.characters") }}: <strong>{{ charCount }}</strong>
        {{ t("json.editor.lines") }}: <strong>{{ lineCount }}</strong>
        <span class="selected-info">
          | {{ t("json.editor.selected") }}:
          <strong>{{ selectedCharCount }}</strong>
        </span>
      </span>
    </div>

    <!-- 导入弹框 -->
    <JsonImportDialog
      v-model:visible="importDialogVisible"
      :t="t"
      @file-selected="handleFileSelected"
      @close="handleCloseImportDialog"
    />

    <!-- 按钮组 -->
    <JsonEditorButtons
      :sorted-buttons="sortedButtons"
      :button-definitions="buttonDefinitions"
      :button-states="buttonStates"
      :show-tooltips="showTooltips"
      :show-demo="showDemo"
      :t="t"
      @button-click="handleButtonClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import Codemirror from "codemirror-editor-vue3";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/json-lint.js";
import jsonlintMod from "jsonlint-mod";
import "codemirror/mode/sql/sql.js";
// 代码折叠相关导入
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import { GenRandomJson } from "./utils";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { ElMessage } from "element-plus";
// 导入自定义 Composables
import { useJsonEditorOperations } from "../composables/useJsonEditorOperations";
import { useClipboardActions } from "../composables/useClipboardActions";
import { useFileImportExport } from "../composables/useFileImportExport";
import { useEditorButtons } from "../composables/useEditorButtons";
import { useCodeMirrorThemes } from "../composables/useCodeMirrorThemes";
// 导入子组件
import JsonEditorButtons from "./json-editor-buttons.vue";
import JsonImportDialog from "./json-import-dialog.vue";

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
  isCompare: {
    type: Boolean,
    default: false,
  },
  cmOptions: {
    type: Object,
    required: true,
  },
  fontSize: {
    type: Number,
    default: 14,
  },
  showDemo: {
    type: Boolean,
    default: false,
  },
});

// 配置 jsonlint 为 CodeMirror 的全局 JSON 验证器
if (typeof window !== "undefined") {
  const jsonlint = jsonlintMod.default || jsonlintMod;
  window.jsonlint = jsonlint;
}

// Emits
const emit = defineEmits(["update:modelValue", "ready"]);

// 本地值，用于双向绑定
const localValue = ref(props.modelValue);

// 保存 CodeMirror 实例的引用
const cmInstanceRef = ref(null);
// 获取 i18n 实例
const { t } = useI18n();

// 字符数和行数统计
const charCount = computed(() => localValue.value.length);
const lineCount = ref(0);
// 选中字符统计
const selectedCharCount = ref(0);
const selectedLineCount = ref(0);
// 从 appConfigStore 获取 tooltip 显示配置
const appConfigStore = useAppConfigStore();
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// 使用主题管理 Composable
const { loadTheme } = useCodeMirrorThemes();

// 使用自定义 Composables
const {
  buttonStates: jsonOperationStates,
  handleFormat,
  handleCompress,
  handleSort,
  handleAddEscape,
  handleRemoveEscape,
} = useJsonEditorOperations({ emit, t, localValue });

const {
  buttonStates: clipboardStates,
  handleCopy,
  handlePaste,
  handleClear,
} = useClipboardActions({ emit, t, localValue });

const {
  importDialogVisible,
  handleImport,
  handleExport,
  handleCloseImportDialog,
  processFile,
} = useFileImportExport({ emit, t, localValue });

const { buttonDefinitions, sortedButtons } = useEditorButtons({
  props,
  appConfigStore,
});

// 合并按钮状态
const buttonStates = computed(() => ({
  ...jsonOperationStates.value,
  ...clipboardStates.value,
}));

// 生成随机 JSON
function handleGenerateRandom() {
  try {
    emit("update:modelValue", GenRandomJson());
    clipboardStates.value.delete = !clipboardStates.value.delete;
  } catch (error) {
    ElMessage.error(t("json.editor.generateRandomJsonFailed"));
  }
}

// 配置按钮处理函数映射
const buttonHandlers = {
  import: handleImport,
  export: handleExport,
  copy: handleCopy,
  paste: handlePaste,
  demo: handleGenerateRandom,
  clear: handleClear,
  format: handleFormat,
  compress: handleCompress,
  sort: handleSort,
  addEscape: handleAddEscape,
  removeEscape: handleRemoveEscape,
};

// 更新 buttonDefinitions 中的 handler
Object.keys(buttonHandlers).forEach((key) => {
  if (buttonDefinitions[key]) {
    buttonDefinitions[key].handler = buttonHandlers[key];
  }
});

// 监听 props.modelValue 变化，同步到本地值
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  }
);

// 监听本地值变化，同步到父组件
watch(localValue, (newValue) => {
  emit("update:modelValue", newValue);
});

// 监听 cmOptions 变化，动态更新 CodeMirror 配置
watch(
  () => props.cmOptions,
  async (newOptions, oldOptions) => {
    if (cmInstanceRef.value && newOptions !== oldOptions) {
      // 主题变化时，先加载主题 CSS
      if (newOptions.theme !== oldOptions?.theme && newOptions.theme) {
        try {
          await loadTheme(newOptions.theme);
          cmInstanceRef.value.setOption("theme", newOptions.theme);
        } catch (error) {
          console.error("加载主题失败:", error);
        }
      }
      if (newOptions.lineNumbers !== oldOptions?.lineNumbers) {
        cmInstanceRef.value.setOption("lineNumbers", newOptions.lineNumbers);
      }
      if (newOptions.lineWrapping !== oldOptions?.lineWrapping) {
        cmInstanceRef.value.setOption("lineWrapping", newOptions.lineWrapping);
      }
      if (newOptions.readOnly !== oldOptions?.readOnly) {
        cmInstanceRef.value.setOption("readOnly", newOptions.readOnly);
      }
    }
  },
  { deep: true }
);

// 处理文件选择事件（来自 JsonImportDialog）
function handleFileSelected(file) {
  processFile(file);
}

// 处理按钮点击事件（来自 JsonEditorButtons）
function handleButtonClick(buttonId) {
  const handler = buttonHandlers[buttonId];
  if (handler) {
    handler();
  }
}

// 处理编辑器就绪
async function handleReady(cm) {
  cmInstanceRef.value = cm;

  // 初始化行数
  lineCount.value = cm.lineCount();

  // 加载初始主题
  if (props.cmOptions.theme) {
    try {
      await loadTheme(props.cmOptions.theme);
    } catch (error) {
      console.error("加载初始主题失败:", error);
    }
  }

  cm.on("change", function (cm) {
    const text = cm.getValue();

    // 更新行数
    lineCount.value = cm.lineCount();

    if (!text || text.trim() === "") {
      cm.setOption("lint", false);
    } else {
      cm.setOption("lint", true);
    }
  });

  // 使用 requestAnimationFrame 优化 cursorActivity 事件处理，避免滚动时卡顿
  let rafId = null;

  // 监听选择变化，更新选中字符统计
  cm.on("cursorActivity", function (cm) {
    // 如果已有 RAF 在进行中，跳过当前事件
    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      const selectedText = cm.getSelection();
      selectedCharCount.value = selectedText.length;

      // 计算选中行数
      if (
        selectedText &&
        cm.somethingSelected() &&
        cm.sels &&
        cm.sels.length > 0
      ) {
        const selection = cm.sels[0];
        const fromLine = selection.from().line;
        const toLine = selection.to().line;
        selectedLineCount.value = toLine - fromLine + 1;
      } else {
        selectedLineCount.value = 0;
      }

      rafId = null;
    });
  });

  const initialText = cm.getValue();
  if (!initialText || initialText.trim() === "") {
    cm.setOption("lint", false);
  }

  emit("ready", cm);
}
</script>

<style lang="less" scoped>
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
  // 移除默认的 width: 100%，让父容器通过 CSS :has() 选择器控制宽度
  // 保留 compare-json 类，但不使用 flex: 1，而是让父容器控制宽度
  .codemirror {
    border-radius: 8px;
    min-height: calc(100vh - 340px);
    height: auto;
    flex: 1;
    overflow: auto;
  }
}

/* 字符数统计栏样式 */
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

/* 按钮组样式 - 由 JsonEditorButtons 组件管理 */
.button-group {
  position: absolute;
  justify-content: space-between;
  top: 5px;
  right: 1vw;
}
</style>
