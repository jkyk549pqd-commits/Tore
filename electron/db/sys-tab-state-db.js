const { BasedbService } = require("./basedb");

/**
 * 标签页状态表数据存储服务
 *
 * 用于在软件关闭时保存各编辑器标签的运行时状态(jsonStr1/textContent等),
 * 重启后从该表恢复状态,恢复成功后立即清空避免数据库膨胀.
 * @class
 */
class SysTabStateDbService extends BasedbService {
  constructor() {
    const options = {
      dbname: "sqlite-demo.db",
    };
    super(options);
    this.tableName = "t_tab_state";
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
      ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "state_key" TEXT NOT NULL,
        "content" TEXT,
        "crt_time" DATE )`;
      this.db.exec(create_table_sql);
    }
  }

  async setCustomDataDir(dir) {
    if (!dir) {
      return;
    }
    this.changeDataDir(dir);
    this.init();
  }

  /**
   * 批量保存标签状态(先清空再插入,保证恢复后无残留)
   * @param {Array<{state_key:string, content:string, crt_time:string}>} list 至多 20 条
   */
  async saveAll(list) {
    const clearStmt = this.db.prepare(`DELETE FROM ${this.tableName}`);
    const insertStmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (state_key, content, crt_time) VALUES (@state_key, @content, @crt_time)`
    );
    const tx = this.db.transaction((rows) => {
      clearStmt.run();
      for (const row of rows) {
        insertStmt.run(row);
      }
    });
    tx(Array.isArray(list) ? list.slice(0, 20) : []);
    return true;
  }

  /**
   * 读取所有标签状态
   */
  async getAll() {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    return stmt.all();
  }

  /**
   * 清空表
   */
  async clearAll() {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName}`);
    stmt.run();
    return true;
  }
}

SysTabStateDbService.toString = () => "[class SysTabStateDbService]";

let sysTabStateDbServiceInstance = null;

module.exports = {
  SysTabStateDbService,
  get sysTabStateDbService() {
    if (!sysTabStateDbServiceInstance) {
      sysTabStateDbServiceInstance = new SysTabStateDbService();
    }
    return sysTabStateDbServiceInstance;
  },
};
