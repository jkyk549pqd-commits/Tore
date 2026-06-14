/**
 * 统一的实例状态管理工具
 * 用于管理不同标签页实例间的状态保存和恢复
 * 支持 json (902) 和 history (906) 两个页面的多实例模式
 */

import { useUserStore } from "/@/store/modules/system/user";

// 页面路由名称映射
const ROUTE_NAME_MAP = {
  json: "902",
  jsonHis: "906",
  history: "906",
  textEditor: "908",
  codeEditor: "901",
};

// 页面类型映射
const PAGE_TYPE_MAP = {
  902: "json",
  906: "history",
  901: "codeEditor",
};

/**
 * 从路由查询参数中提取实例ID
 * @param {Object} query - 路由查询参数
 * @returns {string|null} 实例ID
 */
export function getInstanceIdFromQuery(query) {
  if (!query) return null;
  for (let key in query) {
    if (key.startsWith("_instance_")) return String(query[key]);
  }
  return null;
}

/**
 * 生成状态存储的key
 * @param {string} instanceId - 实例ID（可选）
 * @param {string} routeName - 路由名称(menuId)
 * @returns {string} 存储key
 */
export function genStateKey(instanceId, routeName) {
  // 确保 routeName 有有效值
  if (!routeName || routeName === "undefined") {
    routeName = "902"; // 默认为 json 页面
  }

  // 如果没有实例ID，使用默认实例
  if (!instanceId) {
    return `${routeName}_default`; // 例如: "902_default", "906_default"
  }

  // 多实例模式: 使用 routeName 作为前缀
  return `${routeName}_instance_${instanceId}`; // 例如: "902_instance_1", "906_instance_2"
}

/**
 * 恢复实例状态
 * @param {string} instanceId - 实例ID（可选）
 * @param {string} routeName - 路由名称(menuId)
 * @returns {Object|null} 恢复的状态
 */
export function restoreInstanceState(instanceId, routeName) {
  const userStore = useUserStore();
  const key = genStateKey(instanceId, routeName);
  const state = userStore.getInstanceState(key);
  return state;
}

/**
 * 保存实例状态
 * @param {string} instanceId - 实例ID（可选）
 * @param {string} routeName - 路由名称(menuId)
 * @param {Object} state - 要保存的状态
 */
export function saveInstanceState(instanceId, routeName, state) {
  const userStore = useUserStore();
  const key = genStateKey(instanceId, routeName);
  userStore.setInstanceState(key, state);
}

/**
 * 初始化实例状态
 * @param {Object} query - 路由查询参数
 * @param {string} routeName - 路由名称(menuId)
 * @returns {Object} 包含instanceId和初始化状态的对象
 */
export function initializeInstanceState(query, routeName) {
  const instanceId = getInstanceIdFromQuery(query);
  return {
    instanceId,
    stateKey: genStateKey(instanceId, routeName),
    hasExistingState: !!instanceId,
  };
}

/**
 * 处理组件激活时的状态恢复
 * @param {Object} query - 路由查询参数
 * @param {string} routeName - 路由名称(menuId)
 * @returns {Object} 包含instanceId和状态key的对象
 */
export function handleActivatedState(query, routeName) {
  const instanceId = getInstanceIdFromQuery(query);
  return {
    instanceId,
    stateKey: genStateKey(instanceId, routeName),
  };
}

/**
 * 处理路由查询变化
 * @param {Object} newQuery - 新的路由查询参数
 * @param {Object} oldQuery - 旧的路由查询参数
 * @param {string} routeName - 路由名称(menuId)
 * @returns {Object} 包含新旧的instanceId和stateKey
 */
export function handleRouteQueryChange(newQuery, oldQuery, routeName) {
  const oldInstanceId = getInstanceIdFromQuery(oldQuery);
  const newInstanceId = getInstanceIdFromQuery(newQuery);

  return {
    oldInstanceId,
    newInstanceId,
    oldStateKey: genStateKey(oldInstanceId, routeName),
    newStateKey: genStateKey(newInstanceId, routeName),
  };
}

/**
 * 清理实例状态
 * @param {string} instanceId - 实例ID（可选）
 * @param {string} routeName - 路由名称(menuId)
 */
export function clearInstanceState(instanceId, routeName) {
  const userStore = useUserStore();
  const key = genStateKey(instanceId, routeName);
  userStore.removeInstanceState(key);
}

/**
 * 获取所有实例的状态key（用于调试）
 * @param {string} routeName - 路由名称(menuId)
 * @returns {Array<string>} 所有相关的状态key
 */
export function getAllInstanceStateKeys(routeName) {
  const userStore = useUserStore();
  const keys = Object.keys(userStore.instanceStateMap || {});
  return keys.filter((key) => key.startsWith(`${routeName}_`));
}
