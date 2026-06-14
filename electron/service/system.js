"use strict";

const { logger } = require("ee-core/log");
const { getBeijingTime } = require("./util");
const { getDataDir } = require("ee-core/ps");

/**
 * 系统基础服务
 * @class
 */
class SystemService {
  constructor() {
    this._sysMenuDbService = null;
    this._sysLogDbService = null;
    this._sysConfDbService = null;
    this._dataDir = null;
    this._initialized = false;
  }

  /**
   * 初始化数据库服务
   * @private
   */
  async _initializeServices() {
    if (this._initialized) {
      return;
    }
    if (!this._dataDir) {
      this._dataDir = getDataDir();
    }
    const { sysMenuDbService } = require("../db/sys-menu-db");
    const { sysLogDbService } = require("../db/sys-log-db");
    const { sysConfDbService } = require("../db/sys-conf-db");
    const { sysLogVersionDbService } = require("../db/sys-log-version-db");
    const { sysTabStateDbService } = require("../db/sys-tab-state-db");

    sysMenuDbService.setCustomDataDir(this._dataDir);
    sysLogDbService.setCustomDataDir(this._dataDir);
    sysConfDbService.setCustomDataDir(this._dataDir);
    sysLogVersionDbService.setCustomDataDir(this._dataDir);
    sysTabStateDbService.setCustomDataDir(this._dataDir);

    this._sysMenuDbService = sysMenuDbService;
    this._sysLogDbService = sysLogDbService;
    this._sysConfDbService = sysConfDbService;
    this._sysLogVersionDbService = sysLogVersionDbService;
    this._sysTabStateDbService = sysTabStateDbService;
    this._initialized = true;
  }

  // 在 electron/service/system.js 中添加方法
  async setWindowBackgroundColor(args, event) {
    const { color } = args;
    const win = event.sender.getOwnerBrowserWindow();
    if (win) {
      // 设置窗口背景色
      win.setBackgroundColor(color);
      // Windows 11 特有：使用 Mica 效果来增强主题同步
      if (process.platform === "win32") {
        const isDark =
          color.toLowerCase().startsWith("#1") ||
          color.toLowerCase().startsWith("#2") ||
          color.toLowerCase().startsWith("#0");

        // 尝试使用 Windows 11 的原生主题
        try {
          const { nativeTheme } = require("electron");
          nativeTheme.themeSource = isDark ? "dark" : "light";
        } catch (error) {
          logger.warn("设置系统主题失败:", error.message);
        }
      }
      return { success: true };
    }
    return { success: false };
  }

  /**
   * 确保服务已初始化
   * @private
   */
  async _ensureInitialized() {
    if (!this._initialized) {
      await this._initializeServices();
    }
  }
  // ==================== SysConf CRUD 操作 ====================
  async getAllConfs(args) {
    await this._ensureInitialized();
    let obj = this._sysConfDbService.getAll();

    return obj;
  }

  async getConfByType(args) {
    await this._ensureInitialized();
    let obj = this._sysConfDbService.getByType(args.type);

    return obj;
  }

  async getConfById(args) {
    await this._ensureInitialized();
    let obj = this._sysConfDbService.getById(args.id);

    return obj;
  }

  async updateConf(args) {
    await this._ensureInitialized();
    const key = Object.keys(args);

    // 检查参数是否有效
    if (!key || key.length === 0) {
      throw new Error("更新配置失败：参数无效，缺少配置键");
    }

    const conf = await this._sysConfDbService.getByKey(key[0]);

    // 检查配置是否存在
    if (!conf) {
      logger.error(`配置键 ${key[0]} 不存在`);
      throw new Error(`配置键 ${key[0]} 不存在，无法更新`);
    }

    const now = getBeijingTime();
    const updateData = {
      id: conf.id,
      type: conf.type,
      conf_name: conf.conf_name,
      conf_key: conf.conf_key,
      conf_value: String(args[key]),
      remark: conf.remark || "",
      upd_time: now,
    };
    logger.info("updateData:", updateData);
    return this._sysConfDbService.update(updateData);
  }

  async updateBatchConf(configMap) {
    await this._ensureInitialized();

    if (!configMap || typeof configMap !== "object") {
      throw new Error("配置参数无效");
    }

    const keys = Object.keys(configMap);
    if (keys.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // 获取所有配置，建立 conf_key 到 id 的映射
    const allConfs = await this._sysConfDbService.getAll();
    const keyToIdMap = {};
    allConfs.forEach((conf) => {
      if (conf.conf_key) {
        keyToIdMap[conf.conf_key] = conf;
      }
    });

    const now = getBeijingTime();

    // 遍历所有需要更新的配置
    for (const key of keys) {
      try {
        const value = configMap[key];
        const existingConf = keyToIdMap[key];

        if (existingConf) {
          // 配置已存在，执行更新
          const updateData = {
            id: existingConf.id,
            type: existingConf.type,
            conf_name: existingConf.conf_name,
            conf_key: key,
            conf_value: String(value),
            remark: existingConf.remark || "",
            upd_time: now,
          };

          await this._sysConfDbService.update(updateData);
          successCount++;
        } else {
          // 配置不存在，执行插入
          const insertData = {
            id: null,
            type: "user_config",
            conf_name: key,
            conf_key: key,
            conf_value: String(value),
            remark: "用户配置",
            upd_time: now,
            crt_time: now,
          };

          await this._sysConfDbService.add(insertData);
          successCount++;
        }
      } catch (error) {
        failedCount++;
        errors.push({
          key: key,
          value: configMap[key],
          error: error.message,
        });
        logger.error(`更新配置 ${key} 失败:`, error);
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      errors: errors,
    };
  }

  async deleteConf(args) {
    await this._ensureInitialized();
    return this._sysConfDbService.delete(args.id);
  }

  // ==================== SysMenu CRUD 操作 ====================
  async getMenus(args) {
    // logger.info("SystemService args:", args);

    await this._ensureInitialized();
    let obj = this._sysMenuDbService.getAll();

    return obj;
  }

  /**
   * 根据ID查询菜单
   * @param {Object} args - 参数对象
   * @param {number} args.menuId - 菜单ID
   * @returns {Promise<Object|null>} 菜单对象
   */
  async getMenuById(args) {
    await this._ensureInitialized();
    return this._sysMenuDbService.getById(args.menuId);
  }

  /**
   * 添加菜单
   * @param {Object} args - 菜单数据
   * @returns {Promise<boolean>} 是否成功
   */
  async addMenu(args) {
    await this._ensureInitialized();
    return this._sysMenuDbService.add(args);
  }

  /**
   * 更新菜单
   * @param {Object} args - 菜单数据（必须包含menu_id）
   * @returns {Promise<boolean>} 是否成功
   */
  async updateMenu(args) {
    await this._ensureInitialized();
    return this._sysMenuDbService.update(args);
  }

  /**
   * 删除菜单
   * @param {Object} args - 参数对象
   * @param {number} args.menuId - 菜单ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteMenu(args) {
    await this._ensureInitialized();
    return this._sysMenuDbService.delete(args.menuId);
  }

  /**
   * 根据父ID查询子菜单
   * @param {Object} args - 参数对象
   * @param {number} args.parentId - 父菜单ID
   * @returns {Promise<Array>} 子菜单列表
   */
  async getMenusByParentId(args) {
    await this._ensureInitialized();
    return this._sysMenuDbService.getByParentId(args.parentId);
  }

  // ==================== SysLog CRUD 操作 ====================

  /**
   * 查询所有日志
   * @returns {Promise<Array>} 日志列表
   */
  async getAllLogs(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getAll();
  }

  /**
   * 根据MD5查询日志
   * @param {Object} args - 参数对象
   * @param {number} args.id - 日志ID
   * @returns {Promise<Object|null>} 日志对象
   */
  async getLogByMd5(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getByMd5(args);
  }

  /**
   * 根据ID查询日志
   * @param {Object} args - 参数对象
   * @param {number} args.id - 日志ID
   * @returns {Promise<Object|null>} 日志对象
   */
  async getLogById(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getById(args.id);
  }

  /**
   * 添加日志
   * @param {Object} args - 日志数据
   * @returns {Promise<boolean>} 是否成功
   */
  async addLog(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.add(args);
  }

  /**
   * 更新日志
   * @param {Object} args - 日志数据（必须包含id）
   * @returns {Promise<boolean>} 是否成功
   */
  async updateLog(args) {
    await this._ensureInitialized();
    const { id, type, opt_type, parent_page, tag, content } = args;
    const now = getBeijingTime();
    const updateData = {
      id: id,
      type: type,
      opt_type: opt_type,
      parent_page: parent_page,
      tag: tag,
      content: content,
      upd_time: now,
    };
    console.log("service updateLog:", updateData);
    return this._sysLogDbService.update(updateData);
  }

  async updateLogParent(args) {
    await this._ensureInitialized();
    const { id, parent_page } = args;
    const now = getBeijingTime();
    const updateData = {
      id: id,
      parent_page: parent_page,
      upd_time: now,
    };
    return this._sysLogDbService.updateParent(updateData);
  }

  /**
   * 删除日志
   * @param {Object} args - 参数对象
   * @param {number} args.id - 日志ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteLog(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.delete(args.id);
  }

  /**
   * 根据类型查询日志
   * @param {Object} args - 参数对象
   * @param {string} args.type - 日志类型
   * @returns {Promise<Array>} 日志列表
   */
  async getLogsByType(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getByType(args.type);
  }

  /**
   * 根据操作类型查询日志
   * @param {Object} args - 参数对象
   * @param {string} args.optType - 操作类型
   * @returns {Promise<Array>} 日志列表
   */
  async getLogsByOptType(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getByOptType(args.optType);
  }

  /**
   * 根据标签查询日志
   * @param {Object} args - 参数对象
   * @param {string} args.tag - 标签
   * @returns {Promise<Array>} 日志列表
   */
  async getLogsByTag(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getByTag(args.tag);
  }

  /**
   * 根据父级查询日志
   * @param {Object} args - 参数对象
   * @param {string} args.parent - 父级
   * @returns {Promise<Array>} 日志列表
   */
  async getLogsByParent(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getByParent(args.parentPage);
  }

  /**
   * 分页查询日志
   * @param {Object} args - 查询参数
   * @param {number} args.pageNo - 当前页码（从1开始）
   * @param {number} args.pageSize - 每页大小
   * @param {string} [args.type] - 日志类型（可选，模糊查询）
   * @param {string} [args.optType] - 操作类型（可选，模糊查询）
   * @param {string} [args.tag] - 标签（可选，模糊查询）
   * @param {string} [args.parent] - 父级（可选，模糊查询）
   * @returns {Promise<Object>} 返回对象包含 { list: Array, total: number }
   */
  async getLogsPage(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.getPage(args);
  }

  /**
   * 全文检索日志
   * @param {Object} args - 查询参数
   * @param {string} args.keyword - 搜索关键词
   * @param {number} args.pageNo - 当前页码（从1开始）
   * @param {number} args.pageSize - 每页大小
   * @param {string} [args.type] - 日志类型（可选，模糊查询）
   * @param {string} [args.optType] - 操作类型（可选，模糊查询）
   * @param {string} [args.tag] - 标签（可选，模糊查询）
   * @param {string} [args.parent] - 父级（可选，模糊查询）
   * @returns {Promise<Object>} 返回对象包含 { list: Array, total: number }
   */
  async searchLogsByKeyword(args) {
    await this._ensureInitialized();
    return this._sysLogDbService.searchByKeyword(args);
  }

  // ==================== TableColumn 配置服务方法 ====================

  /**
   * 获取用户表格列配置
   * @param {Object} args - 参数对象 {tableId, userId}
   * @returns {Promise<Object>} 配置对象
   */
  async getUserTableColumn(args) {
    await this._ensureInitialized();
    const { tableId, userId } = args;
    const configKey = `table_column_config`;

    // 先查找用户特定配置
    let config = await this._sysConfDbService.getByKeyAndUser(
      configKey,
      userId
    );

    // 如果没有用户配置,使用类型查询3
    if (!config) {
      config = await this._sysConfDbService.getByType("3");
    }

    return config;
  }

  /**
   * 保存用户表格列配置
   * @param {Object} args - 参数对象 {tableId, userId, columns}
   * @returns {Promise<boolean>} 是否成功
   */
  async saveUserTableColumn(args) {
    await this._ensureInitialized();
    const { tableId, userId, columns } = args;
    const configKey = `table_column_config`;
    const now = getBeijingTime();

    // 检查是否已存在用户配置
    let config = await this._sysConfDbService.getByKeyAndUser(
      configKey,
      userId
    );

    if (config) {
      // 更新现有配置
      const updateData = {
        id: config.id,
        type: "3",
        conf_name: `${tableId}表格列配置`,
        conf_key: configKey,
        conf_value: JSON.stringify(columns),
        user_id: userId,
        remark: "用户自定义配置",
        upd_time: now,
      };
      return this._sysConfDbService.update(updateData);
    } else {
      // 创建新配置
      const addData = {
        type: "3",
        conf_name: `${tableId}表格列配置`,
        conf_key: configKey,
        conf_value: JSON.stringify(columns),
        user_id: userId,
        remark: "用户自定义配置",
        crt_time: now,
        upd_time: now,
      };
      return this._sysConfDbService.add(addData);
    }
  }

  /**
   * 重置用户表格列配置为默认
   * @param {Object} args - 参数对象 {tableId, userId}
   * @returns {Promise<Object>} 操作结果
   */
  async resetUserTableColumn(args) {
    await this._ensureInitialized();
    const { tableId, userId } = args;
    const configKey = `table_column_config`;
    const now = getBeijingTime();

    // 删除用户配置
    let config = await this._sysConfDbService.getByKeyAndUser(
      configKey,
      userId
    );
    if (config) {
      let colStr = [
        {
          columnKey: "id",
          title: "history.table.id",
          dataIndex: "id",
          width: 80,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "type",
          title: "history.table.type",
          dataIndex: "type",
          width: 120,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "optType",
          title: "history.table.optType",
          dataIndex: "optType",
          width: 120,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "parentPage",
          title: "history.table.parentPage",
          dataIndex: "parentPage",
          width: 120,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "tag",
          title: "history.table.tag",
          dataIndex: "tag",
          width: 120,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "content",
          title: "history.table.content",
          dataIndex: "content",
          width: 300,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "crtTime",
          title: "history.table.crtTime",
          dataIndex: "crtTime",
          width: 160,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "updTime",
          title: "history.table.updTime",
          dataIndex: "updTime",
          width: 160,
          align: "center",
          showFlag: true,
          fixed: false,
        },
        {
          columnKey: "operate",
          title: "history.table.operate",
          dataIndex: "operate",
          width: 110,
          align: "center",
          showFlag: true,
          fixed: "right",
        },
      ];
      const updateData = {
        id: config.id,
        type: "3",
        conf_name: "历史日志表格列配置",
        conf_key: configKey,
        conf_value: JSON.stringify(colStr),
        user_id: userId,
        remark: "系统默认配置,用户首次使用时创建",
        upd_time: now,
      };
      await this._sysConfDbService.update(updateData);
    }

    return { success: true };
  }

  // ==================== LogVersion 版本管理操作 ====================

  /**
   * 分页查询某条日志的版本列表
   */
  async getLogVersions(args) {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.getPageByLogId(args);
  }

  /**
   * 根据ID查询版本
   */
  async getLogVersionById(args) {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.getById(args.id);
  }

  /**
   * 智能创建版本（含合并窗口逻辑）
   * @param {Object} args
   * @param {number} args.fromPage - 来源页面（用于日志记录）; 1-Text页面, 2-详情页面
   * @param {number} args.logId - 日志ID
   * @param {string} args.content - 内容
   * @param {string} args.md5 - 内容哈希
   * @param {string} args.optType - "AUTO" | "MANUAL"
   * @param {string} [args.message] - 版本备注
   * @param {number} [args.mergeWindowMinutes=5] - 合并窗口（分钟）
   */
  async createVersionForLog(args) {
    await this._ensureInitialized();
    const {
      fromPage,
      logId,
      content,
      md5,
      optType,
      type,
      message,
      mergeWindowMinutes = 5,
    } = args;

    const latest = await this._sysLogVersionDbService.getLatestByLogId(logId);

    // MD5 相同则跳过
    if (latest && latest.md5 === md5) {
      return { skipped: true };
    }

    // AUTO 类型且在合并窗口内 → 更新现有版本
    if (optType === "AUTO" && latest && latest.opt_type === "AUTO") {
      const lastTime = new Date(latest.crt_time).getTime();
      const now = Date.now();
      if (now - lastTime < mergeWindowMinutes * 60 * 1000) {
        await this._sysLogVersionDbService.update({
          id: latest.id,
          content,
          md5,
          crt_time: getBeijingTime(),
        });
        return { merged: true, versionId: latest.id };
      }
    }

    // 创建新版本
    const versionNo = latest ? latest.version_no + 1 : 1;
    if (versionNo.value == 1) {
      await this._sysLogVersionDbService.add({
        log_id: logId,
        version_no: versionNo,
        opt_type: optType,
        type: type || "TEXT",
        message: message || null,
        content,
        md5,
        crt_time: getBeijingTime(),
        is_active: 1,
      });
    } else {
      if (fromPage && fromPage == 1) {
        await this._sysLogVersionDbService.add({
          log_id: logId,
          version_no: versionNo,
          opt_type: optType,
          type: type || "TEXT",
          message: message || null,
          content,
          md5,
          crt_time: getBeijingTime(),
          is_active: 0,
        });
      } else {
        await this._sysLogVersionDbService.updateInactive({
          log_id: logId,
        });
        await this._sysLogVersionDbService.add({
          log_id: logId,
          version_no: versionNo,
          opt_type: optType,
          type: type || "TEXT",
          message: message || null,
          content,
          md5,
          crt_time: getBeijingTime(),
          is_active: 1,
        });
      }
    }
    return { created: true, versionNo };
  }

  async updateVersionMsg(args) {
    await this._ensureInitialized();
    const { versionId, name } = args;
    return this._sysLogVersionDbService.updateMessage({
      id: versionId,
      message: name,
      crt_time: getBeijingTime(),
    });
  }

  /**
   * 删除某条日志的所有版本
   */
  async deleteLogVersionsByLogId(args) {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.deleteByLogId(args.logId);
  }

  async deleteLogVersionsByVerLogId(args) {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.deleteByVersionLogId(args.verLogId);
  }

  /**
   * 新增日志并创建首个版本（原子操作）
   */
  async addLogAndVersion(args) {
    await this._ensureInitialized();
    const {
      type,
      opt_type,
      parent_page,
      tag,
      content,
      md5,
      crt_time,
      upd_time,
      optType,
      message,
    } = args;

    const logId = await this._sysLogDbService.addAndReturnId({
      type,
      opt_type,
      parent_page,
      tag,
      content,
      md5,
      crt_time,
      upd_time,
    });

    await this._sysLogVersionDbService.add({
      log_id: logId,
      version_no: 1,
      opt_type: optType || (opt_type === "1" ? "AUTO" : "MANUAL"),
      type: type || "TEXT",
      message: message || null,
      content,
      md5,
      crt_time: crt_time,
      is_active: 1,
    });

    return { logId, versionNo: 1 };
  }

  /**
   * 获取某条日志的Active版本
   * @param {Object} args
   * @param {number} args.logId - 日志ID
   * @returns {Promise<Object|null>} 返回Active版本对象或null
   */
  async getActiveVersion(args) {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.getActiveByLogId(args.logId);
  }

  /**
   * 设置某条日志的Active版本
   * @param {Object} args
   * @param {number} args.logId - 日志ID
   * @param {number} args.versionId - 版本ID
   * @returns {Promise<boolean>} 是否设置成功
   */
  async setActiveVersion(args) {
    await this._ensureInitialized();
    const { logId, versionId } = args;
    return this._sysLogVersionDbService.setActiveVersion(versionId, logId);
  }

  /**
   * 获取某条日志的Active版本内容
   * @param {Object} args
   * @param {number} args.logId - 日志ID
   * @returns {Promise<Object|null>} 返回包含content的对象或null
   */
  async getActiveLogContent(args) {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.getActiveContentByLogId(args.logId);
  }

  /**
   * 数据迁移:为现有数据设置最新版本为Active
   * @returns {Promise<number>} 返回迁移的记录数
   */
  async migrateActiveVersions() {
    await this._ensureInitialized();
    return this._sysLogVersionDbService.migrateExistingData();
  }

  // ==================== TabState 标签页状态持久化 ====================

  /**
   * 保存标签页状态(批量, 至多 20 条)
   * @param {{list: Array<{stateKey:string, content:object}>}} args
   */
  async saveTabStates(args) {
    await this._ensureInitialized();
    const list = Array.isArray(args && args.list) ? args.list : [];
    const now = getBeijingTime();
    const rows = list.slice(0, 20).map((it) => ({
      state_key: String(it.stateKey || ""),
      content:
        typeof it.content === "string"
          ? it.content
          : JSON.stringify(it.content || {}),
      crt_time: now,
    }));
    return this._sysTabStateDbService.saveAll(rows);
  }

  /**
   * 加载标签页状态
   * @returns {Promise<Array<{stateKey:string, content:object}>>}
   */
  async loadTabStates() {
    await this._ensureInitialized();
    const rows = await this._sysTabStateDbService.getAll();
    return (rows || []).map((r) => {
      let content = null;
      try {
        content = r.content ? JSON.parse(r.content) : null;
      } catch (e) {
        logger.warn("loadTabStates parse content failed:", e.message);
      }
      return { stateKey: r.state_key, content };
    });
  }

  /**
   * 清空标签页状态
   */
  async clearTabStates() {
    await this._ensureInitialized();
    return this._sysTabStateDbService.clearAll();
  }
}
SystemService.toString = () => "[class SystemService]";

module.exports = {
  SystemService,
  systemService: new SystemService(),
};
