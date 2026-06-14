"use strict";

/**
 * Development environment configuration, coverage config.default.js
 */
module.exports = () => {
  return {
    openDevTools: {
      mode: "right", // left, right, bottom, undocked, detach
      activate: true, // 是否将打开的开发者工具窗口置于前台
      title: "", //  A title for the DevTools window (only in undocked or detach mode).
    },
    jobs: {
      messageLog: true,
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
  };
};
