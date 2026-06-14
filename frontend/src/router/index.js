/*
 * 路由
 *
 */
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import "/@/theme/nprogress-custom.css";
import { nextTick } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { routerArray } from "./routers";
import { PAGE_PATH_404, PAGE_PATH_LOGIN } from "/@/constants/common-const";
import { HOME_PAGE_NAME, HOME_PAGE_PATH } from "/@/constants/system/home-const";
import SmartLayout from "../layout/index.vue";
import { useUserStore } from "/@/store/modules/system/user";
import { clearAllCoolies, getTokenFromCookie } from "/@/utils/cookie-util";
import { localClear } from "/@/utils/local-util";
import _ from "lodash";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routerArray,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// ----------------------- 路由加载前 -----------------------
router.beforeEach(async (to, from, next) => {
  // console.log(
  //   "路由加载前，to.fullPath: " +
  //     to.fullPath +
  //     "     from.fullPath: " +
  //     from.fullPath
  // );

  // 进度条开启
  nProgress.start();

  // 公共页面，任何时候都可以跳转
  if (to.path === PAGE_PATH_404 || to.path === PAGE_PATH_LOGIN) {
    next();
    return;
  }

  // 刷新页面时，from.fullPath 可能是 '/' 或空字符串，需要处理这两种情况
  // 对于 json、jsonDiff、jsonHis、history 和 textEditor 页面，刷新时关闭所有标签页并返回首页
  const isPageRefresh =
    from.fullPath === "/" ||
    from.fullPath === "" ||
    from.fullPath === to.fullPath;
  const isSpecialPage =
    to.path === "/json" ||
    to.path === "/jsonDiff" ||
    to.path === "/jsonHis" ||
    to.path === "/history" ||
    to.path === "/text-editor" ||
    to.path === "/code-editor" ||
    to.name?.toLowerCase().includes("history") ||
    to.name?.toLowerCase().includes("codeeditor") ||
    to.name?.toLowerCase().includes("texteditor");

  if (isPageRefresh && isSpecialPage) {
    // console.log("打开首页 - 关闭所有标签页", to.path, to.name);
    // 只清空标签页相关的数据，不清空 APP_CONFIG 等其他配置
    localStorage.removeItem("user_tag_nav");
    next({ path: HOME_PAGE_PATH });
    return;
  }

  // 从路由查询参数中提取实例ID的辅助函数
  function getInstanceIdFromQuery(query) {
    if (!query) return null;
    for (let key in query) {
      if (key.startsWith("_instance_")) return String(query[key]);
    }
    return null;
  }

  // 注意：多实例模式下，keep-alive 的缓存由组件的 name (menuId) 控制
  // 组件的 name 是固定的（如 "902", "906"），不需要动态修改 meta.componentName
  // 状态隔离通过 instance-state-manager.js 管理不同实例的状态

  // 保存至tagNav
  useUserStore().setTagNav(to, from);
  // console.log("最新Tab列表：", useUserStore().getTagNav);
  // console.log("to理由信息：", to.meta.keepAlive, to.meta.componentName);

  // 设置keepAlive
  if (to.meta.keepAlive) {
    nextTick(() => {
      useUserStore().pushKeepAliveIncludes(to.meta.componentName);
      // console.log("路由加载前，添加keepAlive缓存：", to.meta.componentName);
    });
  }

  next();
});

// ----------------------- 路由加载后 -----------------------
router.afterEach(() => {
  nProgress.done();
});

// ----------------------- 构建router对象 -----------------------
const routerMap = new Map();

export function buildRoutes(menuRouterList) {
  let menuList = menuRouterList
    ? menuRouterList
    : useUserStore().getMenuRouterList || [];
  /**
   * 1、构建整个路由信息
   * 2、添加到路由里
   */
  const routerList = [];
  // 获取所有vue组件引用地址 用于构建路由
  const modules = import.meta.glob("../views/**/**.vue");
  // 获取所有vue组件 用于注入name属性 name属性用于keep-alive

  //1、构建整个路由信息
  for (const e of menuList) {
    if (!e.menuId) {
      continue;
    }
    if (!e.path) {
      continue;
    }
    if (e.deletedFlag && e.deletedFlag === true) {
      continue;
    }
    let route = {
      path: e.path.startsWith("/") ? e.path : `/${e.path}`,
      // 使用【menuId】作为name唯一标识
      name: e.menuId.toString(),
      meta: {
        // 数据库菜单(页面)id
        id: e.menuId.toString(),
        // 组件名称
        componentName: e.menuId.toString(),
        // 菜单展示
        title: e.menuName,
        // 菜单图标展示
        icon: e.icon,
        // 是否在菜单隐藏
        hideInMenu: !e.visibleFlag,
        // 页面是否keep-alive缓存
        keepAlive: e.cacheFlag,
        // 是否为外链
        frameFlag: e.frameFlag,
        // 外链地址
        frameUrl: e.frameUrl,
        // 是否 rename了组件的名字
        renameComponentFlag: false,
      },
    };

    if (e.frameFlag) {
      route.component = () =>
        import("../components/framework/iframe/iframe-index.vue");
    } else {
      let componentPath =
        e.component && e.component.startsWith("/")
          ? e.component
          : "/" + e.component;
      let relativePath = `../views${componentPath}`;

      // 动态导入组件并设置 name 为 menuId
      route.component = () =>
        modules[relativePath]().then((module) => {
          // 设置组件的 name 为数据库中的 menuId，例如 "902"、"906"
          if (module.default) {
            module.default.name = e.menuId.toString();
          }
          return module;
        });
    }
    routerList.push(route);
    routerMap.set(e.menuId.toString(), route);
  }

  //2、添加到路由里
  router.addRoute({
    path: "/",
    meta: {},
    component: SmartLayout,
    children: routerList,
  });
}
