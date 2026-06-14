/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

const { logger } = require("ee-core/log");
const { SystemService } = require("../service/system");

function preload() {
  logger.info("[preload] load 1");
  // 在预加载模块中调用SystemService 中的getMenus方法
  // try {
  //   const systemService = new SystemService();
  //   systemService.getMenus({}).then(result => {
  //     // logger.info("[preload] getMenus result:", result);
  //   }).catch(error => {
  //     logger.error("[preload] getMenus error:", error);
  //   });
  // } catch (error) {
  //   logger.error("[preload] SystemService error:", error);
  // }
}

/**
 * 预加载模块入口
 */
module.exports = {
  preload,
};
