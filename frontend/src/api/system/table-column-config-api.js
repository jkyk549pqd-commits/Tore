/*
 * 表格列配置API
 * 用于表格列的自定义配置管理
 */
import socketClient from "/src/utils/socket-client";

export const tableColumnConfigApi = {
  /**
   * 获取用户表格列配置
   * @param {Object} params - 参数对象 {tableId, userId}
   * @returns {Promise<Object>} 配置对象
   */
  getUserTableColumn: (params) => {
    return socketClient.invoke("controller/system/getUserTableColumn", params);
  },

  /**
   * 保存用户表格列配置
   * @param {Object} params - 参数对象 {tableId, userId, columns}
   * @returns {Promise<boolean>} 是否成功
   */
  saveUserTableColumn: (params) => {
    return socketClient.invoke("controller/system/saveUserTableColumn", params);
  },

  /**
   * 重置用户表格列配置为默认
   * @param {Object} params - 参数对象 {tableId, userId}
   * @returns {Promise<Object>} 操作结果
   */
  resetUserTableColumn: (params) => {
    return socketClient.invoke(
      "controller/system/resetUserTableColumn",
      params
    );
  },
};
