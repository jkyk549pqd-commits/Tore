/**
 * Socket.IO 客户端工具类
 * 用于与后端进行Socket.IO通信
 */
import { io } from "socket.io-client";

class SocketClient {
  constructor() {
    this.socket = null;
    this.initPromise = null;
  }

  /**
   * 初始化 Socket.IO 连接
   */
  init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.socket) {
      return Promise.resolve(this.socket);
    }

    this.initPromise = new Promise((resolve) => {
      // 从配置中获取端口，默认使用7070
      const port = import.meta.env.VITE_SOCKET_PORT || 7070;
      const url = `ws://127.0.0.1:${port}`;

      // console.log('正在连接 Socket.IO 服务器:', url);

      // 创建 Socket.IO 连接
      this.socket = io(url, {
        transports: ["websocket"],
        path: "/socket.io/",
      });

      // 监听连接事件
      this.socket.on('connect', () => {
        // console.log('Socket.IO 连接成功，Socket ID:', this.socket.id);
        resolve(this.socket);
      });

      // 监听断开连接事件
      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO 连接断开，原因:', reason);
      });

      // 监听连接错误
      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO 连接错误:', error);
      });

      // 5秒超时，即使连接未成功也返回socket实例
      setTimeout(() => {
        resolve(this.socket);
      }, 5000);
    });

    return this.initPromise;
  }

  /**
   * 发送 Socket.IO 请求
   * @param {string} channel - 通信频道，默认使用 'socket-channel'
   * @param {object} payload - 请求数据，包含 cmd 和 args
   * @returns {Promise} 返回Promise对象
   */
  async send(channel = 'socket-channel', payload) {
    // 确保socket已初始化
    await this.init();

    if (!this.socket) {
      throw new Error('Socket.IO 未初始化');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket.IO 请求超时'));
      }, 30000);

      try {
        this.socket.emit(channel, payload, (response) => {
          clearTimeout(timeout);
          
          // Electron-Egg框架的Socket.IO直接返回controller方法的结果
          // 不包装成 {code: 200, data: ...} 格式
          // undefined 或 null 也是有效的响应（表示查询无结果）
          resolve(response);
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * 调用后端控制器方法
   * @param {string} method - 控制器方法路径，格式如 'controller/system/getMenus'
   * @param {object} args - 方法参数
   * @returns {Promise} 返回Promise对象
   */
  async invoke(method, args = {}) {
    return this.send('socket-channel', {
      cmd: method,
      args: args
    });
  }
}

// 导出单例实例
export const socketClient = new SocketClient();

// 导出默认实例
export default socketClient;