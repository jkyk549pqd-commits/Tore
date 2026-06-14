/*
 * 项目启动入口方法
 *
 */

// 过滤掉 CodeMirror 的调试日志
// const originalConsoleLog = console.log;
// console.log = function(...args) {
//   // 过滤掉 "resize 100% 100%" 这类 CodeMirror 调试日志
//   const message = args.join(' ');
//   if (message.includes('resize') && message.includes('100% 100%')) {
//     return;
//   }
//   originalConsoleLog.apply(console, args);
// };

import { createApp } from "vue";
import Antd from "ant-design-vue";
import { ElMessage } from "element-plus";
import * as antIcons from "@ant-design/icons-vue";
import lodash from "lodash";
import JsonViewer from "vue3-json-viewer";
import "vue3-json-viewer/dist/index.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { PureTable } from "@pureadmin/table";
import App from "./App.vue";
import { smartSentry } from "/@/lib/smart-sentry";
import { loginApi } from "/@/api/system/login-api";
import constantsInfo from "/@/constants/index";
import { privilegeDirective } from "/@/directives/privilege";
import i18n from "/@/i18n/index";
import privilegePlugin from "/@/plugins/privilege-plugin";
import smartEnumPlugin from "/@/plugins/smart-enums-plugin";
import { buildRoutes, router } from "/@/router";
import { store } from "/@/store";
import { setActivePinia } from "pinia";
import { useUserStore } from "/@/store/modules/system/user";
import { useThemeStore } from "/@/store/modules/theme";
import { initAppConfig } from "/@/store/modules/system/app-config";
import "ant-design-vue/dist/reset.css";
import "/@/theme/index.less";
import "/@/theme/theme-variables.css";
import "/@/theme/theme-global.css";
import "/@/theme/global-search-theme.css";
import { getTokenFromCookie } from "/@/utils/cookie-util";
import { saveTokenToCookie } from "/@/utils/cookie-util";
import { socketClient } from "/@/utils/socket-client";

/*
 * -------------------- ※ 着重 解释说明下main.js的初始化逻辑 begin ※ --------------------
 *
 * 1、在main.js里很多框架都是 直接调用初始化的vue方法，创建vue实例，然后挂载路由router、状态管理store等等，但是关于router这块是有问题的；
 * 2、因为现在大部分路由都是从后端接口返回的，如若直接初始化挂载路由，这时前端还没有从后端请求路由的数据，所以只能写到路由拦截器里，这样很绕很不清晰；
 *    正确的做法流程应该是：
 *      2.1）如果存在登录信息，则先ajax请求用户的所有路由，然后加载，再去创建vue实例和挂载路由
 *      2.2）如果不存在路由信息，则创建vue实例和挂载路由（此时的路由应该只有login页面，因为用户拥有哪些路由是登录之后才知道的）
 * 3、以上，在main.js里两个方法，一个是 获取登录信息getLoginInfo，另一个初始化vue: initVue，在最下的if操作里
 *
 * -------------------- ※ 着重 解释说明下main.js的初始化逻辑 end ※ --------------------
 */

/**
 * Vue 应用初始化标记，防止重复初始化
 */
let vueAppInitialized = false;

/**
 * 获取用户信息和用户权限对应的路由，构建动态路由
 */
async function getLoginInfo() {
  try {
    // 提前激活 Pinia,使后续在 initVue 之前可以正常使用 store
    setActivePinia(store);

    //获取登录用户信息
    const res = await loginApi.getLoginInfo();
    const dictRes = await dictApi.getAllDictData();
    //构建系统的路由
    let menuRouterList = res.data.menuList.filter((e) => e.path || e.frameUrl);
    buildRoutes(menuRouterList);
    initVue();
    // 初始化数据字典
    useDictStore().initData(dictRes.data);
    //更新用户信息到pinia
    useUserStore().setUserLoginInfo(res.data);
  } catch (e) {
    ElMessage.error(e.data ? e.data.msg : e.message);
    smartSentry.captureError(e);
    initVue();
  }
}

async function initVue() {
  // 防止重复初始化 Vue 应用
  if (vueAppInitialized) {
    console.warn("[Vue] 应用已经初始化，跳过重复初始化");
    return;
  }

  let vueApp = createApp(App);
  let app = vueApp
    .use(router)
    .use(store)
    .use(i18n)
    .use(Antd)
    .use(ElementPlus)
    .use(smartEnumPlugin, constantsInfo)
    .use(privilegePlugin)
    .use(JsonViewer);

  // 注册 pure-table 组件
  app.component("pure-table", PureTable);
  //注入权限
  app.directive("privilege", {
    mounted(el, binding) {
      privilegeDirective(el, binding);
    },
  });
  // 注册 ant-design-vue 图标组件
  Object.keys(antIcons).forEach((key) => {
    app.component(key, antIcons[key]);
  });

  // 注册 Element Plus 图标组件（跳过与 Ant Design 冲突的组件名）
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    // 跳过已经在 Ant Design 中注册的组件，避免冲突
    if (!antIcons[key]) {
      app.component(key, component);
    }
  }

  //全局（保持原有的对象引用，以便现有代码可以正常工作）
  app.config.globalProperties.$antIcons = antIcons;
  app.config.globalProperties.$elementIcons = ElementPlusIconsVue;
  app.config.globalProperties.$lodash = lodash;
  //挂载
  app.mount("#app");

  // 标记 Vue 应用已初始化
  vueAppInitialized = true;
}

/**
 * 获取菜单列表（通过 Socket.IO 从后端获取）
 */
async function getMenuListFromElectron() {
  try {
    // 使用 Socket.IO 请求后端获取菜单
    const menuResult = await socketClient.invoke("controller/system/getMenus");

    // 将后端返回的下划线命名转换为驼峰命名
    const menuList = menuResult.map((menu) => ({
      menuId: menu.menu_id,
      menuName: menu.menu_name,
      menuType: menu.menu_type,
      parentId: menu.parent_id,
      sort: menu.sort,
      path: menu.path,
      component: menu.component,
      permsType: menu.perms_type,
      apiPerms: menu.api_perms,
      webPerms: menu.web_perms,
      icon: menu.icon,
      contextMenuId: menu.context_menu_id,
      frameFlag: menu.frame_flag === 1 || menu.frame_flag === "1",
      frameUrl: menu.frame_url,
      cacheFlag: menu.cache_flag === "true" || menu.cache_flag === true,
      visibleFlag: menu.visible_flag === "true" || menu.visible_flag === true,
      disabledFlag:
        menu.disabled_flag === "true" || menu.disabled_flag === true,
      deletedFlag: menu.deleted_flag,
      createUserId: menu.create_user_id,
      createTime: menu.create_time,
      updateUserId: menu.update_user_id,
      updateTime: menu.update_time,
    }));

    // console.log("从 Socket.IO 获取菜单成功:", menuList);
    return menuList;
  } catch (error) {
    console.error("从 Socket.IO 获取菜单失败，使用默认菜单:", error);
    // 返回默认菜单列表
    return [
      {
        menuName: "menu.json",
        menuType: 2,
        parentId: 0,
        sort: 6,
        path: "/json",
        cacheFlag: true,
        component: "/system/json/index.vue",
        disabledFlag: false,
        frameFlag: false,
        icon: "FireOutlined",
        menuId: 230,
        permsType: 1,
        visibleFlag: true,
      },
    ];
  }
}

/**
 * 从 SQLite 恢复标签页运行时状态
 * 仅当 keepTabsOnClose 开关为 true 时执行;恢复后立即清空数据库以防膨胀
 *
 * 调用时机:在 Vue 挂载前、initAppConfig 之后,确保 localStorage 中已写入最新配置,
 * 同时编辑器组件挂载时(其 onMounted 读取 instanceStateMap)能拿到恢复后的数据.
 */
async function restoreTabStatesIfNeeded() {
  try {
    // 直接读 localStorage 而非 Pinia store,因为此时 Vue/Pinia 尚未挂载
    let keepTabsOnClose = false;
    try {
      const raw = localStorage.getItem("smart_admin_app_config");
      if (raw) {
        const cfg = JSON.parse(raw);
        keepTabsOnClose = cfg && cfg.keepTabsOnClose === true;
      }
    } catch (e) {
      console.warn("读取 keepTabsOnClose 配置失败:", e);
    }
    if (!keepTabsOnClose) {
      return;
    }
    const list = await socketClient.invoke(
      "controller/system/loadTabStates",
      {}
    );
    if (Array.isArray(list) && list.length > 0) {
      const userStore = useUserStore();
      for (const item of list) {
        if (!item || !item.stateKey || !item.content) continue;
        userStore.setInstanceState(item.stateKey, item.content);
      }
    }
    await socketClient.invoke("controller/system/clearTabStates", {});
  } catch (e) {
    console.error("恢复标签页状态失败:", e);
  }
}

/**
 * 初始化应用（获取菜单并构建路由）
 */
async function initApp() {
  try {
    // 提前激活 Pinia,使后续在 initVue 之前可以正常使用 store
    setActivePinia(store);

    // 初始化应用配置（从后端获取）
    await initAppConfig();

    // 从 SQLite 恢复标签页运行时状态(必须在 Vue 挂载前完成,
    // 否则编辑器组件 onMounted 时读到的 instanceStateMap 为空)
    await restoreTabStatesIfNeeded();

    // 获取菜单列表
    const menuList = await getMenuListFromElectron();
    // console.log("menuList:", JSON.stringify(menuList));

    // 构建路由
    buildRoutes(menuList);

    // 初始化 Vue
    initVue();

    // 加载持久化的实例ID数据
    useUserStore().loadInstanceIdData();

    // 设置用户登录信息到 store
    const userData = {
      token: "",
      employeeId: 2,
      loginName: "admin",
      actualName: "张三",
      phone: "12345678901",
      departmentId: 3,
      departmentName: "研发部",
      administratorFlag: 1,
      menuList: menuList,
    };

    saveTokenToCookie(userData.token ? userData.token : "");
    useUserStore().setUserLoginInfo(userData);

    // 初始化主题
    const themeStore = useThemeStore();
    themeStore.loadFromStorage();

    // 注册全局快捷键监听
    registerGlobalShortcuts();

    // console.log("应用初始化完成，菜单已加载");
  } catch (error) {
    console.error("应用初始化失败:", error);
    // 即使失败也初始化 Vue
    initVue();
  }
}

/**
 * 注册全局快捷键
 */
function registerGlobalShortcuts() {
  // 监听键盘事件
  window.addEventListener("keydown", (e) => {
    // Ctrl+F 或 Cmd+F (Mac) - 打开全局搜索
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      // 触发全局搜索打开事件
      window.dispatchEvent(new CustomEvent("global-search-open"));
    }
  });
}

// 不需要获取用户信息、用户菜单、用户菜单动态路由，直接初始化vue即可
let token = getTokenFromCookie();
if (!token) {
  initApp();
} else {
  getLoginInfo();
}
