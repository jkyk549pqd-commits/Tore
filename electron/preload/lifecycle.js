"use strict";

const { logger } = require("ee-core/log");
const { getConfig } = require("ee-core/config");
const { getMainWindow } = require("ee-core/electron");
const { ipcMain } = require("electron");
const { getDataDir } = require("ee-core/ps");
const { getBeijingTime } = require("../service/util");

class Lifecycle {
  /**
   * core app have been loaded
   */
  async ready() {
    logger.info("[lifecycle] ready");
  }

  /**
   * electron app ready
   */
  async electronAppReady() {
    // logger.info("[lifecycle] electron-app-ready");

    // 注册同步 IPC: 在窗口关闭时同步保存标签页状态到 SQLite
    // 使用 sendSync 是因为 beforeunload 中无法等待异步 socket.io 完成
    ipcMain.on("app:save-tab-states-sync", async (event, payload) => {
      try {
        const { sysTabStateDbService } = require("../db/sys-tab-state-db");
        sysTabStateDbService.setCustomDataDir(getDataDir());
        const list = payload && Array.isArray(payload.list) ? payload.list : [];
        const now = getBeijingTime();
        const rows = list
          .slice(0, 20)
          .filter((it) => {
            return it.stateKey && it.stateKey != "909_default";
          })
          .map((it) => {
            // content 现在前端已经序列化为字符串，直接使用
            const content = String(it.content || "");
            return {
              state_key: String(it.stateKey || ""),
              content: content,
              crt_time: now,
            };
          });

        // if (rows.length > 0) {
        //   logger.info("[ipc] First row sample:", JSON.stringify(rows[0]));
        // }

        await sysTabStateDbService.saveAll(rows);

        event.returnValue = { success: true, count: rows.length };
      } catch (e) {
        logger.error("[ipc] save-tab-states-sync failed:", e);
        event.returnValue = { success: false, message: e.message };
      }
    });
  }

  /**
   * main window have been loaded
   */
  async windowReady() {
    logger.info("[lifecycle] window-ready");
    // 延迟加载，无白屏
    const { windowsOption } = getConfig();
    if (windowsOption.show == false) {
      const win = getMainWindow();
      win.once("ready-to-show", () => {
        win.show();
        win.focus();
      });
    }
  }

  /**
   * before app close
   */
  async beforeClose() {
    logger.info("[lifecycle] before-close");
  }
}
Lifecycle.toString = () => "[class Lifecycle]";

module.exports = {
  Lifecycle,
};
