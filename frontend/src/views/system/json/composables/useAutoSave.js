import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useUserStore } from "/@/store/modules/system/user";
import { socketClient } from "/@/utils/socket-client";
import { ElMessage } from "element-plus";
import { AutoSaveManager } from "../json-operations";

/**
 * 自动保存管理 Composable
 * 负责JSON数据的自动保存、定时器管理和保存状态标记
 *
 * @param {Object} params - 参数对象
 * @param {import('vue').Ref<string>} params.jsonStr1 - JSON字符串1的引用
 * @param {string} params.routeName - 路由名称
 * @param {import('vue').Ref<string|null>} params.instanceId - 实例ID的引用
 * @param {import('vue').Ref<string>} params.stateKey - 状态key的引用
 * @returns {Object} 自动保存相关的状态和方法
 */
export function useAutoSave({ jsonStr1, routeName, instanceId, stateKey }) {
  // 获取 store 实例
  const appConfigStore = useAppConfigStore();
  const userStore = useUserStore();

  // 保存状态
  const saveTimer = ref(null);
  const isSaving = ref(false);

  // 当前编辑器关联的日志ID，用于版本追加
  const currentLogId = ref(null);

  /**
   * 从 instanceState 恢复 logId
   */
  function restoreLogId() {
    const state = userStore.getInstanceState(stateKey.value);
    if (state && state.logId) {
      currentLogId.value = state.logId;
    }
  }

  /**
   * 将 logId 持久化到 instanceState
   */
  function persistLogId(logId) {
    if (!logId) return;
    currentLogId.value = logId;
    const currentState = userStore.getInstanceState(stateKey.value) || {};
    userStore.setInstanceState(stateKey.value, {
      ...currentState,
      logId,
    });
  }

  /**
   * 更新保存状态
   * @param {boolean} isSaved - 是否已保存
   */
  const updateSaveState = (isSaved) => {
    const currentState = userStore.getInstanceState(stateKey.value) || {};
    userStore.setInstanceState(stateKey.value, {
      ...currentState,
      isContentSaved: isSaved,
    });
  };

  /**
   * 获取保存间隔配置（毫秒）
   */
  const saveInterval = computed(() => {
    return appConfigStore.jsonAutoSaveInterval * 1000;
  });

  /**
   * 自动保存JSON数据到后端
   */
  async function autoSaveJsonData() {
    if (isSaving.value) {
      return;
    }

    if (!jsonStr1.value || jsonStr1.value.trim() === "") {
      return;
    }

    try {
      JSON.parse(jsonStr1.value);
    } catch (error) {
      console.log("JSON数据格式不合法，跳过保存:", error.message);
      return;
    }

    isSaving.value = true;

    const result = await AutoSaveManager.manualSaveJsonData({
      fromPage: 1,
      jsonStr: jsonStr1.value,
      routeName: routeName,
      instanceId: instanceId.value,
      inOptType: "1",
      currentLogId: currentLogId.value,
      socketClient,
      message: ElMessage,
      onSuccess: (time) => {
        console.log("JSON数据自动保存成功", time);
        updateSaveState(true);
      },
      onError: (error) => {
        console.error("JSON数据自动保存失败:", error);
        updateSaveState(false);
      },
    });

    if (result.success) {
      updateSaveState(true);
      // 持久化 logId
      if (result.logId) {
        persistLogId(result.logId);
      }
    } else {
      updateSaveState(false);
    }
    isSaving.value = false;
  }

  /**
   * 启动自动保存定时器
   */
  function startAutoSaveTimer() {
    stopAutoSaveTimer();
    saveTimer.value = AutoSaveManager.createAutoSaveTimer(
      saveInterval.value,
      autoSaveJsonData
    );
  }

  /**
   * 停止自动保存定时器
   */
  function stopAutoSaveTimer() {
    AutoSaveManager.clearAutoSaveTimer(saveTimer.value);
    saveTimer.value = null;
  }

  /**
   * 监听保存间隔配置变化，重启定时器
   */
  watch(saveInterval, (newInterval, oldInterval) => {
    if (newInterval !== oldInterval) {
      startAutoSaveTimer();
    }
  });

  onBeforeUnmount(() => {
    stopAutoSaveTimer();
  });

  // 注意：移除了 onDeactivated 中的定时器停止逻辑
  // 这样可以确保在标签页切换后，后台编辑器的自动保存功能仍然有效
  // 只有在组件真正卸载时才会清理定时器

  return {
    // 状态
    isSaving,
    saveInterval,
    currentLogId,

    // 方法
    startAutoSaveTimer,
    stopAutoSaveTimer,
    autoSaveJsonData,
    updateSaveState,
    restoreLogId,
    persistLogId,
  };
}
