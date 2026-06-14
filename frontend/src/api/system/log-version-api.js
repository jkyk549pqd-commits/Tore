/*
 * 日志版本管理 API
 *
 */
import { socketClient } from "/src/utils/socket-client";

export const logVersionApi = {
  /**
   * 分页查询某条日志的版本列表
   * @param {Object} params - { logId, pageNo, pageSize }
   */
  getLogVersions: (params) => {
    return socketClient.invoke("controller/system/getLogVersions", params);
  },

  /**
   * 根据ID查询版本
   */
  getLogVersionById: (id) => {
    return socketClient.invoke("controller/system/getLogVersionById", { id });
  },

  /**
   * 智能创建版本（含合并窗口逻辑）
   * @param {Object} params - { logId, content, md5, optType, message }
   */
  createVersionForLog: (params) => {
    return socketClient.invoke(
      "controller/system/createVersionForLog",
      params
    );
  },

  /**
   * 删除某条日志的所有版本
   */
  deleteLogVersionsByLogId: (logId) => {
    return socketClient.invoke(
      "controller/system/deleteLogVersionsByLogId",
      { logId }
    );
  },

  /**
   * 新增日志并创建首个版本
   */
  addLogAndVersion: (params) => {
    return socketClient.invoke("controller/system/addLogAndVersion", params);
  },

  /**
   * 获取Active版本
   * @param {number} logId - 日志ID
   */
  getActiveVersion: (logId) => {
    return socketClient.invoke("controller/system/getActiveVersion", { logId });
  },

  /**
   * 设置Active版本
   * @param {number} logId - 日志ID
   * @param {number} versionId - 版本ID
   */
  setActiveVersion: (logId, versionId) => {
    return socketClient.invoke("controller/system/setActiveVersion", {
      logId,
      versionId,
    });
  },

  /**
   * 获取日志的Active版本内容
   * @param {number} logId - 日志ID
   */
  getActiveLogContent: (logId) => {
    return socketClient.invoke("controller/system/getActiveLogContent", {
      logId,
    });
  },

  /**
   * 数据迁移:为现有数据设置最新版本为Active
   */
  migrateActiveVersions: () => {
    return socketClient.invoke("controller/system/migrateActiveVersions");
  },

  /**
   * 更新版本名称
   * @param {number} versionId - 版本ID
   * @param {string} name - 新的版本名称
   */
  updateVersionName: (versionId, name) => {
    return socketClient.invoke("controller/system/updateVersionMsg", {
      versionId,
      name,
    });
  },
};
