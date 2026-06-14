import { watch, nextTick } from "vue";
import { debounce } from "lodash";
import { useUserStore } from "/@/store/modules/system/user";
import { TextStatePersistenceManager } from "../text-operations";

/**
 * 状态持久化管理 Composable
 * 负责文本编辑器的状态保存、恢复以及状态变化的监听
 *
 * @param {Object} params - 参数对象
 * @param {import('vue').Ref<string>} params.textContent - 文本内容的引用
 * @param {import('vue').Ref<boolean>} params.showCodemirrorConf - 是否显示CodeMirror配置面板的引用
 * @param {import('vue').Ref<boolean>} params.isRestoringState - 是否正在恢复状态的标志
 * @param {import('vue').Ref<string>} params.stateKey - 状态key的引用
 * @returns {Object} 状态持久化相关的方法
 */
export function useStatePersistence({
  textContent,
  showCodemirrorConf,
  isRestoringState,
  stateKey,
}) {
  // 获取 store 实例
  const userStore = useUserStore();

  /**
   * 保存当前状态到store
   */
  const saveState = () => {
    try {
      const currentKey = stateKey.value;
      if (!currentKey) {
        return;
      }

      // 获取当前状态
      const currentState = userStore.getInstanceState(currentKey) || {};

      TextStatePersistenceManager.saveStateToStore({
        stateKey: currentKey,
        textContent: textContent.value,
        isContentSaved: currentState.isContentSaved,
        showCodemirrorConf: showCodemirrorConf.value,
        userStore,
      });
    } catch (error) {
      console.error("Failed to save text state:", error);
    }
  };

  /**
   * 从store恢复状态
   * @returns {Object|null} 恢复的状态对象
   */
  const restoreState = () => {
    try {
      return TextStatePersistenceManager.restoreStateFromStore(
        stateKey.value,
        userStore
      );
    } catch (error) {
      console.error("Failed to restore text state:", error);
      return undefined;
    }
  };

  /**
   * 应用恢复的状态
   */
  const applyState = () => {
    const state = restoreState();
    if (state) {
      // 应用恢复的状态
      TextStatePersistenceManager.applyRestoredState(
        state,
        (value) => (textContent.value = value),
        (value) => (showCodemirrorConf.value = value)
      );
      return true;
    } else {
      // 如果没有保存的状态，则将标签页重置为默认状态
      TextStatePersistenceManager.resetEditorState(
        (value) => (textContent.value = value),
        (value) => (showCodemirrorConf.value = value)
      );
      return false;
    }
  };

  /**
   * 重置编辑器状态
   */
  const resetState = () => {
    TextStatePersistenceManager.resetEditorState(
      (value) => (textContent.value = value),
      (value) => (showCodemirrorConf.value = value)
    );
  };

  /**
   * 监听文本内容变化,统一处理内容保存(使用防抖优化)
   */
  const debouncedHandleTextChange = debounce((newValue, oldValue) => {
    // 如果正在恢复状态,不处理
    if (isRestoringState.value) {
      return;
    }

    // 清空操作不保存状态（由主 watch 监听器处理）
    if (!newValue || newValue.trim() === "") {
      return;
    }

    const currentKey = stateKey.value;
    if (!currentKey) {
      return;
    }

    // 获取当前状态，保留现有的 isContentSaved 值
    const currentState = userStore.getInstanceState(currentKey) || {};

    // 保存内容到 store(确保缓存正常工作)
    // 注意：不覆盖 isContentSaved 状态，由主 watch 监听器管理
    TextStatePersistenceManager.saveStateToStore({
      stateKey: currentKey,
      textContent: newValue,
      isContentSaved: currentState.isContentSaved, // 保留现有的保存状态
      showCodemirrorConf: showCodemirrorConf.value,
      userStore,
    });
  }, 300); // 300ms 防抖延迟

  watch(textContent, debouncedHandleTextChange);

  /**
   * 监听配置面板显示状态变化
   */
  watch(showCodemirrorConf, () => {
    // 如果正在恢复状态,不保存状态,避免覆盖
    if (isRestoringState.value) {
      return;
    }
    const currentKey = stateKey.value;
    if (!currentKey) {
      return;
    }
    TextStatePersistenceManager.saveStateToStore({
      stateKey: currentKey,
      textContent: textContent.value,
      showCodemirrorConf: showCodemirrorConf.value,
      userStore,
    });
  });

  return {
    // 方法
    saveState,
    restoreState,
    applyState,
    resetState,
    debouncedHandleTextChange,
  };
}
