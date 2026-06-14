const { BasedbService } = require("./basedb");

/**
 * 系统菜单表数据存储服务
 * @class
 */
class SysMenuDbService extends BasedbService {
  constructor() {
    const options = {
      dbname: "sqlite-demo.db",
    };
    super(options);
    this.tableName = "t_sys_menu";
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
      ( "menu_id" INTEGER NOT NULL, "menu_name" TEXT NOT NULL, "menu_type" INTEGER NOT NULL, "parent_id" INTEGER NOT NULL, "sort" INTEGER, "path" TEXT, "component" TEXT, "perms_type" INTEGER, "api_perms" TEXT, "web_perms" TEXT, "icon" TEXT, "context_menu_id" INTEGER, "frame_flag" INTEGER DEFAULT 0, "frame_url" TEXT, "cache_flag" INTEGER DEFAULT 0, "visible_flag" INTEGER DEFAULT 1, "disabled_flag" INTEGER DEFAULT 0, "deleted_flag" INTEGER DEFAULT 0, "create_user_id" INTEGER, "create_time" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, "update_user_id" INTEGER, "update_time" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("menu_id") )`;
      this.db.exec(create_table_sql);

      const insert_table_sql = `
        INSERT INTO ${this.tableName}  VALUES (901, 'menu.codeEditor', 2, 0, 1, '/code-editor', '/system/code-editor/index.vue', 1, NULL, NULL, 'CodeOutlined', NULL, 0, NULL, 'true', 'true', 'false', 0, NULL, '2026-05-02 22:39:00', NULL, '2026-05-02 22:39:00');
        INSERT INTO ${this.tableName}  VALUES (902, 'menu.json', 2, 0, 2, '/json', '/system/json/index.vue', 1, NULL, NULL, 'FireOutlined', NULL, 0, NULL, 'true', 'true', 'false', 0, NULL, '2026-01-24 06:35:49', NULL, '2026-01-24 06:35:49');
        INSERT INTO ${this.tableName}  VALUES (904, 'menu.diffdetail', 3, 0, 3, '/jsonDiff', '/system/json/components/diff-detail.vue', 1, NULL, NULL, 'UsergroupAddOutlined', NULL, 0, NULL, 'true', 'true', 'false', 0, NULL, '2026-01-24 06:38:23', NULL, '2026-01-24 06:38:23');
        INSERT INTO ${this.tableName}  VALUES (908, 'menu.text', 2, 0, 5, '/text-editor', '/system/text-editor/index.vue', 1, NULL, NULL, 'FileTextOutlined', NULL, 0, NULL, 'true', 'true', 'false', 0, NULL, '2026-01-24 06:35:49', NULL, '2026-01-24 06:35:49');
        INSERT INTO ${this.tableName}  VALUES (909, 'menu.jsonHis', 2, 0, 9, '/jsonHis', '/system/history/index.vue', 1, NULL, NULL, 'HistoryOutlined', NULL, 0, NULL, 'true', 'true', 'false', 0, NULL, '2026-02-01 10:27:44', NULL, '2026-02-01 10:27:44');
      `;
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
   * 查询所有菜单
   * @returns {Promise<Array>} 菜单列表
   */
  async getAll() {
    const selectStmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    const menus = selectStmt.all({});
    return menus;
  }

  /**
   * 根据ID查询菜单
   * @param {number} menuId - 菜单ID
   * @returns {Promise<Object|null>} 菜单对象
   */
  async getById(menuId) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE menu_id = @menu_id`
    );
    const menu = selectStmt.get({ menu_id: menuId });
    return menu;
  }

  /**
   * 添加菜单
   * @param {Object} data - 菜单数据
   * @returns {Promise<boolean>} 是否成功
   */
  async add(data) {
    const insert = this.db.prepare(
      `INSERT INTO ${this.tableName} (menu_id, menu_name, menu_type, parent_id, sort, path, component, perms_type, api_perms, web_perms, icon, context_menu_id, frame_flag, frame_url, cache_flag, visible_flag, disabled_flag, deleted_flag, create_user_id, create_time, update_user_id, update_time) VALUES (@menu_id, @menu_name, @menu_type, @parent_id, @sort, @path, @component, @perms_type, @api_perms, @web_perms, @icon, @context_menu_id, @frame_flag, @frame_url, @cache_flag, @visible_flag, @disabled_flag, @deleted_flag, @create_user_id, @create_time, @update_user_id, @update_time)`
    );
    insert.run(data);
    return true;
  }

  /**
   * 更新菜单
   * @param {Object} data - 菜单数据（必须包含menu_id）
   * @returns {Promise<boolean>} 是否成功
   */
  async update(data) {
    if (!data || !data.menu_id) {
      return false;
    }
    const update = this.db.prepare(
      `UPDATE ${this.tableName} SET menu_name=@menu_name, menu_type=@menu_type, parent_id=@parent_id, sort=@sort, path=@path, component=@component, perms_type=@perms_type, api_perms=@api_perms, web_perms=@web_perms, icon=@icon, context_menu_id=@context_menu_id, frame_flag=@frame_flag, frame_url=@frame_url, cache_flag=@cache_flag, visible_flag=@visible_flag, disabled_flag=@disabled_flag, deleted_flag=@deleted_flag, update_user_id=@update_user_id, update_time=@update_time WHERE menu_id=@menu_id`
    );
    update.run(data);
    return true;
  }

  /**
   * 删除菜单
   * @param {number} menuId - 菜单ID
   * @returns {Promise<boolean>} 是否成功
   */
  async delete(menuId) {
    if (!menuId) {
      return false;
    }
    const deleteStmt = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE menu_id = @menu_id`
    );
    deleteStmt.run({ menu_id: menuId });
    return true;
  }

  /**
   * 根据父ID查询子菜单
   * @param {number} parentId - 父菜单ID
   * @returns {Promise<Array>} 子菜单列表
   */
  async getByParentId(parentId) {
    const selectStmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE parent_id = @parent_id`
    );
    const menus = selectStmt.all({ parent_id: parentId });
    return menus;
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

SysMenuDbService.toString = () => "[class SysMenuDbService]";

let sysMenuDbServiceInstance = null;

module.exports = {
  SysMenuDbService,
  get sysMenuDbService() {
    if (!sysMenuDbServiceInstance) {
      sysMenuDbServiceInstance = new SysMenuDbService();
    }
    return sysMenuDbServiceInstance;
  },
};
