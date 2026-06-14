<template>
  <div>
    <div id="text-editor-container" class="text-editor-container">
      <!-- 页面头部 -->
      <PageHeader
        :is-pinned="isHeaderPinned"
        :is-saved="isSaved"
        :is-saving="isSaving"
        :selected-format="selectedFormat"
        :show-preview="showPreview"
        :show-config="showCodemirrorConf"
        :show-diff-view="showSecondEditor"
        @toggle-pin="togglePin"
        @save="handleManualSave"
        @format-change="handleFormatChange"
        @toggle-preview="togglePreview"
        @toggle-config="toggleConfig"
        @toggle-diff="toggleDiff"
      />

      <!-- CodeMirror 配置面板 -->
      <transition name="cmConf-fade">
        <EditorConfigPanel
          v-if="showCodemirrorConf"
          :cm-theme="cmTheme"
          :cm-font-size="cmFontSize"
          :cm-line-wrapping="cmLineWrapping"
          :cm-line-numbers="cmLineNumbers"
          :cm-read-only="cmReadOnly"
          :show-read-only="false"
          :show-demo-button="false"
          :theme-options="cmThemeOptions"
          @update:cm-theme="cmTheme = $event"
          @update:cm-font-size="cmFontSize = $event"
          @update:cm-line-wrapping="cmLineWrapping = $event"
          @update:cm-line-numbers="cmLineNumbers = $event"
          @update:cm-read-only="cmReadOnly = $event"
        />
      </transition>

      <!-- 编辑器区域 -->
      <div class="page-content">
        <!-- 主编辑器 -->
        <TextEditorPanel
          editor-id="textEditor"
          v-model="textContent"
          :cm-options="cmOptions"
          :font-size="cmFontSize"
          :current-file-format="selectedFormat"
          :show-preview="showPreview"
          @ready="onReady"
        />
        <!-- 对比编辑器 -->
        <TextEditorPanel
          v-if="showSecondEditor"
          editor-id="textEditorCompare"
          v-model="textContent2"
          :cm-options="cmOptions"
          :font-size="cmFontSize"
          :current-file-format="selectedFormat"
          :show-preview="false"
          @ready="onReady"
        />
      </div>
    </div>

    <!-- 比较操作按钮 -->
    <CompareActionBar :visible="showSecondEditor" @compare="compareText" />
    <!-- 返回顶部按钮 -->
    <el-backtop
      target="#smartAdminLayoutContent"
      :visibility-height="120"
      :right="50"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onActivated,
  onBeforeUnmount,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import TextEditorPanel from "./components/text-editor-panel.vue";
import PageHeader from "./components/page-header.vue";
import EditorConfigPanel from "../json/components/editor-config-panel.vue";
import CompareActionBar from "../json/components/compare-action-bar.vue";
import { TextCompare } from "./text-operations";
import { useCodeMirrorConfig } from "./composables/useCodeMirrorConfig";
import { useFileFormat } from "./composables/useFileFormat";
import { useFormatLint } from "./composables/useFormatLint";
import { useRouteSync } from "./composables/useRouteSync";
import { useStatePersistence } from "./composables/useStatePersistence";
import { localRead, localRemove } from "/@/utils/local-util";
import { useI18n } from "vue-i18n";
import { useUserStore } from "/@/store/modules/system/user";
import { socketClient } from "/@/utils/socket-client";
import { AutoSaveManager } from "../json/json-operations";
import { useRecentRecords } from "/@/views/system/home/composables/useRecentRecords";
import { useAutoSaveGeneric } from "../json/composables/useAutoSaveGeneric";
import { getInstanceIdFromQuery } from "/@/utils/instance-state-manager";

// 路由相关
const router = useRouter();
const route = useRoute();

// 国际化
const { t } = useI18n();

// 获取 store 实例
const userStore = useUserStore();

// 标志位:控制 watch 是否保存状态
// 在 onActivated 恢复状态期间,禁用 watch 避免状态被覆盖
const isRestoringState = ref(false);
const { addRecord } = useRecentRecords();
const {
  instanceId,
  stateKey,
  initializeRouteState,
  handleQueryChange,
  handleActivation,
} = useRouteSync({ route, isRestoringState });

// 使用 Composables
const {
  cmTheme,
  cmThemeOptions,
  cmFontSize,
  cmLineWrapping,
  cmLineNumbers,
  cmReadOnly,
  cmOptions,
  currentFileFormat,
  updateFileFormat,
  initializeTheme,
  initializeEditorConfig,
} = useCodeMirrorConfig();

const {
  selectedFormat,
  formatOptions,
  currentFormatConfig,
  initializeFormat,
  switchFormat,
  autoDetectFormat,
} = useFileFormat(stateKey);

const { registerLintFunctions } = useFormatLint();

// 防止路由信息未加载时的错误
const routeName = computed(() => route.value?.name || "textEditor");

// 本地状态
const textContent = ref("");
const textContent2 = ref(""); // 第二个编辑器内容（不持久化）
const showSecondEditor = ref(false); // 控制第二个编辑器显示
const isHeaderPinned = ref(false);
const cmInstance = ref(null);
const isSaving = ref(false);
const showPreview = ref(false);
const showCodemirrorConf = ref(false);

// 当前编辑器关联的日志ID，用于版本追加
const currentLogId = ref(null);

// 使用状态持久化（需要在 textContent 定义之后）
const { applyState } = useStatePersistence({
  textContent,
  showCodemirrorConf,
  isRestoringState,
  stateKey,
});

// 编辑检测机制：跟踪初始内容和用户编辑
const initialContent = ref("");
const hasUserEdited = ref(false);

// 编辑器就绪状态标志
const editorReady = ref(false);

// 使用通用自动保存（需要在状态管理之后）
const {
  startAutoSaveTimer,
  currentLogId: autoSaveLogId,
  restoreLogId,
  persistLogId,
} = useAutoSaveGeneric({
  content: textContent,
  contentType: "TEXT",
  routeName,
  instanceId,
  stateKey,
  textType: currentFileFormat,
});

// 同步 logId（保持与现有代码的兼容性）
watch(currentFileFormat, (newFormat) => {
  // 当文件格式变化时，更新自动保存的 textType
  // useAutoSaveGeneric 会自动读取 currentFileFormat 的最新值
});

// 确保 currentLogId 与自动保存的 logId 保持同步
watch(autoSaveLogId, (newLogId) => {
  if (newLogId && newLogId !== currentLogId.value) {
    currentLogId.value = newLogId;
  }
});

/**
 * CodeMirror 编辑器就绪回调
 */
function onReady(cm) {
  cmInstance.value = cm;
  // 设置编辑器就绪状态
  editorReady.value = true;

  // 初始化 Lint 函数
  registerLintFunctions();
}

/**
 * 处理格式变化
 */
function handleFormatChange(newFormat) {
  // 切换格式
  switchFormat(newFormat);

  // 更新 CodeMirror 配置
  updateFileFormat(newFormat);

  // 重新初始化编辑器（如果需要）
  if (cmInstance.value) {
    nextTick(() => {
      // 强制刷新编辑器
      cmInstance.value.setOption("mode", currentFormatConfig.value.mode);
      cmInstance.value.refresh();
    });
  }
}

/**
 * 切换固定头部
 */
function togglePin() {
  isHeaderPinned.value = !isHeaderPinned.value;
}

/**
 * 切换预览显示
 */
function togglePreview() {
  showPreview.value = !showPreview.value;
}

/**
 * 切换配置面板显示
 */
function toggleConfig() {
  showCodemirrorConf.value = !showCodemirrorConf.value;
}

/**
 * 切换第二个编辑器显示
 */
function toggleDiff() {
  showSecondEditor.value = !showSecondEditor.value;
}

/**
 * 执行文本对比
 */
function compareText() {
  try {
    if (
      TextCompare.prepareCompareData(
        textContent.value,
        textContent2.value,
        selectedFormat.value
      )
    ) {
      router.push("/jsonDiff");
    } else {
      ElMessage.warning(t("textEditor.diffEmptyWarning"));
    }
  } catch (error) {
    console.error("对比失败:", error);
    ElMessage.error(t("textEditor.diffFailed"));
  }
}

/**
 * 计算属性：判断当前内容是否已保存
 */
const isSaved = computed(() => {
  const currentState = userStore.getInstanceState(stateKey.value) || {};
  // 只有在用户实际编辑过内容时，才显示未保存状态
  // 如果 hasUserEdited 为 false，即使内容有变化也视为已保存
  if (!hasUserEdited.value) {
    return true; // 用户未编辑，视为已保存
  }
  return currentState.isContentSaved !== false;
});

/**
 * 更新保存状态
 * @param {boolean} saved - 是否已保存
 */
function updateSaveState(saved) {
  const currentState = userStore.getInstanceState(stateKey.value) || {};
  userStore.setInstanceState(stateKey.value, {
    ...currentState,
    isContentSaved: saved,
    selectedFileFormat: selectedFormat.value,
  });
}

/**
 * 监听内容变化，更新编辑状态
 */
watch(textContent, (newContent, oldContent) => {
  // 在恢复状态期间不监听内容变化
  if (isRestoringState.value) {
    return;
  }

  // 只有在编辑器就绪后才监听变化
  if (!editorReady.value) {
    return;
  }

  // 初始化时记录初始内容
  if (initialContent.value === "" && newContent !== "") {
    initialContent.value = ""; // 保持为空
    hasUserEdited.value = true;
    updateSaveState(false);
    return;
  }

  // 清空操作视为已保存（不需要保存空内容）
  if (!newContent || newContent.trim() === "") {
    hasUserEdited.value = false;
    updateSaveState(true);

    const currentState = userStore.getInstanceState(stateKey.value) || {};
    userStore.setInstanceState(stateKey.value, {
      ...currentState,
      textContent: "", // 保存空字符串
    });
    return;
  }

  // 检测用户是否真正编辑了内容
  // 只有当新值与初始值不同，且不是初始化阶段时，才标记为已编辑
  if (newContent !== initialContent.value) {
    hasUserEdited.value = true;
    // 用户编辑了内容，标记为未保存
    updateSaveState(false);
  } else {
    // 内容恢复到初始值，标记为已保存
    hasUserEdited.value = false;
    updateSaveState(true);
  }
});

/**
 * 监听路由查询变化(只更新 instanceId,不保存状态)
 */
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // 如果正在恢复状态,不处理
    if (isRestoringState.value) {
      return;
    }
    // 检查是否有临时数据 key
    if (newQuery._temp_key) {
      return;
    }
    // 如果当前 stateKey 前缀与 route.name 不匹配，说明发生了跨路由切换（非同一页面内 query 变化），跳过处理
    if (!stateKey.value.startsWith(`${route.name}_`)) {
      return;
    }
    // 如果新 query 的 instanceId 与当前组件的不匹配，说明发生了跨实例切换（如同路由的复制标签页），跳过处理
    if (getInstanceIdFromQuery(newQuery) !== instanceId.value) {
      return;
    }
    // 设置标志位，禁止状态保存 watch 在路由切换期间工作
    isRestoringState.value = true;

    // 先保存当前状态（使用当前 stateKey）
    // 这样可以确保在更新 stateKey 之前，当前状态已经正确保存
    const currentState = {
      textContent: textContent.value,
      selectedFileFormat: selectedFormat.value,
    };

    // 处理路由查询变化
    handleQueryChange({
      newQuery,
      oldQuery,
      currentState,
    });

    // 使用 nextTick 在下一个 tick 解除标志位
    // 确保路由切换完成后再允许状态保存 watch 工作
    nextTick(() => {
      isRestoringState.value = false;
    });
  },
  { deep: true }
);

/**
 * 从 tagNav 中获取 customName
 */
function getCustomNameFromTagNav(menuName, instanceId) {
  const tagNav = userStore.getTagNav || [];
  const tag = tagNav.find(
    (e) => e.menuName === menuName && e.instanceId === instanceId
  );
  return tag?.customName || null;
}

/**
 * 生成默认文件名
 * @returns {string} 文件名
 */
function generateFilename() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `text_${year}${month}${day}_${hour}${minute}${second}.${selectedFormat.value}`;
}

/**
 * 手动保存文本数据
 */
async function handleManualSave() {
  // 如果正在保存，直接返回
  if (isSaving.value) {
    return;
  }

  // 验证内容
  if (!textContent.value || textContent.value.trim() === "") {
    ElMessage.warning(t("textEditor.emptyContentWarning"));
    return;
  }

  isSaving.value = true;

  try {
    // 获取当前标签页的 customName
    const customName = getCustomNameFromTagNav(route.name, instanceId.value);

    const result = await AutoSaveManager.manualSaveTextData({
      fromPage: 1, // 来自菜单页
      textType: currentFileFormat.value.toUpperCase(),
      textStr: textContent.value,
      routeName: route.name,
      instanceId: instanceId.value,
      inOptType: "2",
      currentLogId: currentLogId.value,
      socketClient,
      message: ElMessage,
      customName: customName, // 传递自定义名称
      onSuccess: (time) => {
        updateSaveState(true);
        hasUserEdited.value = false;
      },
      onError: (error) => {
        ElMessage.error(t("json.editor.saveFailed"));
        console.error("手动保存失败:", error);
        updateSaveState(false);
      },
    });

    if (result.success) {
      updateSaveState(true);
      hasUserEdited.value = false;

      // 添加到最近记录
      addRecord({
        name: customName || generateFilename(),
        content: textContent.value,
        type: "Text",
        format: selectedFormat.value,
      });

      // 持久化 logId
      if (result.logId) {
        currentLogId.value = result.logId;
        const currentState = userStore.getInstanceState(stateKey.value) || {};
        userStore.setInstanceState(stateKey.value, {
          ...currentState,
          logId: result.logId,
        });
      }
    } else {
      updateSaveState(false);
      ElMessage.error(t("textEditor.saveFailed"));
    }
  } catch (error) {
    console.error("保存文本数据失败:", error);
    updateSaveState(false);
    ElMessage.error(t("textEditor.saveFailed"));
  } finally {
    isSaving.value = false;
  }
}

/**
 * 处理从首页最近记录打开的数据
 */
function handleTempKeyData() {
  const tempKey = route.query._temp_key;
  if (tempKey) {
    // 使用轮询机制等待编辑器就绪后再加载临时数据
    const loadTempData = () => {
      if (editorReady.value) {
        // 编辑器已就绪，开始加载临时数据
        try {
          const tempData = localRead(tempKey);
          if (tempData) {
            const parsed = JSON.parse(tempData);

            // 优先设置格式（在设置内容之前）
            if (parsed.format) {
              switchFormat(parsed.format);
              updateFileFormat(parsed.format);
            } else {
              autoDetectFormat(parsed.name || textContent.value);
            }

            // 设置文本内容
            textContent.value = parsed.content || "";
            // 清除临时数据
            localRemove(tempKey);

            // 更新编辑检测机制的状态
            if (textContent.value && textContent.value.trim() !== "") {
              initialContent.value = textContent.value;
              hasUserEdited.value = true;
              updateSaveState(false);
            }

            // 强制刷新编辑器以应用新的语法高亮
            if (cmInstance.value) {
              nextTick(() => {
                cmInstance.value.setOption(
                  "mode",
                  currentFormatConfig.value.mode
                );
                cmInstance.value.refresh();
              });
            }
          }
        } catch (error) {
          console.error("加载临时数据失败:", error);
        }
      } else {
        // 编辑器未就绪，继续等待
        setTimeout(loadTempData, 100);
      }
    };

    // 初始延迟 200ms 后开始检查编辑器状态
    setTimeout(loadTempData, 200);
  }
}

/**
 * 处理文件导入参数
 */
function handleImportParam() {
  if (route.query.import === "true") {
    // 使用轮询机制等待编辑器就绪后再加载导入数据
    const loadImportedData = () => {
      if (editorReady.value) {
        // 编辑器已就绪，开始加载数据
        const importedData = sessionStorage.getItem("importedFileData");
        if (importedData) {
          try {
            // 将数据设置到编辑器中
            textContent.value = importedData;
            // 清除 sessionStorage 中的临时数据
            sessionStorage.removeItem("importedFileData");
            // 显示成功消息
            // ElMessage.success(t("json.editor.importSuccess"));

            // 更新编辑检测机制的状态
            initialContent.value = importedData;
            hasUserEdited.value = false;
            updateSaveState(true);

            // 尝试自动检测格式
            if (route.query.format) {
              switchFormat(route.query.format);
              currentFileFormat.value = route.query.format;
            } else {
              autoDetectFormat(importedData);
            }
          } catch (error) {
            console.error("导入数据格式错误:", error);
            ElMessage.error(t("json.editor.invalidFormat"));
            // 清除无效数据
            sessionStorage.removeItem("importedFileData");
          }
        }
      } else {
        // 编辑器未就绪，继续等待
        setTimeout(loadImportedData, 100);
      }
    };

    // 初始延迟 200ms 后开始检查编辑器状态
    setTimeout(loadImportedData, 200);
  }
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 初始化路由状态
  initializeRouteState();

  // 初始化文件格式
  initializeFormat();

  // 初始化主题（在组件挂载后调用，确保正确恢复用户偏好）
  initializeTheme();

  // 初始化编辑器配置（恢复用户偏好）
  initializeEditorConfig();

  // 从本地存储或状态管理中恢复内容
  const currentState = userStore.getInstanceState(stateKey.value) || {};
  if (currentState.textContent) {
    textContent.value = currentState.textContent;
    initialContent.value = currentState.textContent;
  } else {
    // 默认显示空行
    textContent.value = "";
    initialContent.value = "";
  }

  // 恢复 logId
  if (currentState.logId) {
    currentLogId.value = currentState.logId;
  }

  // 恢复自动保存的 logId
  restoreLogId();

  // 处理从首页最近记录传递的数据（在状态初始化后执行）
  handleTempKeyData();

  // 处理文件导入参数
  handleImportParam();

  // 启动自动保存定时器
  startAutoSaveTimer();
});

/**
 * 组件激活时恢复状态
 */
onActivated(() => {
  // 检查是否有临时数据，如果有则不恢复旧状态
  const tempKey = route.query._temp_key;

  // 设置标志位,禁用 watch 监听器（在整个状态恢复期间保持 true）
  isRestoringState.value = true;

  // 处理激活逻辑
  handleActivation();

  // 恢复 logId
  const activatedState = userStore.getInstanceState(stateKey.value) || {};
  if (activatedState.logId) {
    currentLogId.value = activatedState.logId;
  }

  // 恢复自动保存的 logId
  restoreLogId();

  // 立即启动自动保存定时器（不依赖 DOM 更新）
  startAutoSaveTimer();

  // 延迟状态应用，等待标签动画完成
  setTimeout(() => {
    if (!tempKey) {
      const restored = applyState();

      // 恢复状态后，更新初始内容标记
      if (restored) {
        nextTick(() => {
          if (textContent.value) {
            initialContent.value = textContent.value;
            hasUserEdited.value = false;
          }
          // 状态恢复全部完成后，才解除 watch 禁用
          isRestoringState.value = false;
        });
      } else {
        isRestoringState.value = false;
      }
    } else {
      isRestoringState.value = false;
    }
  }, 100);
});

/**
 * 组件卸载前清理
 */
onBeforeUnmount(() => {
  // 保存当前状态
  const currentState = userStore.getInstanceState(stateKey.value) || {};
  userStore.setInstanceState(stateKey.value, {
    ...currentState,
    textContent: textContent.value,
    selectedFileFormat: selectedFormat.value,
    showCodemirrorConf: showCodemirrorConf.value,
  });
});
</script>

<style lang="less" scoped src="./index.less"></style>
