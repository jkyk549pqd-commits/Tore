import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useUserStore } from "/@/store/modules/system/user";
import { socketClient } from "/@/utils/socket-client";
import { ElMessage } from "element-plus";
import { AutoSaveManager } from "../json-operations";

/**
 * 通用自动保存管理 Composable
 * 支持JSON、TEXT、CODE三种内容类型的自动保存、定时器管理和保存状态标记
 *
 * @param {Object} params - 参数对象
 * @param {import('vue').Ref<string>} params.content - 内容字符串的引用
 * @param {string} params.contentType - 内容类型: 'JSON' | 'TEXT' | 'CODE'
 * @param {string} params.routeName - 路由名称
 * @param {import('vue').Ref<string|null>} params.instanceId - 实例ID的引用
 * @param {import('vue').Ref<string>} params.stateKey - 状态key的引用
 * @param {Function} [params.validateFn] - 可选的内容验证函数
 * @param {import('vue').Ref<string>} [params.textType] - 文本类型（用于CODE/TEXT）
 * @returns {Object} 自动保存相关的状态和方法
 */
export function useAutoSaveGeneric({
  content,
  contentType,
  routeName,
  instanceId,
  stateKey,
  validateFn = null,
  textType = null,
}) {
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
    // 根据内容类型获取对应的保存间隔配置
    const configKey = `${contentType.toLowerCase()}AutoSaveInterval`;
    return appConfigStore[configKey] * 1000;
  });

  /**
   * 自动保存内容到后端
   */
  async function autoSaveContent() {
    if (isSaving.value) {
      return;
    }

    if (!content.value || content.value.trim() === "") {
      return;
    }

    // 可选的内容验证
    if (validateFn && !validateFn(content.value)) {
      return;
    }

    // JSON 内容格式验证
    if (contentType === "JSON") {
      try {
        JSON.parse(content.value);
      } catch (error) {
        console.log("JSON数据格式不合法，跳过保存:", error.message);
        return;
      }
    }

    isSaving.value = true;

    try {
      // 方案1: 检查Socket.IO连接状态，必要时重新建立连接
      if (!socketClient.socket || !socketClient.socket.connected) {
        console.log("Socket.IO连接断开，尝试重新连接...");
        try {
          await socketClient.init();
          // 等待连接建立
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (initError) {
          console.warn(
            "Socket.IO重连失败，跳过本次自动保存:",
            initError.message
          );
          return;
        }
      }

      // 根据内容类型选择对应的保存方法
      const saveMethod =
        contentType === "JSON"
          ? AutoSaveManager.manualSaveJsonData
          : contentType === "CODE"
          ? AutoSaveManager.manualSaveCodeData
          : AutoSaveManager.manualSaveTextData;

      // 构建保存参数
      const baseParams = {
        fromPage: 1,
        routeName:
          typeof routeName === "function" || typeof routeName === "object"
            ? routeName.value
            : routeName,
        instanceId: instanceId.value,
        inOptType: "1", // 自动保存标识
        currentLogId: currentLogId.value,
        socketClient,
        message: ElMessage,
        onSuccess: (time) => {
          console.log(`${contentType}数据自动保存成功`, time);
          updateSaveState(true);
        },
        onError: (error) => {
          // 方案3: 优化错误处理，对超时错误只记录日志
          if (error.message && error.message.includes("Socket.IO 请求超时")) {
            console.debug(
              "自动保存暂时超时，可能是后端服务问题，将在下次定时器重试"
            );
            // 不更新状态为失败，因为可能只是临时网络问题
          } else {
            console.error(`${contentType}数据自动保存失败:`, error);
            updateSaveState(false);
          }
        },
      };

      // 根据内容类型添加特定参数
      if (contentType === "JSON") {
        baseParams.jsonStr = content.value;
      } else {
        baseParams.textStr = content.value;
        baseParams.textType = textType?.value || contentType;
      }

      const result = await saveMethod(baseParams);

      if (result.success) {
        updateSaveState(true);
        // 持久化 logId
        if (result.logId) {
          persistLogId(result.logId);
        }
      } else {
        updateSaveState(false);
      }
    } catch (error) {
      // 方案3: 优化外层错误处理
      if (error.message && error.message.includes("Socket.IO 请求超时")) {
        console.debug(`${contentType}数据自动保存暂时超时，将在下次定时器重试`);
        // 不更新保存状态，避免影响用户体验
      } else {
        console.error(`${contentType}数据自动保存异常:`, error);
        updateSaveState(false);
      }
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * 启动自动保存定时器
   */
  function startAutoSaveTimer() {
    stopAutoSaveTimer();
    const interval = saveInterval.value;
    if (interval > 0) {
      saveTimer.value = AutoSaveManager.createAutoSaveTimer(
        interval,
        autoSaveContent
      );
      console.log(
        `${contentType}自动保存定时器已启动，间隔:`,
        interval / 1000,
        "秒"
      );
    }
  }

  /**
   * 停止自动保存定时器
   */
  function stopAutoSaveTimer() {
    AutoSaveManager.clearAutoSaveTimer(saveTimer.value);
    saveTimer.value = null;
    console.log(`${contentType}自动保存定时器已停止`);
  }

  /**
   * 监听保存间隔配置变化，重启定时器
   */
  watch(saveInterval, (newInterval, oldInterval) => {
    if (newInterval !== oldInterval && newInterval > 0) {
      console.log(
        `${contentType}保存间隔配置已变化，从`,
        oldInterval / 1000,
        "秒改为",
        newInterval / 1000,
        "秒，重启定时器"
      );
      startAutoSaveTimer();
    }
  });

  // 组件卸载时清理定时器
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
    autoSaveContent,
    updateSaveState,
    restoreLogId,
    persistLogId,
  };
}
