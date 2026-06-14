/*
 * 系统日志
 *
 */
import { socketClient } from "/src/utils/socket-client";

export const logApi = {
  /**
   * 查询所有日志
   */
  getAllLogs: () => {
    return socketClient.invoke("controller/system/getAllLogs");
  },

  /**
   * 根据ID查询日志
   */
  getLogById: (id) => {
    return socketClient.invoke("controller/system/getLogById", { id });
  },

  /**
   * 添加日志
   */
  addLog: (param) => {
    return socketClient.invoke("controller/system/addLog", param);
  },

  /**
   * 更新日志
   */
  updateLog: (param) => {
    return socketClient.invoke("controller/system/updateLog", param);
  },

  /**
   * 删除日志
   */
  deleteLog: (id) => {
    return socketClient.invoke("controller/system/deleteLog", { id });
  },

  /**
   * 根据类型查询日志
   */
  getLogsByType: (type) => {
    return socketClient.invoke("controller/system/getLogsByType", { type });
  },

  /**
   * 根据操作类型查询日志
   */
  getLogsByOptType: (optType) => {
    return socketClient.invoke("controller/system/getLogsByOptType", {
      optType,
    });
  },

  /**
   * 根据标签查询日志
   */
  getLogsByTag: (tag) => {
    return socketClient.invoke("controller/system/getLogsByTag", { tag });
  },

  /**
   * 根据父级查询日志
   */
  getLogsByParent: (parent) => {
    return socketClient.invoke("controller/system/getLogsByParent", { parent });
  },

  /**
   * 分页查询日志
   * @param {Object} params - 查询参数
   * @param {number} params.pageNo - 当前页码（从1开始）
   * @param {number} params.pageSize - 每页大小
   * @param {string} [params.type] - 日志类型（可选，模糊查询）
   * @param {string} [params.optType] - 操作类型（可选，模糊查询）
   * @param {string} [params.tag] - 标签（可选，模糊查询）
   * @param {string} [params.parent] - 父级（可选，模糊查询）
   * @returns {Promise<Object>} 返回对象包含 { list: Array, total: number }
   */
  getLogsPage: (params) => {
    return socketClient.invoke("controller/system/getLogsPage", params);
  },

  /**
   * 全文检索日志
   * @param {Object} params - 查询参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.pageNo - 当前页码（从1开始）
   * @param {number} params.pageSize - 每页大小
   * @param {string} [params.type] - 日志类型（可选，模糊查询）
   * @param {string} [params.optType] - 操作类型（可选，模糊查询）
   * @param {string} [params.tag] - 标签（可选，模糊查询）
   * @param {string} [params.parent] - 父级（可选，模糊查询）
   * @returns {Promise<Object>} 返回对象包含 { list: Array, total: number }
   */
  searchLogsByKeyword: (params) => {
    return socketClient.invoke("controller/system/searchLogsByKeyword", params);
  },
};
