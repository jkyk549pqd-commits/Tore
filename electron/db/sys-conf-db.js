const { BasedbService } = require("./basedb");

/**
 * 系统配置表数据存储服务
 * @class
 */
class SysConfDbService extends BasedbService {
  constructor() {
    const options = {
      dbname: "sqlite-demo.db",
    };
    super(options);
    this.tableName = "t_sys_conf";
  }

  /**
   * 初始化表
   */
  init() {
    // 初始化数据库
    this._init();

    // 检查表是否存在
    const masterStmt = this.db.prepare(
      "SELECT * FROM sqlite_master WHERE type=? AND name = ?"
    );
    const tableExists = masterStmt.get("table", this.tableName);

    if (!tableExists) {
      // 创建表
      const create_table_sql = `CREATE TABLE ${this.tableName} 
      ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "type" TEXT, "conf_name" TEXT, "conf_key" TEXT, "conf_value" TEXT, "remark" TEXT, "user_id" INTEGER, "upd_time" DATE, "crt_time" DATE )`;

      const insert_table_sql = `
      INSERT INTO ${this.tableName}  VALUES (2, '1', 'json自动保存间隔', 'jsonAutoSaveInterval', '30', '', NULL, '2026-03-07 22:20:25', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (3, '1', '语言', 'language', 'en_US', '', NULL, '2026-05-19 19:53:34', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (4, '1', '菜单模式', 'sideMenuSingleMode', 'multi', '', NULL, '2026-05-17 18:23:20', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (5, '1', '菜单布局', 'layout', 'side', '', NULL, '2026-05-17 18:24:31', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (6, '1', '页面宽度', 'pageWidth', '99%', '', NULL, '2026-03-15 22:29:22', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (7, '1', '菜单主题', 'sideMenuTheme', 'light', '', NULL, '2026-03-08 23:02:53', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (8, '1', '面包屑', 'breadCrumbFlag', 'true', '', NULL, '2026-05-06 22:41:56', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (9, '1', '标签页', 'pageTagFlag', 'true', '', NULL, '2026-05-17 19:52:38', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (10, '1', '软件关闭时关闭全部Tab', 'keepTabsOnClose', 'true', '控制软件关闭时是否关闭全部Tab', NULL, '2026-05-23 13:23:30', '2026-05-06 22:41:48');
      INSERT INTO ${this.tableName}  VALUES (11, '1', '首页菜单布局', 'homeLayoutMode', 'compact', '首页菜单布局控制字段', NULL, '2026-05-24 20:32:33', NULL);
      INSERT INTO ${this.tableName}  VALUES (17, '1', '侧边栏宽度', 'sideMenuWidth', '202', '', NULL, '2026-03-15 22:29:48', '2026-03-04 10:01:01');
      INSERT INTO ${this.tableName}  VALUES (27, '1', '显示Tooltip', 'showTooltipsFlag', 'true', '', NULL, '2026-04-23 20:58:08', '2026-03-07 13:53:47');
      INSERT INTO ${this.tableName}  VALUES (28, '2', '复制按钮配置', 'btn_copy', '{"visible":true,"order":3}', '控制复制按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:30');
      INSERT INTO ${this.tableName}  VALUES (29, '2', '粘贴按钮配置', 'btn_paste', '{"visible":true,"order":4}', '控制粘贴按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (30, '2', '示例按钮配置', 'btn_demo', '{"visible":true,"order":5}', '控制示例按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (31, '2', '清空按钮配置', 'btn_clear', '{"visible":true,"order":6}', '控制清空按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (32, '2', '格式化按钮配置', 'btn_format', '{"visible":true,"order":7}', '控制格式化按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (33, '2', '压缩按钮配置', 'btn_compress', '{"visible":true,"order":8}', '控制压缩按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (34, '2', '排序按钮配置', 'btn_sort', '{"visible":true,"order":9}', '控制排序按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (35, '2', '添加转义按钮配置', 'btn_addEscape', '{"visible":true,"order":10}', '控制添加转义按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (36, '2', '去除转义按钮配置', 'btn_removeEscape', '{"visible":true,"order":11}', '控制去除转义按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:49');
      INSERT INTO ${this.tableName}  VALUES (40, '3', '10003表格列配置', 'table_column_config', '[{"columnKey":"id","title":"history.table.id","dataIndex":"id","width":80,"align":"center","showFlag":true,"fixed":false},{"columnKey":"type","title":"history.table.type","dataIndex":"type","width":100,"align":"center","showFlag":true,"fixed":false},{"columnKey":"optType","title":"history.table.optType","dataIndex":"optType","width":130,"align":"center","showFlag":true,"fixed":false},{"columnKey":"parentPage","title":"history.table.parentPage","dataIndex":"parentPage","width":120,"align":"center","showFlag":true,"fixed":false},{"columnKey":"tag","title":"history.table.tag","dataIndex":"tag","width":130,"align":"center","showFlag":true,"fixed":false},{"columnKey":"content","title":"history.table.content","dataIndex":"content","width":300,"align":"center","showFlag":true,"fixed":false},{"columnKey":"crtTime","title":"history.table.crtTime","dataIndex":"crtTime","width":160,"align":"center","showFlag":true,"fixed":false},{"columnKey":"updTime","title":"history.table.updTime","dataIndex":"updTime","width":160,"align":"center","showFlag":true,"fixed":false},{"columnKey":"operate","title":"history.table.operate","dataIndex":"operate","width":150,"align":"center","showFlag":true,"fixed":"right"}]', '用户自定义配置', NULL, '2026-05-10 16:59:22', '2026-01-01 00:00:00');
      INSERT INTO ${this.tableName}  VALUES (41, '2', '导入按钮配置', 'btn_import', '{"visible":true,"order":1}', '控制导入按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:30');
      INSERT INTO ${this.tableName}  VALUES (42, '2', '导出按钮配置', 'btn_export', '{"visible":true,"order":2}', '控制导出按钮的显示和顺序', NULL, '2026-05-06 22:41:48', '2026-03-15 20:21:30');
      INSERT INTO ${this.tableName}  VALUES (43, '1', '软件关闭时关闭全部Tab', 'keepTabsOnClose', 'false', '控制软件关闭时是否关闭全部Tab', NULL, '2026-05-19 20:38:44', '2026-05-06 22:41:48');
      `;
      this.db.exec(create_table_sql);
      this.db.exec(insert_table_sql);
    }
  }

  /*
   * get data dir (sqlite)
   */
  async getDataDir() {
    const dir = this.storage.getDbDir();
    return dir;
  }

  /*
   * set custom data dir (sqlite)
   */
  async setCustomDataDir(dir) {
    if (!dir) {
      return;
    }

    this.changeDataDir(dir);
    this.init();
    return;
  }

  /**
   * 查询所有配置
   * @returns {Promise<Array>} 配置列表
   */
  async getAll() {
    const selectStmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    const logs = selectStmt.all({});
    return logs;
  }

  async getByKey(confKey) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE conf_key = @conf_key`
    );
    const log = selectStmt.get({ conf_key: confKey });
    return log;
  }

  async getByType(type) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE type = @type`
    );
    const log = selectStmt.all({ type: type });
    return log;
  }

  /**
   * 根据key和userId查询配置
   * @param {string} confKey - 配置键
   * @param {number|null} userId - 用户ID,null表示全局配置
   * @returns {Promise<Object|null>} 配置对象
   */
  async getByKeyAndUser(confKey, userId) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE conf_key = @conf_key AND user_id IS @user_id`
    );
    const log = selectStmt.get({ conf_key: confKey, user_id: userId });
    return log;
  }

  /**
   * 根据type和userId查询配置列表
   * @param {string} type - 配置类型
   * @param {number|null} userId - 用户ID,null表示全局配置
   * @returns {Promise<Array>} 配置列表
   */
  async getByTypeAndUser(type, userId) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE type = @type AND user_id IS @user_id`
    );
    const list = selectStmt.all({ type: type, user_id: userId });
    return list;
  }

  /**
   * 根据ID查询配置
   * @param {number} id - 日志ID
   * @returns {Promise<Object|null>} 日志对象
   */
  async getById(id) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE id = @id`
    );
    const log = selectStmt.get({ id: id });
    return log;
  }

  /**
   * 添加配置
   * @param {Object} data - 日志数据
   * @returns {Promise<boolean>} 是否成功
   */
  async add(data) {
    const insert = this.db.prepare(
      `INSERT INTO ${this.tableName} (id, type, conf_name, conf_key, conf_value, remark, upd_time, crt_time) VALUES (@id, @type, @conf_name, @conf_key, @conf_value, @remark, @upd_time, @crt_time)`
    );
    insert.run(data);
    return true;
  }

  /**
   * 更新配置
   * @param {Object} data - 配置数据（必须包含id）
   * @returns {Promise<boolean>} 是否成功
   */
  async update(data) {
    if (!data || !data.id) {
      return false;
    }
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET type=@type, conf_name=@conf_name, conf_key=@conf_key, conf_value=@conf_value, remark=@remark, upd_time=@upd_time WHERE id=@id`
    );
    update.run(data);
    return true;
  }

  /**
   * 删除配置
   * @param {number} id - 配置ID
   * @returns {Promise<boolean>} 是否成功
   */
  async delete(id) {
    if (!id) {
      return false;
    }
    const deleteStmt = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE id = @id`
    );
    deleteStmt.run({ id: id });
    return true;
  }

  /**
   * 分页查询配置
   *
   */
  async getPage(params) {
    const { pageNo = 1, pageSize = 10, type, conf_name, conf_key } = params;

    // 构建 WHERE 条件和参数
    const conditions = [];
    const queryParams = {};

    if (type) {
      conditions.push("type LIKE @type");
      queryParams.type = `%${type}%`;
    }
    if (conf_name) {
      conditions.push("conf_name LIKE @conf_name");
      queryParams.conf_name = `%${conf_name}%`;
    }
    if (conf_key) {
      conditions.push("conf_key LIKE @conf_key");
      queryParams.conf_key = `%${conf_key}%`;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 查询总数
    const countStmt = this.db.prepare(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`
    );
    const countResult = countStmt.get(queryParams);
    const total = countResult ? countResult.total : 0;

    // 查询分页数据
    const offset = (pageNo - 1) * pageSize;
    const listStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY id DESC LIMIT @pageSize OFFSET @offset`
    );
    const list = listStmt.all({ ...queryParams, pageSize, offset });

    return {
      list,
      total,
    };
  }

  /**
   * 获取数据目录
   * @returns {Promise<string>} 数据目录路径
   */
  async getDataDir() {
    const dir = this.storage.getDbDir();
    return dir;
  }
}

SysConfDbService.toString = () => "[class SysConfDbService]";

let sysConfDbServiceInstance = null;

module.exports = {
  SysConfDbService,
  get sysConfDbService() {
    if (!sysConfDbServiceInstance) {
      sysConfDbServiceInstance = new SysConfDbService();
    }
    return sysConfDbServiceInstance;
  },
};
