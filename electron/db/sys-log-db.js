const { BasedbService } = require("./basedb");

/**
 * 系统日志表数据存储服务
 * @class
 */
class SysLogDbService extends BasedbService {
  constructor() {
    const options = {
      dbname: "sqlite-demo.db",
    };
    super(options);
    this.tableName = "t_sys_log";
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
      ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "type" TEXT, "opt_type" TEXT, "parent_page" TEXT, "tag" TEXT, "content" TEXT, "md5" TEXT,"upd_time" DATE, "crt_time" DATE )`;
      this.db.exec(create_table_sql);
    }

    // 初始化FTS5全文搜索表
    this._initFts5Table();
  }

  /**
   * 初始化FTS5全文搜索表
   * @private
   */
  _initFts5Table() {
    const ftsTableName = "t_sys_log_fts";

    // 检查FTS表是否存在
    const masterStmt = this.db.prepare(
      "SELECT * FROM sqlite_master WHERE type='table' AND name = ?"
    );
    const ftsTableExists = masterStmt.get(ftsTableName);

    if (!ftsTableExists) {
      // 创建FTS5虚拟表（使用porter tokenizer进行英文分词，对中文也有效）
      const createFtsTableSql = `CREATE VIRTUAL TABLE ${ftsTableName} USING fts5(
        content
      )`;
      this.db.exec(createFtsTableSql);

      // 创建插入触发器
      const insertTriggerSql = `
        CREATE TRIGGER IF NOT EXISTS sys_log_ai AFTER INSERT ON ${this.tableName}
        BEGIN
          INSERT INTO ${ftsTableName}(rowid, content)
          VALUES (new.id, new.content);
        END
      `;
      this.db.exec(insertTriggerSql);

      // 创建更新触发器
      const updateTriggerSql = `
        CREATE TRIGGER IF NOT EXISTS sys_log_au AFTER UPDATE ON ${this.tableName}
        BEGIN
          UPDATE ${ftsTableName} SET content = new.content WHERE rowid = new.id;
        END
      `;
      this.db.exec(updateTriggerSql);

      // 创建删除触发器
      const deleteTriggerSql = `
        CREATE TRIGGER IF NOT EXISTS sys_log_ad AFTER DELETE ON ${this.tableName}
        BEGIN
          DELETE FROM ${ftsTableName} WHERE rowid = old.id;
        END
      `;
      this.db.exec(deleteTriggerSql);

      // 同步现有数据到FTS表
      const syncDataSql = `
        INSERT INTO ${ftsTableName}(rowid, content)
        SELECT id, content FROM ${this.tableName}
      `;
      try {
        this.db.exec(syncDataSql);
      } catch (error) {
        // 如果同步失败，可能是因为没有数据或数据已存在，忽略错误
        console.log("同步现有数据到FTS表:", error.message);
      }
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
   * 查询所有日志
   * @returns {Promise<Array>} 日志列表
   */
  async getAll() {
    const selectStmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    const logs = selectStmt.all({});
    return logs;
  }

  /**
   * 根据MD5查询日志
   * @param {number} id - 日志ID
   * @returns {Promise<Object|null>} 日志对象
   */
  async getByMd5(args) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE md5 = @key and tag = @tag`
    );
    const log = selectStmt.get(args);
    return log;
  }

  /**
   * 根据ID查询日志
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
   * 添加日志
   * @param {Object} data - 日志数据
   * @returns {Promise<boolean>} 是否成功
   */
  async add(data) {
    const insert = this.db.prepare(
      `INSERT INTO ${this.tableName} (type, opt_type, parent_page, tag, content, md5, upd_time, crt_time) VALUES (@type, @opt_type, @parent_page, @tag, @content, @md5, @upd_time, @crt_time)`
    );
    insert.run(data);
    return true;
  }

  /**
   * 添加日志并返回插入的ID
   * @param {Object} data - 日志数据
   * @returns {Promise<number>} 插入的记录ID
   */
  async addAndReturnId(data) {
    const insert = this.db.prepare(
      `INSERT INTO ${this.tableName} (type, opt_type, parent_page, tag, content, md5, upd_time, crt_time) VALUES (@type, @opt_type, @parent_page, @tag, @content, @md5, @upd_time, @crt_time)`
    );
    const result = insert.run(data);
    return Number(result.lastInsertRowid);
  }

  async updateParent(data) {
    if (!data || !data.id) {
      return false;
    }
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET parent_page=@parent_page, upd_time=@upd_time WHERE id=@id`
    );
    update.run(data);
    return true;
  }

  /**
   * 更新日志
   * @param {Object} data - 日志数据（必须包含id）
   * @returns {Promise<boolean>} 是否成功
   */
  async update(data) {
    if (!data || !data.id) {
      return false;
    }
    console.log("db data:", data);
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET type=@type, opt_type=@opt_type, parent_page=@parent_page, tag=@tag, content=@content, upd_time=@upd_time WHERE id=@id`
    );
    update.run(data);
    return true;
  }

  /**
   * 删除日志
   * @param {number} id - 日志ID
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
   * 根据类型查询日志
   * @param {string} type - 日志类型
   * @returns {Promise<Array>} 日志列表
   */
  async getByType(type) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE type = @type`
    );
    const logs = selectStmt.all({ type: type });
    return logs;
  }

  /**
   * 根据操作类型查询日志
   * @param {string} optType - 操作类型
   * @returns {Promise<Array>} 日志列表
   */
  async getByOptType(optType) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE opt_type = @opt_type`
    );
    const logs = selectStmt.all({ opt_type: optType });
    return logs;
  }

  /**
   * 根据标签查询日志
   * @param {string} tag - 标签
   * @returns {Promise<Array>} 日志列表
   */
  async getByTag(tag) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE tag = @tag`
    );
    const logs = selectStmt.all({ tag: tag });
    return logs;
  }

  /**
   * 根据父级查询日志
   * @param {string} parent - 父级
   * @returns {Promise<Array>} 日志列表
   */
  async getByParent(parent) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE parent_page = @parent`
    );
    const logs = selectStmt.all({ parent: parent });
    return logs;
  }

  /**
   * 分页查询日志
   * @param {Object} params - 查询参数
   * @param {number} params.pageNo - 当前页码（从1开始）
   * @param {number} params.pageSize - 每页大小
   * @param {string} [params.type] - 日志类型（可选，模糊查询）
   * @param {string} [params.optType] - 操作类型（可选，模糊查询）
   * @param {string} [params.tag] - 标签（可选，模糊查询）
   * @param {string} [params.parent] - 父级（可选，模糊查询）
   * @param {string} [params.content] - 内容关键词（可选，模糊查询）
   * @returns {Promise<Object>} 返回对象包含 { list: Array, total: number }
   */
  async getPage(params) {
    const {
      pageNo = 1,
      pageSize = 10,
      type,
      optType,
      tag,
      parentPage,
      content,
    } = params;

    console.log("params:", params);

    // 构建 WHERE 条件和参数
    const conditions = [];
    const queryParams = {};

    if (type) {
      conditions.push("type LIKE @type");
      queryParams.type = `%${type}%`;
    }
    if (optType) {
      conditions.push("opt_type LIKE @optType");
      queryParams.optType = `%${optType}%`;
    }
    if (tag) {
      conditions.push("tag LIKE @tag");
      queryParams.tag = `%${tag}%`;
    }
    if (parentPage) {
      conditions.push("parent_page LIKE @parentPage");
      queryParams.parentPage = `%${parentPage}%`;
    }
    if (content) {
      conditions.push("content LIKE @content");
      queryParams.content = `%${content}%`;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 查询总数（单表查询，无需别名）
    const countStmt = this.db.prepare(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`
    );
    const countResult = countStmt.get(queryParams);
    const total = countResult ? countResult.total : 0;

    // 查询分页数据,关联Active版本内容（需要使用别名解决列名冲突）
    const offset = (pageNo - 1) * pageSize;

    // 构建 JOIN 查询专用的 WHERE 子句（使用表别名 l.）
    const joinConditions = [];
    if (type) {
      joinConditions.push("l.type LIKE @type");
    }
    if (optType) {
      joinConditions.push("l.opt_type LIKE @optType");
    }
    if (tag) {
      joinConditions.push("l.tag LIKE @tag");
    }
    if (parentPage) {
      joinConditions.push("l.parent_page LIKE @parentPage");
    }
    if (content) {
      joinConditions.push("l.content LIKE @content");
    }
    const joinWhereClause =
      joinConditions.length > 0 ? `WHERE ${joinConditions.join(" AND ")}` : "";

    const listStmt = this.db.prepare(
      `SELECT l.*, v.content as active_content, v.id as active_version_id, v.version_no as active_version_no
       FROM ${this.tableName} l
       LEFT JOIN t_sys_log_version v ON l.id = v.log_id AND v.is_active = 1
       ${joinWhereClause}
       ORDER BY l.id DESC LIMIT @pageSize OFFSET @offset`
    );
    console.log("listStmt:", listStmt);
    const list = listStmt.all({ ...queryParams, pageSize, offset });

    return {
      list,
      total,
    };
  }

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
  async searchByKeyword(params) {
    const {
      keyword = "",
      pageNo = 1,
      pageSize = 10,
      type,
      optType,
      tag,
      parent,
    } = params;

    // 如果没有关键词，回退到普通分页查询
    if (!keyword || !keyword.trim()) {
      return this.getPage(params);
    }

    const ftsTableName = "t_sys_log_fts";
    const trimmedKeyword = keyword.trim();

    // 构建查询：使用 FTS5 全文检索 + JOIN 原表获取完整数据
    let query = `
      SELECT t.* FROM ${this.tableName} t
      INNER JOIN ${ftsTableName} fts ON t.id = fts.rowid
      WHERE ${ftsTableName} MATCH @keyword
    `;

    const queryParams = { keyword: trimmedKeyword };

    // 添加其他过滤条件
    const conditions = [];
    if (type) {
      conditions.push("t.type LIKE @type");
      queryParams.type = `%${type}%`;
    }
    if (optType) {
      conditions.push("t.opt_type LIKE @optType");
      queryParams.optType = `%${optType}%`;
    }
    if (tag) {
      conditions.push("t.tag LIKE @tag");
      queryParams.tag = `%${tag}%`;
    }
    if (parent) {
      conditions.push("t.parent_page LIKE @parent");
      queryParams.parent = `%${parent}%`;
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(" AND ")}`;
    }

    // 查询总数
    const countQuery = query.replace("SELECT t.*", "SELECT COUNT(*) as total");
    const countStmt = this.db.prepare(countQuery);
    let total = 0;
    try {
      const countResult = countStmt.get(queryParams);
      total = countResult ? countResult.total : 0;
    } catch (error) {
      // 如果FTS查询失败，可能是因为关键词包含特殊字符
      console.error("全文检索计数查询失败:", error.message);
      // 降级使用LIKE模糊查询
      return this._fallbackSearch(params);
    }

    // 分页查询
    const offset = (pageNo - 1) * pageSize;
    query += ` ORDER BY t.id DESC LIMIT @pageSize OFFSET @offset`;

    let list = [];
    try {
      const listStmt = this.db.prepare(query);
      list = listStmt.all({ ...queryParams, pageSize, offset });
    } catch (error) {
      console.error("全文检索查询失败:", error.message);
      // 降级使用LIKE模糊查询
      return this._fallbackSearch(params);
    }

    return {
      list,
      total,
    };
  }

  /**
   * 降级搜索：使用LIKE模糊查询作为后备方案
   * @private
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 返回对象包含 { list: Array, total: number }
   */
  _fallbackSearch(params) {
    const {
      keyword = "",
      pageNo = 1,
      pageSize = 10,
      type,
      optType,
      tag,
      parent,
    } = params;

    const trimmedKeyword = keyword.trim();

    // 构建WHERE条件
    const conditions = [];
    const queryParams = {};

    // 关键词在content字段中模糊匹配
    if (trimmedKeyword) {
      conditions.push("content LIKE @keyword");
      queryParams.keyword = `%${trimmedKeyword}%`;
    }

    if (type) {
      conditions.push("type LIKE @type");
      queryParams.type = `%${type}%`;
    }
    if (optType) {
      conditions.push("opt_type LIKE @optType");
      queryParams.optType = `%${optType}%`;
    }
    if (tag) {
      conditions.push("tag LIKE @tag");
      queryParams.tag = `%${tag}%`;
    }
    if (parent) {
      conditions.push("parent_page LIKE @parent");
      queryParams.parent = `%${parent}%`;
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

SysLogDbService.toString = () => "[class SysLogDbService]";

let sysLogDbServiceInstance = null;

module.exports = {
  SysLogDbService,
  get sysLogDbService() {
    if (!sysLogDbServiceInstance) {
      sysLogDbServiceInstance = new SysLogDbService();
    }
    return sysLogDbServiceInstance;
  },
};
