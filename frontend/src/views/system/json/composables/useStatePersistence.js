import { watch, nextTick } from "vue";
import { debounce } from "lodash";
import { useUserStore } from "/@/store/modules/system/user";
import { StatePersistenceManager } from "../json-operations";

/**
 * 状态持久化管理 Composable
 * 负责状态保存、恢复以及状态变化的监听
 *
 * @param {Object} params - 参数对象
 * @param {import('vue').Ref<string>} params.jsonStr1 - JSON字符串1的引用
 * @param {import('vue').Ref<string>} params.jsonStr2 - JSON字符串2的引用
 * @param {import('vue').Ref<boolean>} params.showRightBox - 是否显示右侧编辑器的引用
 * @param {import('vue').Ref<boolean>} params.showCodemirrorConf - 是否显示CodeMirror配置的引用
 * @param {import('vue').Ref<boolean>} params.isRestoringState - 是否正在恢复状态的标志
 * @param {import('vue').Ref<string>} params.stateKey - 状态key的引用
 * @returns {Object} 状态持久化相关的方法
 */
export function useStatePersistence({
  jsonStr1,
  jsonStr2,
  showRightBox,
  showCodemirrorConf,
  isRestoringState,
  stateKey,
}) {
  // 获取 store 实例
  const userStore = useUserStore();

  /**
   * 保存当前状态到store
   */
  /**
   * 保存当前状态的函数
   * 该函数尝试将当前应用状态保存到存储中
   */
  const saveState = () => {
    try {
      const currentKey = stateKey.value; // 获取当前状态的键值
      if (!currentKey) {
        // 检查是否存在键值
        return; // 如果不存在键值，则直接返回
      }
      // 使用状态持久化管理器保存状态
      StatePersistenceManager.saveStateToStore({
        stateKey: currentKey, // 当前状态的键
        jsonStr1: jsonStr1.value, // 第一个JSON字符串
        jsonStr2: jsonStr2.value, // 第二个JSON字符串
        showRightBox: showRightBox.value, // 是否显示右侧框的状态
        showCodemirrorConf: showCodemirrorConf.value, // 是否显示CodeMirror配置面板的状态
        userStore, // 用户存储对象
      });
    } catch (error) {
      console.error("Failed to save state:", error); // 捕获并打印保存状态时的错误
    }
  };

  /**
   * 从store恢复状态
   * @returns {Object|null} 恢复的状态对象
   */
  const restoreState = () => {
    try {
      return StatePersistenceManager.restoreStateFromStore(
        stateKey.value,
        userStore
      );
    } catch (error) {
      console.error("Failed to restore state:", error);
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
      StatePersistenceManager.applyRestoredState(
        state,
        (value) => (jsonStr1.value = value),
        (value) => (jsonStr2.value = value),
        (value) => (showRightBox.value = value),
        (value) => (showCodemirrorConf.value = value)
      );
      return true;
    } else {
      // 如果没有保存的状态，则将标签页重置为默认状态
      StatePersistenceManager.resetEditorState(
        (value) => (jsonStr1.value = value),
        (value) => (jsonStr2.value = value),
        (value) => (showRightBox.value = value),
        (value) => (showCodemirrorConf.value = value)
      );
      return false;
    }
  };

  /**
   * 重置编辑器状态
   */
  const resetState = () => {
    StatePersistenceManager.resetEditorState(
      (value) => (jsonStr1.value = value),
      (value) => (jsonStr2.value = value),
      (value) => (showRightBox.value = value),
      (value) => (showCodemirrorConf.value = value)
    );
  };

  /**
   * 监听主要状态变化并保存(jsonStr2、showRightBox 和 showCodemirrorConf)
   */
  watch([jsonStr2, showRightBox, showCodemirrorConf], () => {
    // 如果正在恢复状态,不保存状态,避免覆盖
    if (isRestoringState.value) {
      return;
    }
    const currentKey = stateKey.value;
    if (!currentKey) {
      return;
    }
    StatePersistenceManager.saveStateToStore({
      stateKey: currentKey,
      jsonStr1: jsonStr1.value,
      jsonStr2: jsonStr2.value,
      showRightBox: showRightBox.value,
      showCodemirrorConf: showCodemirrorConf.value,
      userStore,
    });
  });

  /**
   * 监听 jsonStr1 变化,统一处理内容保存和状态标记更新(使用防抖优化)
   */
  const debouncedHandleJsonStr1Change = debounce((newValue, oldValue) => {
    // 如果正在恢复状态,不处理
    if (isRestoringState.value) {
      return;
    }
    const currentKey = stateKey.value;
    if (!currentKey) {
      return;
    }
    // 保存内容到 store(确保缓存正常工作)
    StatePersistenceManager.saveStateToStore({
      stateKey: currentKey,
      jsonStr1: newValue,
      jsonStr2: jsonStr2.value,
      showRightBox: showRightBox.value,
      showCodemirrorConf: showCodemirrorConf.value,
      userStore,
    });

    // 更新保存状态标记（需要在调用方实现）
    // 这里不直接调用 updateSaveState，因为它需要在 useAutoSave 中定义
    // 调用方可以通过 watch jsonStr1 的变化来实现
  }, 300); // 300ms 防抖延迟

  watch(jsonStr1, debouncedHandleJsonStr1Change);

  return {
    // 方法
    saveState,
    restoreState,
    applyState,
    resetState,
    debouncedHandleJsonStr1Change,
  };
}
