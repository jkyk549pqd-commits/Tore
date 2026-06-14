"use strict";

const { logger } = require("ee-core/log");
const { systemService } = require("../service/system");

/**
 * System
 * @class
 */
class SystemController {
  
  // ==================== 系统主题 控制器方法 ====================
  async setWindowBackgroundColor(args, event) {
    const result = await systemService.setWindowBackgroundColor(args, event);
    // logger.info("setWindowBackgroundColor result:", result);
    return result;
  }

  // ==================== SysConf CRUD 控制器方法 ====================
  async getConfByType(args, event) {
    const result = await systemService.getConfByType(args);
    // logger.info("systemService result:", result);
    return result;
  }

  /**
   * 批量更新用户配置
   * @param {Object} args - 配置对象，key 为 conf_key，value 为要更新的值
   * @example
   */
  async updateBatchConf(args, event) {
    const result = await systemService.updateBatchConf(args);
    return result;
  }

  async updateConf(args, event) {
    const result = await systemService.updateConf(args);
    return result;
  }

  // ==================== SysMenu CRUD 控制器方法 ====================
  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */
  async getMenus(args, event) {
    const result = await systemService.getMenus();
    // logger.info("systemService result:", result);
    return result;
  }

  /**
   * 根据ID查询菜单
   */
  async getMenuById(args, event) {
    return await systemService.getMenuById(args);
  }

  /**
   * 添加菜单
   */
  async addMenu(args, event) {
    return await systemService.addMenu(args);
  }

  /**
   * 更新菜单
   */
  async updateMenu(args, event) {
    return await systemService.updateMenu(args);
  }

  /**
   * 删除菜单
   */
  async deleteMenu(args, event) {
    return await systemService.deleteMenu(args);
  }

  /**
   * 根据父ID查询子菜单
   */
  async getMenusByParentId(args, event) {
    return await systemService.getMenusByParentId(args);
  }

  // ==================== SysLog CRUD 控制器方法 ====================

  /**
   * 查询所有日志
   */
  async getAllLogs(args, event) {
    return await systemService.getAllLogs(args);
  }

  /**
   * 根据MD5查询日志
   */
  async getLogByMd5(args, event) {
    return await systemService.getLogByMd5(args);
  }

  /**
   * 根据ID查询日志
   */
  async getLogById(args, event) {
    return await systemService.getLogById(args);
  }

  /**
   * 添加日志
   */
  async addLog(args, event) {
    return await systemService.addLog(args);
  }

  /**
   * 更新日志
   */
  async updateLog(args, event) {
    return await systemService.updateLog(args);
  }

  async updateLogParent(args, event) {
    return await systemService.updateLogParent(args);
  }

  /**
   * 删除日志
   */
  async deleteLog(args, event) {
    return await systemService.deleteLog(args);
  }

  /**
   * 根据类型查询日志
   */
  async getLogsByType(args, event) {
    return await systemService.getLogsByType(args);
  }

  /**
   * 根据操作类型查询日志
   */
  async getLogsByOptType(args, event) {
    return await systemService.getLogsByOptType(args);
  }

  /**
   * 根据标签查询日志
   */
  async getLogsByTag(args, event) {
    return await systemService.getLogsByTag(args);
  }

  /**
   * 根据父级查询日志
   */
  async getLogsByParent(args, event) {
    return await systemService.getLogsByParent(args);
  }

  /**
   * 分页查询日志
   */
  async getLogsPage(args, event) {
    return await systemService.getLogsPage(args);
  }

  /**
   * 全文检索日志
   */
  async searchLogsByKeyword(args, event) {
    return await systemService.searchLogsByKeyword(args);
  }

  // ==================== TableColumn 配置控制器方法 ====================

  /**
   * 获取用户表格列配置
   * @param {Object} args - 参数对象 {tableId, userId}
   */
  async getUserTableColumn(args, event) {
    return await systemService.getUserTableColumn(args);
  }

  /**
   * 保存用户表格列配置
   * @param {Object} args - 参数对象 {tableId, userId, columns}
   */
  async saveUserTableColumn(args, event) {
    return await systemService.saveUserTableColumn(args);
  }

  /**
   * 重置用户表格列配置
   * @param {Object} args - 参数对象 {tableId, userId}
   */
  async resetUserTableColumn(args, event) {
    return await systemService.resetUserTableColumn(args);
  }

  // ==================== LogVersion 版本管理控制器方法 ====================

  async getLogVersions(args, event) {
    return await systemService.getLogVersions(args);
  }

  async getLogVersionById(args, event) {
    return await systemService.getLogVersionById(args);
  }

  async createVersionForLog(args, event) {
    return await systemService.createVersionForLog(args);
  }

  async deleteLogVersionsByLogId(args, event) {
    return await systemService.deleteLogVersionsByLogId(args);
  }

  async deleteLogVersionsByVerLogId(args, event) {
    return await systemService.deleteLogVersionsByVerLogId(args);
  }

  async addLogAndVersion(args, event) {
    return await systemService.addLogAndVersion(args);
  }

  async updateVersionMsg(args, event) {
    return await systemService.updateVersionMsg(args);
  }

  async getActiveVersion(args, event) {
    return await systemService.getActiveVersion(args);
  }

  async setActiveVersion(args, event) {
    return await systemService.setActiveVersion(args);
  }

  async getActiveLogContent(args, event) {
    return await systemService.getActiveLogContent(args);
  }

  async migrateActiveVersions(args, event) {
    return await systemService.migrateActiveVersions();
  }

  // ==================== TabState 标签页状态持久化控制器方法 ====================

  async saveTabStates(args, event) {
    return await systemService.saveTabStates(args);
  }

  async loadTabStates(args, event) {
    return await systemService.loadTabStates();
  }

  async clearTabStates(args, event) {
    return await systemService.clearTabStates();
  }
}
SystemController.toString = () => "[class SystemController]";

module.exports = SystemController;
