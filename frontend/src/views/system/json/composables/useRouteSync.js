import { ref } from "vue";
import {
  getInstanceIdFromQuery,
  handleRouteQueryChange,
  initializeInstanceState,
  handleActivatedState,
} from "/@/utils/instance-state-manager";

/**
 * 路由同步管理 Composable
 * 负责实例ID、stateKey的管理以及路由query变化处理
 *
 * @param {Object} params - 参数对象
 * @param {Object} params.route - 路由对象
 * @param {import('vue').Ref<boolean>} params.isRestoringState - 是否正在恢复状态的标志
 * @returns {Object} 路由同步相关的状态和方法
 */
export function useRouteSync({ route, isRestoringState }) {
  // 实例ID和状态key
  const instanceId = ref(null);
  const stateKey = ref(`${route.name}_default`);

  /**
   * 初始化实例状态
   * 在组件挂载时调用
   */
  const initializeRouteState = () => {
    const initResult = initializeInstanceState(route.query, route.name);
    instanceId.value = initResult.instanceId;
    stateKey.value = initResult.stateKey;
  };

  /**
   * 处理路由query变化
   * 在watch route.query时调用
   *
   * @param {Object} params - 参数对象
   * @param {Object} params.newQuery - 新的query
   * @param {Object} params.oldQuery - 旧的query
   * @param {Object} params.currentState - 当前状态
   * @returns {Object} 包含新instanceId和stateKey的对象
   */
  const handleQueryChange = ({ newQuery, oldQuery, currentState }) => {
    // 设置标志位，禁止状态保存 watch 在路由切换期间工作
    isRestoringState.value = true;

    const { newInstanceId, newStateKey } = handleRouteQueryChange(
      newQuery,
      oldQuery,
      route.name
    );

    // 更新当前 instanceId 和 stateKey
    instanceId.value = newInstanceId;
    stateKey.value = newStateKey;

    return {
      instanceId: newInstanceId,
      stateKey: newStateKey,
    };
  };

  /**
   * 处理组件激活时的状态
   * 在onActivated时调用
   *
   * @returns {Object} 包含instanceId和stateKey的对象
   */
  const handleActivation = () => {
    const validRouteName = route.name || "902";
    const { instanceId: activatedInstanceId, stateKey: activatedStateKey } =
      handleActivatedState(route.query, validRouteName);

    instanceId.value = activatedInstanceId;
    stateKey.value = activatedStateKey;

    return {
      instanceId: activatedInstanceId,
      stateKey: activatedStateKey,
    };
  };

  return {
    // 状态
    instanceId,
    stateKey,

    // 方法
    initializeRouteState,
    handleQueryChange,
    handleActivation,
  };
}
