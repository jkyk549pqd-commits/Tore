<!--
  * 轻量级 JSON 编辑器组件
  * 用于历史日志的 JSON 内容展示和编辑
  * 支持主题自适应切换、格式化、压缩、复制等功能
-->
<template>
  <div class="json-editor-lite">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <el-button-group class="el-button-group">
        <el-tooltip
          :content="t('history.editor.format')"
          placement="top"
          effect="light"
          v-if="localValueType === 'JSON'"
          :disabled="!showTooltips"
        >
          <el-button @click="format" size="small" :icon="ZoomInOutlined">
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="t('history.editor.compress')"
          placement="top"
          effect="light"
          v-if="localValueType === 'JSON'"
          :disabled="!showTooltips"
        >
          <el-button @click="compress" size="small" :icon="ZoomOutOutlined">
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="t('history.editor.copy')"
          placement="top"
          effect="light"
          :disabled="!showTooltips"
        >
          <el-button @click="copy" size="small" :icon="CopyDocument">
          </el-button>
        </el-tooltip>
      </el-button-group>

      <div class="editor-info">
        <span class="result-type">{{ localValueType }}</span>
        <span class="char-count"
          >{{ t("history.editor.characters") }}:
          <strong>{{ charCount }}</strong></span
        >
      </div>
    </div>

    <!-- CodeMirror 编辑器 -->
    <div class="codemirror-wrapper">
      <Codemirror
        class="codemirror"
        v-model:value="localValue"
        :options="cmOptions"
        @ready="handleReady"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "/@/store/modules/theme";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import Codemirror from "codemirror-editor-vue3";
import { Document, CopyDocument } from "@element-plus/icons-vue";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons-vue";
import { ElMessage } from "element-plus";

// CodeMirror 核心样式
import "codemirror/lib/codemirror.css";
// YAML 模式
import "codemirror/mode/yaml/yaml.js";
// XML 模式
import "codemirror/mode/xml/xml.js";
// TOML 模式
import "codemirror/mode/toml/toml.js";
// Properties 模式
import "codemirror/mode/properties/properties.js";
// Shell 模式
import "codemirror/mode/shell/shell.js";
// Dockerfile 模式
import "codemirror/mode/dockerfile/dockerfile.js";
import "codemirror/mode/sql/sql.js";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/mode/properties/properties.js";
// 编程语言模式导入
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/clike/clike.js"; // Java, C, C++ 等
import "codemirror/mode/go/go.js";
// JSON 语法检查
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/json-lint.js";
import "codemirror/addon/hint/sql-hint";
import jsonlintMod from "jsonlint-mod";
// 代码折叠
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/indent-fold.js";
// 括号匹配
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/edit/closebrackets.js";
// 自动关闭标签
import "codemirror/addon/edit/closetag.js";
import "codemirror/addon/fold/xml-fold.js";
// CodeMirror 主题 - 预加载常用主题
import "codemirror/theme/dracula.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/material.css";
import "codemirror/theme/base16-dark.css";
import "codemirror/theme/eclipse.css";

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  modelType: {
    type: String,
    default: "json",
  },
  autoFormat: {
    type: Boolean,
    default: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change", "ready"]);

// 国际化
const { t } = useI18n();

// 主题状态管理
const themeStore = useThemeStore();
const appConfigStore = useAppConfigStore();

// 本地值
const localValue = ref(props.modelValue);
// 本地类型
const localValueType = ref(props.modelType);

// 是否为深色模式
const isDark = computed(() => themeStore.isDark);

// 是否显示工具提示
const showTooltips = computed(() => appConfigStore.showTooltipsFlag);

// 字符数统计
const charCount = computed(() => localValue.value?.length || 0);

// CodeMirror 实例
const cmInstance = ref(null);

// 已加载的主题缓存
const loadedThemes = new Set();

// 配置 jsonlint 为 CodeMirror 的全局 JSON 验证器
if (typeof window !== "undefined") {
  const jsonlint = jsonlintMod.default || jsonlintMod;
  window.jsonlint = jsonlint;
}

/**
 * 获取适合当前主题模式的 CodeMirror 主题
 */
function getThemeForCurrentMode() {
  // 深色模式推荐主题（已预加载）
  const darkThemes = ["dracula", "monokai", "material", "base16-dark"];
  // 浅色模式推荐主题（已预加载）
  const lightThemes = ["eclipse", "default"];

  if (isDark.value) {
    return darkThemes[0]; // 默认使用 dracula
  } else {
    return lightThemes[0]; // 默认使用 eclipse
  }
}

/**
 * 根据类型值转换为 MIME 类型
 */
function getMimeTypeByType(type) {
  const typeMap = {
    json: "application/json",
    javascript: "application/javascript",
    js: "application/javascript",
    yaml: "text/yaml",
    yml: "text/yaml",
    xml: "text/xml",
    toml: "text/x-toml",
    properties: "text/x-properties",
    conf: "text/x-properties",
    shell: "text/x-sh",
    sh: "text/x-sh",
    bash: "text/x-sh",
    dockerfile: "text/x-dockerfile",
    docker: "text/x-dockerfile",
    text: "text/plain",
    plain: "text/plain",
    sql: "text/x-sql",
    md: "text/x-markdown",
    markdown: "text/x-markdown",
    python: "text/x-python",
    py: "text/x-python",
    go: "text/x-go",
    java: "text/x-java",
    c: "text/x-csrc",
    cpp: "text/x-c++src",
    "c++": "text/x-c++src",
    cxx: "text/x-c++src",
  };

  return typeMap[type.toLowerCase()] || "text/plain";
}

/**
 * 判断当前类型是否为 JSON 类型
 */
function isJsonType(type) {
  return type.toLowerCase() === "json";
}

// CodeMirror 配置选项
const cmOptions = computed(() => {
  const mimeType = getMimeTypeByType(localValueType.value);
  const shouldEnableLint = isJsonType(localValueType.value);

  return {
    mode: mimeType,
    theme: getThemeForCurrentMode(),
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: shouldEnableLint
      ? [
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter",
          "CodeMirror-lint-markers",
        ]
      : ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    matchBrackets: true,
    autoCloseBrackets: true,
    tabSize: 4, // 与 json-editor-panel 保持一致
    indentUnit: 4, // 与 json-editor-panel 保持一致
    readOnly: props.readOnly,
    lint: shouldEnableLint,
    scrollbarStyle: "native",
    viewportMargin: Infinity, // 与 json-editor-panel 保持一致（使用默认值）
  };
});

/**
 * 初始化主题
 */
async function initializeTheme() {
  const theme = getThemeForCurrentMode();
  await loadTheme(theme);
}

/**
 * 格式化 JSON
 */
function format() {
  if (!localValue.value) {
    return;
  }

  try {
    const parsed = JSON.parse(localValue.value);
    localValue.value = JSON.stringify(parsed, null, 2);
    emitChange();

    // 格式化后强制刷新 CodeMirror 实例，确保高度正确计算
    nextTick(() => {
      if (cmInstance.value) {
        cmInstance.value.refresh();
        // 延迟再次刷新，确保 DOM 完全更新
        setTimeout(() => {
          cmInstance.value.refresh();
        }, 50);
      }
    });
  } catch (error) {
    ElMessage.error(t("history.editor.invalidJsonFormat"));
    console.error("JSON 格式化失败:", error);
  }
}

/**
 * 压缩 JSON
 */
function compress() {
  if (!localValue.value) {
    return;
  }

  try {
    const parsed = JSON.parse(localValue.value);
    localValue.value = JSON.stringify(parsed);
    emitChange();

    // 压缩后强制刷新 CodeMirror 实例，确保高度正确计算
    nextTick(() => {
      if (cmInstance.value) {
        cmInstance.value.refresh();
        // 延迟再次刷新，确保 DOM 完全更新
        setTimeout(() => {
          cmInstance.value.refresh();
        }, 50);
      }
    });
  } catch (error) {
    ElMessage.error(t("history.editor.invalidJsonFormat"));
    console.error("JSON 压缩失败:", error);
  }
}

/**
 * 复制 JSON 到剪贴板
 */
async function copy() {
  if (!localValue.value) {
    ElMessage.warning(t("history.editor.noContent"));
    return;
  }

  try {
    await navigator.clipboard.writeText(localValue.value);
    ElMessage.success(t("history.editor.copySuccess"));
  } catch (error) {
    // 回退方案：使用传统的复制方法
    try {
      const textarea = document.createElement("textarea");
      textarea.value = localValue.value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      ElMessage.success(t("history.editor.copySuccess"));
    } catch (fallbackError) {
      ElMessage.error(t("history.editor.copyFailed"));
      console.error("复制失败:", fallbackError);
    }
  }
}

/**
 * 触发值变化事件
 */
function emitChange() {
  emit("update:modelValue", localValue.value);
  emit("change", localValue.value);
}

/**
 * 处理编辑器准备就绪
 */
function handleReady(instance) {
  cmInstance.value = instance;

  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    // 多重刷新确保正确计算高度
    // instance.refresh();

    // 延迟再次刷新，确保所有样式都应用完毕
    // setTimeout(() => {
    //   instance.refresh();
    // }, 50);

    // 直接操作 DOM 确保行高正确应用
    const wrapper = instance.getWrapperElement();
    if (wrapper) {
      const preElements = wrapper.querySelectorAll(".CodeMirror pre");
      preElements.forEach((pre) => {
        pre.style.lineHeight = "21px";
        pre.style.height = "21px";
      });

      const lineNumbers = wrapper.querySelectorAll(".CodeMirror-linenumber");
      lineNumbers.forEach((linenum) => {
        linenum.style.lineHeight = "21px";
        linenum.style.height = "21px";
      });
    }

    // 动态控制 lint 状态（仅在 JSON 类型时启用）
    instance.on("change", function (cm) {
      const text = cm.getValue();
      const isJson = isJsonType(localValueType.value);

      if (!text || text.trim() === "") {
        cm.setOption("lint", false);
      } else {
        cm.setOption("lint", isJson);
      }

      // 每次内容变化后重新应用行高
      const wrapper = cm.getWrapperElement();
      if (wrapper) {
        const preElements = wrapper.querySelectorAll(".CodeMirror pre");
        preElements.forEach((pre) => {
          pre.style.lineHeight = "21px";
          pre.style.height = "21px";
        });

        const lineNumbers = wrapper.querySelectorAll(".CodeMirror-linenumber");
        lineNumbers.forEach((linenum) => {
          linenum.style.lineHeight = "21px";
          linenum.style.height = "21px";
        });
      }
    });

    // 初始检查 - 空内容或非JSON类型时禁用 lint
    const initialText = instance.getValue();
    const isJson = isJsonType(localValueType.value);
    if (!initialText || initialText.trim() === "" || !isJson) {
      instance.setOption("lint", false);
    }

    // 自动格式化（仅在 JSON 类型时）
    if (
      props.autoFormat &&
      localValue.value &&
      isJsonType(localValueType.value)
    ) {
      // console.log("localValueType:", localValueType.value);
      format();
    }
  });

  // 触发准备就绪事件
  emit("ready", instance);
}

/**
 * 处理编辑器内容变化
 */
function handleChange(newValue) {
  localValue.value = newValue;
  emitChange();
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localValue.value) {
      localValue.value = newValue;
    }
  }
);

// 监听外部类型变化
watch(
  () => props.modelType,
  (newType) => {
    if (newType !== localValueType.value) {
      localValueType.value = newType;
    }
  }
);

// 监听主题变化，自动切换 CodeMirror 主题
watch(isDark, () => {
  const theme = getThemeForCurrentMode();

  // 更新编辑器主题
  if (cmInstance.value) {
    cmInstance.value.setOption("theme", theme);
  }
});

// 监听 localValueType 变化，动态更新 CodeMirror 配置
watch(localValueType, (newType, oldType) => {
  if (cmInstance.value && newType !== oldType) {
    const mimeType = getMimeTypeByType(newType);
    const shouldEnableLint = isJsonType(newType);

    // 更新编辑器模式
    cmInstance.value.setOption("mode", mimeType);

    // 更新 lint 状态
    cmInstance.value.setOption("lint", shouldEnableLint);

    // 更新 gutters 配置
    const newGutters = shouldEnableLint
      ? [
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter",
          "CodeMirror-lint-markers",
        ]
      : ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];
    cmInstance.value.setOption("gutters", newGutters);

    // 刷新编辑器以应用新配置
    cmInstance.value.refresh();
  }
});

// 组件挂载时无需特殊初始化，主题已预加载
onMounted(() => {
  // 主题已通过静态导入预加载，无需额外操作

  // 确保编辑器正确初始化高度
  nextTick(() => {
    if (cmInstance.value) {
      // 延迟刷新，确保 DOM 完全渲染
      setTimeout(() => {
        cmInstance.value.refresh();
      }, 100);
    }
  });
});

// 组件卸载时清理
onUnmounted(() => {
  cmInstance.value = null;
});
</script>

<style lang="less" scoped>
.json-editor-lite {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-bottom: none;
    border-radius: 4px 4px 0 0;

    .el-button-group {
      .el-button {
        margin-right: 4px;
        border-radius: 16px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .editor-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: var(--el-text-color-regular);

      .el-tag {
        border-radius: 12px;
      }

      .result-type {
        display: inline-block;
        font-weight: 600;
        color: var(--el-color-primary);
        font-size: 14px;
        line-height: 1.5;
        padding: 2px 8px;
        border-radius: 16px;
        background-color: rgba(var(--el-color-primary-rgb), 0.1);
      }

      .char-count {
        color: var(--el-text-color-secondary);

        strong {
          color: var(--el-color-primary);
          margin-left: 4px;
        }
      }
    }
  }

  .codemirror-wrapper {
    flex: 1;
    min-height: 400px; // 确保编辑器容器有最小高度
    border: 1px solid var(--el-border-color);
    border-radius: 0 0 4px 4px;
    overflow: hidden;
    display: flex; // 使用 flex 布局
    flex-direction: column; // 垂直方向排列

    :deep(.codemirror) {
      flex: 1;
      overflow: auto;
      font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
      font-size: 14px;

      .CodeMirror {
        height: auto;
        min-height: 100%;
        font-family: inherit;
        font-size: 14px;
        line-height: 21px;

        .CodeMirror-scroll {
          min-height: 100%;
        }

        .CodeMirror-lines {
          padding: 0 !important;
        }

        .CodeMirror pre {
          padding: 0 4px !important;
          margin: 0 !important;
          font-size: 14px !important;
          line-height: 21px !important;
        }

        .CodeMirror-linenumber {
          color: var(--el-text-color-placeholder);
          padding: 0 8px;
          font-size: 14px !important;
          line-height: 21px !important;
        }

        .CodeMirror-gutters {
          background: var(--el-bg-color-page);
          border-right: 1px solid var(--el-border-color);
        }

        .CodeMirror-foldgutter {
          width: 16px;
        }

        .CodeMirror-activeline-background {
          background: var(--el-fill-color-light);
        }

        .CodeMirror-selected {
          background: var(--el-color-primary-light-9) !important;
        }

        .CodeMirror-cursor {
          border-left: 2px solid var(--el-color-primary);
        }

        .CodeMirror-matchingbracket {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
          font-weight: bold;
        }

        // JSON 语法高亮颜色
        .cm-keyword {
          color: var(--el-color-primary);
          font-weight: bold;
        }

        .cm-string {
          color: var(--el-color-success);
        }

        .cm-number {
          color: var(--el-color-warning);
        }

        .cm-atom {
          color: var(--el-color-danger);
        }

        .cm-property {
          color: var(--el-color-info);
        }

        .cm-variable {
          color: var(--el-text-color-primary);
        }

        .cm-variable-2 {
          color: var(--el-text-color-regular);
        }

        .cm-def {
          color: var(--el-color-primary);
        }

        .cm-operator {
          color: var(--el-text-color-primary);
        }

        .cm-comment {
          color: var(--el-text-color-placeholder);
          font-style: italic;
        }

        // Lint 错误样式
        .CodeMirror-lint-marker-error,
        .CodeMirror-lint-marker-warning {
          background-image: none;
          width: 12px;
          // height: 12px;
        }

        .CodeMirror-lint-marker-error {
          background-color: var(--el-color-danger);
          border-radius: 50%;
        }

        .CodeMirror-lint-marker-warning {
          background-color: var(--el-color-warning);
          border-radius: 50%;
        }
      }
    }
  }
}

// 深色模式适配
[data-theme="dark"] {
  .json-editor-lite {
    .editor-toolbar {
      background: var(--el-bg-color-page);
      border-color: var(--el-border-color);
    }

    .codemirror-wrapper {
      :deep(.codemirror) {
        .CodeMirror {
          .CodeMirror-gutters {
            background: #1e1e1e;
            border-right-color: #333;
          }

          .CodeMirror-linenumber {
            color: #858585;
          }

          .CodeMirror-activeline-background {
            background: rgba(255, 255, 255, 0.05);
          }

          .CodeMirror-selected {
            background: rgba(64, 158, 255, 0.3) !important;
          }

          .CodeMirror-cursor {
            border-left-color: #64b5f6;
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .json-editor-lite {
    .editor-toolbar {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;

      .editor-info {
        width: 100%;
        justify-content: space-between;
      }
    }

    .codemirror-wrapper {
      :deep(.codemirror) {
        height: 300px;
        font-size: 12px; // 移动端使用较小字体
      }
    }
  }
}
</style>
