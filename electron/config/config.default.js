"use strict";

const path = require("path");
const { getBaseDir } = require("ee-core/ps");

/**
 * 默认配置
 */
module.exports = () => {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: "Tore",
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 768,
      webPreferences: {
        //webSecurity: false,
        contextIsolation: false, // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
        nodeIntegration: true,
        //preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
      },
      frame: true,
      show: true,
      autoHideMenuBar: true, //隐藏菜单栏。不是最终解决方案
      icon: path.join(getBaseDir(), "public", "images", "logo-32.png"),
    },
    logger: {
      encoding: "utf8", // 文件编码
      level: "INFO",
      outputJSON: false,
      rotator: "day", // day:按天切割
      appLogName: "ee.log",
      coreLogName: "ee-core.log",
      errorLogName: "ee-error.log",
    },
    remote: {
      enable: false,
      url: "http://electron-egg.kaka996.com/",
    },
    socketServer: {
      enable: true,
      port: 7070,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: true,
      },
      channel: "socket-channel",
    },
    httpServer: {
      enable: false,
      https: {
        enable: false,
        key: "/public/ssl/localhost+1.key",
        cert: "/public/ssl/localhost+1.pem",
      },
      host: "127.0.0.1",
      port: 7071,
    },
    mainServer: {
      indexPath: "/public/dist/index.html",
      channelSeparator: "/",
    },
  };
};
