const { console } = require("inspector");
const { BasedbService } = require("./basedb");

/**
 * 系统日志版本表数据存储服务
 * @class
 */
class SysLogVersionDbService extends BasedbService {
  constructor() {
    const options = {
      dbname: "sqlite-demo.db",
    };
    super(options);
    this.tableName = "t_sys_log_version";
    this.logTableName = "t_sys_log";
  }

  /**
   * 初始化表
   */
  init() {
    this._init();

    const masterStmt = this.db.prepare(
      "SELECT * FROM sqlite_master WHERE type=? AND name = ?"
    );
    const tableExists = masterStmt.get("table", this.tableName);

    if (!tableExists) {
      const create_table_sql = `CREATE TABLE ${this.tableName}
      ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "log_id" INTEGER NOT NULL, "version_no" INTEGER NOT NULL DEFAULT 1, "opt_type" TEXT, "type" TEXT, "message" TEXT, "content" TEXT, "md5" TEXT, "crt_time" DATE, "is_active" INTEGER NOT NULL DEFAULT 0 )`;
      this.db.exec(create_table_sql);

      // 添加索引优化查询性能
      const createIndexSql = `CREATE INDEX IF NOT EXISTS idx_log_active ON ${this.tableName}(log_id, is_active)`;
      this.db.exec(createIndexSql);
    } else {
      // 检查是否需要添加 is_active 字段和索引（用于现有数据库的升级）
      try {
        this.db.exec(
          `ALTER TABLE ${this.tableName} ADD COLUMN is_active INTEGER NOT NULL DEFAULT 0`
        );
      } catch (error) {
        // 字段已存在,忽略错误
      }

      // 添加索引
      try {
        const createIndexSql = `CREATE INDEX IF NOT EXISTS idx_log_active ON ${this.tableName}(log_id, is_active)`;
        this.db.exec(createIndexSql);
      } catch (error) {
        // 索引已存在,忽略错误
      }
    }
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
   * 插入版本记录
   */
  async add(data) {
    const insert = this.db.prepare(
      `INSERT INTO ${this.tableName} (log_id, version_no, opt_type, type, message, content, md5, crt_time, is_active) VALUES (@log_id, @version_no, @opt_type, @type, @message, @content, @md5, @crt_time, @is_active)`
    );
    insert.run(data);
    return true;
  }

  /**
   * 更新版本记录（合并窗口用）
   */
  async update(data) {
    if (!data || !data.id) {
      return false;
    }
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET content=@content, md5=@md5, crt_time=@crt_time WHERE id=@id`
    );
    update.run(data);
    return true;
  }

  async updateInactive(data) {
    if (!data || !data.log_id) {
      return false;
    }
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET is_active=0 WHERE log_id=@log_id`
    );
    update.run(data);
    return true;
  }

  async updateMessage(data) {
    if (!data || !data.id) {
      return false;
    }
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET message=@message WHERE id=@id`
    );
    update.run(data);
    return true;
  }

  /**
   * 按主键查询
   */
  async getById(id) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE id = @id`
    );
    return stmt.get({ id });
  }

  /**
   * 查某条日志的所有版本（按 version_no DESC）
   */
  async getByLogId(logId) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE log_id = @logId ORDER BY version_no DESC`
    );
    return stmt.all({ logId });
  }

  /**
   * 查最新版本
   */
  async getLatestByLogId(logId) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE log_id = @logId ORDER BY version_no DESC LIMIT 1`
    );
    return stmt.get({ logId });
  }

  /**
   * 分页查版本
   */
  async getPageByLogId(params) {
    const { logId, pageNo = 1, pageSize = 20 } = params;
    const offset = (pageNo - 1) * pageSize;

    const countStmt = this.db.prepare(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE log_id = @logId`
    );
    const countResult = countStmt.get({ logId });
    const total = countResult ? countResult.total : 0;

    const listStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE log_id = @logId ORDER BY version_no DESC LIMIT @pageSize OFFSET @offset`
    );
    const list = listStmt.all({ logId, pageSize, offset });

    return { list, total };
  }

  /**
   * 级联删除某条日志的所有版本
   */
  async deleteByLogId(logId) {
    if (!logId) {
      return false;
    }
    const stmt = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE log_id = @logId`
    );
    stmt.run({ logId });
    return true;
  }

  async deleteByVersionLogId(verLogId) {
    if (!verLogId) {
      return false;
    }
    const stmt = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE id = @verLogId`
    );
    stmt.run({ verLogId });
    return true;
  }

  /**
   * 获取某条日志的Active版本
   * @param {number} logId - 日志ID
   * @returns {Promise<Object|null>} 返回Active版本对象或null
   */
  async getActiveByLogId(logId) {
    if (!logId) {
      return null;
    }
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE log_id = @logId AND is_active = 1`
    );
    return stmt.get({ logId });
  }

  /**
   * 设置某条日志的Active版本
   * 使用事务确保原子性:先取消所有active,再设置新的active
   * @param {number} versionId - 版本ID
   * @param {number} logId - 日志ID
   * @returns {Promise<boolean>} 是否设置成功
   */
  async setActiveVersion(versionId, logId) {
    if (!versionId || !logId) {
      return false;
    }

    const deactivate = this.db.prepare(
      `UPDATE ${this.tableName} SET is_active = 0 WHERE log_id = @logId`
    );
    const activate = this.db.prepare(
      `UPDATE ${this.tableName} SET is_active = 1 WHERE id = @versionId`
    );

    const { content, type, crt_time } = await this.getById(versionId);
    const setLogContent = this.db.prepare(
      `UPDATE ${this.logTableName} SET content = @content, type = @type, upd_time = @upd_time WHERE id = @logId`
    );

    try {
      this.db.transaction(() => {
        deactivate.run({ logId });
        activate.run({ versionId });
        setLogContent.run({
          content,
          type,
          upd_time: crt_time,
          logId,
        });
      })();
      return true;
    } catch (error) {
      console.error("设置Active版本失败:", error);
      return false;
    }
  }

  /**
   * 获取某条日志的Active版本内容
   * @param {number} logId - 日志ID
   * @returns {Promise<Object|null>} 返回包含content的对象或null
   */
  async getActiveContentByLogId(logId) {
    if (!logId) {
      return null;
    }
    const stmt = this.db.prepare(
      `SELECT id, content, version_no, is_active FROM ${this.tableName} WHERE log_id = @logId AND is_active = 1`
    );
    return stmt.get({ logId });
  }

  /**
   * 数据迁移:为现有数据设置最新版本为Active
   * @returns {Promise<number>} 返回迁移的记录数
   */
  async migrateExistingData() {
    try {
      // 获取所有有版本的日志ID
      const logIdsStmt = this.db.prepare(
        `SELECT DISTINCT log_id FROM ${this.tableName} ORDER BY log_id`
      );
      const logIds = logIdsStmt.all();

      let migratedCount = 0;

      for (const row of logIds) {
        const logId = row.log_id;

        // 检查是否已有Active版本
        const existingActive = await this.getActiveByLogId(logId);
        if (existingActive) {
          continue; // 已有Active版本,跳过
        }

        // 获取最新版本
        const latestStmt = this.db.prepare(
          `SELECT id FROM ${this.tableName} WHERE log_id = @logId ORDER BY version_no DESC LIMIT 1`
        );
        const latest = latestStmt.get({ logId });

        if (latest) {
          // 设置最新版本为Active
          const success = await this.setActiveVersion(latest.id, logId);
          if (success) {
            migratedCount++;
          }
        }
      }

      console.log(`数据迁移完成,共迁移 ${migratedCount} 条记录`);
      return migratedCount;
    } catch (error) {
      console.error("数据迁移失败:", error);
      return 0;
    }
  }
}

SysLogVersionDbService.toString = () => "[class SysLogVersionDbService]";

let sysLogVersionDbServiceInstance = null;

module.exports = {
  SysLogVersionDbService,
  get sysLogVersionDbService() {
    if (!sysLogVersionDbServiceInstance) {
      sysLogVersionDbServiceInstance = new SysLogVersionDbService();
    }
    return sysLogVersionDbServiceInstance;
  },
};
