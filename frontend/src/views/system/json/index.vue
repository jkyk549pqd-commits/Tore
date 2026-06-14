<template>
  <div>
    <div id="json-container" class="json-container">
      <!-- 页面头部 -->
      <PageHeader
        :show-diff-view="showRightBox"
        :show-config="showCodemirrorConf"
        :is-pinned="isHeaderPinned"
        :is-saved="isSaved"
        :is-saving="isSaving"
        @toggle-diff="toggleDiff"
        @toggle-config="toggleConfig"
        @toggle-pin="togglePin"
        @save="handleManualSave"
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
          :show-demo="showDemo"
          :theme-options="cmThemeOptions"
          @update:cm-theme="cmTheme = $event"
          @update:cm-font-size="cmFontSize = $event"
          @update:cm-line-wrapping="cmLineWrapping = $event"
          @update:cm-line-numbers="cmLineNumbers = $event"
          @update:cm-read-only="cmReadOnly = $event"
          @update:show-demo="showDemo = $event"
        />
      </transition>

      <!-- 编辑器区域 -->
      <div class="page-content">
        <JsonEditorPanel
          editor-id="firTextArea"
          v-model="jsonStr1"
          :cm-options="cmOptions"
          :font-size="cmFontSize"
          :show-demo="showDemo"
          @ready="onReady"
        />
        <JsonEditorPanel
          v-if="showRightBox"
          editor-id="secTextArea"
          v-model="jsonStr2"
          :cm-options="cmOptions"
          :font-size="cmFontSize"
          :show-demo="showDemo"
          :is-compare="true"
          @ready="onReady"
        />
      </div>
    </div>
    <!-- 比较操作按钮 - 移到 json-container 外部以确保 fixed 定位相对于视口 -->
    <CompareActionBar :visible="showRightBox" @compare="compareJson" />
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
import JsonEditorPanel from "./components/json-editor-panel.vue";
import PageHeader from "./components/page-header.vue";
import EditorConfigPanel from "./components/editor-config-panel.vue";
import CompareActionBar from "./components/compare-action-bar.vue";
import { JsonCompare, AutoSaveManager } from "./json-operations";
import { useCodeMirrorConfig } from "./composables/useCodeMirrorConfig";
import { useAutoSave } from "./composables/useAutoSave";
import { useRouteSync } from "./composables/useRouteSync";
import { useStatePersistence } from "./composables/useStatePersistence";
import { useClipboardActions } from "./composables/useClipboardActions";
import { useRecentRecords } from "/@/views/system/home/composables/useRecentRecords";
import { localRead, localRemove } from "/@/utils/local-util";
import { useI18n } from "vue-i18n";
import { useUserStore } from "/@/store/modules/system/user";
import { socketClient } from "/@/utils/socket-client";
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

// 使用 Composables
const {
  cmTheme,
  cmThemeOptions,
  cmFontSize,
  cmLineWrapping,
  cmLineNumbers,
  cmReadOnly,
  showDemo,
  cmOptions,
  initializeTheme,
  initializeEditorConfig,
} = useCodeMirrorConfig();

const {
  instanceId,
  stateKey,
  initializeRouteState,
  handleQueryChange,
  handleActivation,
} = useRouteSync({ route, isRestoringState });

// 本地状态
const jsonStr1 = ref("");
const jsonStr2 = ref("");
const showRightBox = ref(false);
const showCodemirrorConf = ref(false);
const isHeaderPinned = ref(false);
const cmInstance = ref(null);
const isSaving = ref(false);

// 编辑检测机制：跟踪初始内容和用户编辑
const initialJsonStr1 = ref("");
const hasUserEdited = ref(false);

// 编辑器就绪状态标志
const editorReady = ref(false);

// 使用自动保存（需要在状态管理之后）
const {
  startAutoSaveTimer,
  updateSaveState,
  currentLogId,
  restoreLogId,
  persistLogId,
} = useAutoSave({
  jsonStr1,
  routeName: route.name,
  instanceId,
  stateKey,
});

// 集成最近记录功能
const { addRecord } = useRecentRecords();

// 使用状态持久化
const { applyState } = useStatePersistence({
  jsonStr1,
  jsonStr2,
  showRightBox,
  showCodemirrorConf,
  isRestoringState,
  stateKey,
});

/**
 * CodeMirror 编辑器就绪回调
 */
function onReady(cm) {
  cmInstance.value = cm;
  // 设置编辑器就绪状态
  editorReady.value = true;
}

/**
 * 切换配置面板显示
 */
function toggleConfig() {
  showCodemirrorConf.value = !showCodemirrorConf.value;
}

/**
 * 切换固定头部
 */
function togglePin() {
  isHeaderPinned.value = !isHeaderPinned.value;
}

/**
 * 切换差异视图
 */
function toggleDiff() {
  showRightBox.value = !showRightBox.value;
  // 移除 JavaScript 布局控制，改用纯 CSS 控制
}

/**
 * 比较JSON
 */
function compareJson() {
  try {
    if (JsonCompare.prepareCompareData(jsonStr1.value, jsonStr2.value)) {
      router.push("/jsonDiff");
    }
  } catch (error) {
    console.error("跳转失败:" + error);
  }
}

/**
 * 计算属性：判断当前JSON是否已保存
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
  return `json_${year}${month}${day}_${hour}${minute}${second}.json`;
}

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
 * 手动保存JSON数据
 */
async function handleManualSave() {
  // 如果正在保存，直接返回
  if (isSaving.value) {
    return;
  }

  // 验证JSON格式
  if (!jsonStr1.value || jsonStr1.value.trim() === "") {
    return;
  }

  try {
    // 验证JSON格式是否正确
    JSON.parse(jsonStr1.value);
  } catch (error) {
    ElMessage.error(t("json.editor.invalidJsonFormat"));
    console.error("JSON格式验证失败:", error);
    return;
  }

  isSaving.value = true;

  try {
    // 获取当前标签页的 customName
    const customName = getCustomNameFromTagNav(route.name, instanceId.value);

    const result = await AutoSaveManager.manualSaveJsonData({
      fromPage: 1,
      jsonStr: jsonStr1.value,
      routeName: route.name,
      instanceId: instanceId.value,
      inOptType: "2",
      currentLogId: currentLogId.value,
      socketClient,
      message: ElMessage,
      customName: customName, // 传递自定义名称
      onSuccess: (time) => {
        // 保存成功，更新保存状态并重置编辑标记
        updateSaveState(true);
        hasUserEdited.value = false;
        initialJsonStr1.value = jsonStr1.value;
        // 添加到最近记录
        addRecord({
          name: customName || generateFilename(),
          content: jsonStr1.value,
          type: "json",
        });
      },
      onError: (error) => {
        ElMessage.error(t("json.editor.saveFailed"));
        console.error("手动保存失败:", error);
        // 保存失败，保持未保存状态
        updateSaveState(false);
      },
    });

    if (!result.success) {
      updateSaveState(false);
    } else {
      // 保存成功，更新保存状态并重置编辑标记
      updateSaveState(true);
      hasUserEdited.value = false;
      initialJsonStr1.value = jsonStr1.value;
      // 持久化 logId
      if (result.logId) {
        persistLogId(result.logId);
      }
    }
  } catch (error) {
    console.error("手动保存异常:", error);
    ElMessage.error(t("json.editor.saveFailed"));
    updateSaveState(false);
  } finally {
    isSaving.value = false;
  }
}

/**
 * 处理键盘快捷键
 */
function handleKeyDown(event) {
  // Ctrl+S 或 Cmd+S 触发保存
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    handleManualSave();
  }
}

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
      jsonStr1: jsonStr1.value,
      jsonStr2: jsonStr2.value,
      showRightBox: showRightBox.value,
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
 * 监听 jsonStr1 变化,更新保存状态标记
 */
watch(jsonStr1, (newValue, oldValue) => {
  // 如果正在恢复状态,不处理
  if (isRestoringState.value) {
    return;
  }

  // 初始化时记录初始内容
  if (initialJsonStr1.value === "" && newValue !== "") {
    initialJsonStr1.value = "";
    hasUserEdited.value = true;
    // 用户编辑了内容，标记为未保存
    updateSaveState(false);
    return; // 初始化时不触发未保存状态
  }

  // 清空操作视为已保存（不需要保存空内容）
  if (!newValue || newValue.trim() === "") {
    hasUserEdited.value = false;
    updateSaveState(true);
    return;
  }

  // 检测用户是否真正编辑了内容
  // 只有当新值与初始值不同，且不是初始化阶段时，才标记为已编辑
  if (newValue !== initialJsonStr1.value) {
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
            jsonStr1.value = parsed.content || "";
            // 清除临时数据
            localRemove(tempKey);

            // 更新编辑检测机制的状态
            if (jsonStr1.value && jsonStr1.value.trim() !== "") {
              initialJsonStr1.value = jsonStr1.value;
              hasUserEdited.value = false;
              updateSaveState(true);
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
            // 验证 JSON 格式
            JSON.parse(importedData);
            // 将数据设置到编辑器中
            jsonStr1.value = importedData;
            // 清除 sessionStorage 中的临时数据
            sessionStorage.removeItem("importedFileData");
            // 显示成功消息
            ElMessage.success(t("json.editor.importSuccess"));

            // 更新编辑检测机制的状态
            initialJsonStr1.value = importedData;
            hasUserEdited.value = false;
            updateSaveState(true);
          } catch (error) {
            console.error("导入数据格式错误:", error);
            ElMessage.error(t("json.editor.invalidJsonFormat"));
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
 * 处理粘贴参数
 */
function handlePasteParam() {
  if (route.query.paste === "true") {
    // 使用轮询机制等待编辑器就绪后再读取剪贴板
    const pasteFromClipboard = async () => {
      if (editorReady.value) {
        // 编辑器已就绪，开始读取剪贴板
        // 使用 useClipboardActions 中的 handlePaste 函数
        const { handlePaste } = useClipboardActions({
          emit: () => {},
          t,
          localValue: jsonStr1,
        });

        try {
          await handlePaste();

          // 粘贴成功后，更新编辑检测机制的状态
          if (jsonStr1.value && jsonStr1.value.trim() !== "") {
            initialJsonStr1.value = jsonStr1.value;
            hasUserEdited.value = false;
            updateSaveState(true);
          }
        } catch (error) {
          console.error("粘贴失败:", error);
        }
      } else {
        // 编辑器未就绪，继续等待
        setTimeout(pasteFromClipboard, 100);
      }
    };

    // 初始延迟 200ms 后开始检查编辑器状态
    setTimeout(pasteFromClipboard, 200);
  }
}

/**
 * 组件挂载（仅初始化，不恢复状态）
 */
onMounted(async () => {
  // 初始化实例状态（必须先执行，确保 stateKey 正确设置）
  initializeRouteState();

  // 恢复 logId（从 instanceState 中恢复）
  restoreLogId();

  // 初始化主题
  initializeTheme();

  // 初始化编辑器配置（恢复用户偏好）
  initializeEditorConfig();

  // 处理从首页最近记录传递的数据（在状态初始化后执行）
  handleTempKeyData();

  // 处理文件导入参数
  handleImportParam();

  // 处理粘贴参数
  handlePasteParam();

  // 延迟设置初始状态，确保所有数据处理完成且编辑器已就绪
  // 使用更长的延迟时间，确保导入、粘贴、最近记录等功能都已处理完成
  setTimeout(() => {
    // 设置初始内容，用于编辑检测
    if (jsonStr1.value && initialJsonStr1.value === "") {
      initialJsonStr1.value = jsonStr1.value;
      // 初始化保存状态为已保存
      updateSaveState(true);
    }
  }, 1000); // 增加到 1000ms，确保所有异步操作都已完成

  // 启动自动保存定时器
  startAutoSaveTimer();

  // 添加键盘事件监听
  window.addEventListener("keydown", handleKeyDown, { passive: true });
});

/**
 * 组件卸载前清理
 */
onBeforeUnmount(() => {
  // 移除键盘事件监听
  window.removeEventListener("keydown", handleKeyDown);
});

/**
 * keep-alive 激活时恢复状态（统一的状态恢复入口）
 * 优化：不再禁用过渡动画，改为优化时序，减少阻塞
 */
onActivated(() => {
  // 检查是否有临时数据，如果有则不恢复旧状态
  const tempKey = route.query._temp_key;

  // 重置编辑器就绪状态，因为 keep-alive 激活时编辑器可能需要重新初始化
  editorReady.value = false;

  // 设置标志位,禁用 watch 监听器（在整个状态恢复期间保持 true）
  isRestoringState.value = true;

  // 处理激活逻辑（同步执行，确保 stateKey 在后续操作前已更新）
  handleActivation();
  // 恢复 logId
  restoreLogId();

  // 使用 requestAnimationFrame 优化定时器启动，不阻塞主线程
  requestAnimationFrame(() => {
    startAutoSaveTimer();
  });

  // 延迟状态应用，等待标签动画完成
  setTimeout(() => {
    if (!tempKey) {
      const restored = applyState();

      // 恢复状态后，更新初始内容标记
      if (restored) {
        nextTick(() => {
          if (jsonStr1.value) {
            initialJsonStr1.value = jsonStr1.value;
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
</script>

<style lang="less" scoped src="./index.less"></style>
