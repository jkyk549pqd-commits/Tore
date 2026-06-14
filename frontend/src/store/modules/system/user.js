/*
 * 登录用户
 *
 */
import _ from "lodash";
import { defineStore } from "pinia";
import localKey from "/@/constants/local-storage-key-const";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { MENU_TYPE_ENUM } from "/@/constants/system/menu-const";
import { getTokenFromCookie } from "/@/utils/cookie-util";
import { localClear, localRead, localSave } from "/@/utils/local-util";

export const useUserStore = defineStore({
  id: "userStore",
  state: () => ({
    token: "",
    //用户id
    employeeId: "",
    //登录名
    loginName: "",
    //姓名
    actualName: "",
    //手机号
    phone: "",
    //部门id
    departmentId: "",
    //部门名词
    departmentName: "",
    //是否为超级管理员
    administratorFlag: true,
    //上次登录ip
    lastLoginIp: "",
    //上次登录ip地区
    lastLoginIpRegion: "",
    //上次登录 设备
    lastLoginUserAgent: "",
    //上次登录时间
    lastLoginTime: "",
    //左侧菜单树形结构
    menuTree: [],
    //存在页面路由的菜单集合
    menuRouterList: [],
    //是否完成menuRouter初始化
    menuRouterInitFlag: false,
    //父类菜单集合
    menuParentIdListMap: new Map(),
    // 功能点集合
    pointsList: [],
    // 标签页数组，存储所有已打开的标签
    tagNavList: [],
    // 缓存
    keepAliveIncludes: [],
    // 每个标签实例的局部状态存储（key 为 instanceId 或默认标识）
    instanceStateMap: {},
    // 临时记录刚删除的标签键（instanceId 或 menuName），用于防止在短时间内被路由钩子重新添加
    recentlyDeletedKeys: {},
    // 实例ID计数器（用于多实例模式）
    instanceIdCounter: 0,
  }),
  getters: {
    getToken(state) {
      if (state.token) {
        return state.token;
      }
      return getTokenFromCookie();
    },
    //是否初始化了 路由
    getMenuRouterInitFlag(state) {
      return state.menuRouterInitFlag;
    },
    //菜单树
    getMenuTree(state) {
      return state.menuTree;
    },
    //菜单的路由
    getMenuRouterList(state) {
      return state.menuRouterList;
    },
    //菜单的父级id
    getMenuParentIdListMap(state) {
      return state.menuParentIdListMap;
    },
    //功能点
    getPointList(state) {
      if (_.isEmpty(state.pointsList)) {
        let localUserPoints = localRead(localKey.USER_POINTS) || "";
        state.pointsList = localUserPoints ? JSON.parse(localUserPoints) : [];
      }
      return state.pointsList;
    },
    //标签页
    getTagNav(state) {
      if (_.isEmpty(state.tagNavList)) {
        let localTagNav = localRead(localKey.USER_TAG_NAV) || "";
        state.tagNavList = localTagNav ? JSON.parse(localTagNav) : [];
      }
      let tagNavList = _.cloneDeep(state.tagNavList) || [];
      //始终保证HOME页面顺序在第一个
      tagNavList.unshift({
        menuName: HOME_PAGE_NAME,
        menuTitle: "home.home",
      });
      return tagNavList;
    },
  },

  actions: {
    // 从本地存储加载实例ID相关数据
    loadInstanceIdData() {
      try {
        const localData = localRead(localKey.INSTANCE_ID_COUNTER) || "";
        if (localData) {
          const parsed = JSON.parse(localData);
          this.instanceIdCounter = parsed.counter || 0;
        } else {
          this.instanceIdCounter = 0;
        }
      } catch (e) {
        console.error("加载实例ID数据失败:", e);
        this.instanceIdCounter = 0;
      }
    },
    // 保存实例ID相关数据到本地存储
    saveInstanceIdData() {
      try {
        const data = {
          counter: this.instanceIdCounter || 0,
        };
        localSave(localKey.INSTANCE_ID_COUNTER, JSON.stringify(data));
      } catch (e) {
        console.error("保存实例ID数据失败:", e);
      }
    },
    // 获取指定实例的状态
    getInstanceState(key) {
      if (!key) key = "default";
      return this.instanceStateMap[key] || null;
    },
    // 设置指定实例的状态
    setInstanceState(instanceId, data) {
      if (!instanceId) instanceId = "default";
      this.instanceStateMap[instanceId] = Object.assign(
        {},
        this.instanceStateMap[instanceId] || {},
        data || {}
      );
    },
    // 删除指定实例的状态
    removeInstanceState(instanceId) {
      if (!instanceId) return;
      if (this.instanceStateMap && this.instanceStateMap[instanceId]) {
        delete this.instanceStateMap[instanceId];
      }
    },
    logout() {
      this.token = "";
      this.tagNavList = [];
      localClear();
    },
    //设置登录信息
    setUserLoginInfo(data) {
      // 用户基本信息
      this.token = data.token;
      this.employeeId = data.employeeId;
      this.loginName = data.loginName;
      this.actualName = data.actualName;
      this.phone = data.phone;
      this.departmentId = data.departmentId;
      this.departmentName = data.departmentName;
      this.administratorFlag = data.administratorFlag;
      this.lastLoginIp = data.lastLoginIp;
      this.lastLoginIpRegion = data.lastLoginIpRegion;
      this.lastLoginUserAgent = data.lastLoginUserAgent;
      this.lastLoginTime = data.lastLoginTime;

      //菜单权限
      this.menuTree = buildMenuTree(data.menuList);

      //拥有路由的菜单
      this.menuRouterList = data.menuList.filter((e) => e.path || e.frameUrl);

      //父级菜单集合
      this.menuParentIdListMap = buildMenuParentIdListMap(this.menuTree);

      //功能点
      this.pointsList = data.menuList.filter(
        (menu) =>
          menu.menuType === MENU_TYPE_ENUM.POINTS.value &&
          menu.visibleFlag &&
          !menu.disabledFlag
      );
    },
    setToken(token) {
      this.token = token;
    },
    //设置标签页
    setTagNav(to, from) {
      if (_.isEmpty(this.getTagNav)) this.tagNavList = [];
      // name唯一标识
      let name = to.name;
      if (!name || name === HOME_PAGE_NAME) {
        return;
      }
      // 检查是否有实例ID（用于多实例模式）
      // 从路由查询参数中查找 _instance_ 开头的键 (用于标识多实例模式下的不同标签)
      let instanceId = null;
      if (to.query) {
        for (let key in to.query) {
          if (key.startsWith("_instance_")) {
            instanceId = to.query[key];
            break;
          }
        }
      }
      // 如果是通过菜单新打开的普通标签（没有 instanceId），并且存在遗留的 per-route 默认状态
      // 但当前 tagNav 中并没有该普通标签（即上次已关闭且未清理），则清理遗留状态，避免下一次打开时恢复旧内容
      try {
        if (!instanceId) {
          // 根据路由名称清理所有可能的默认状态键格式
          // 可能的键格式包括：${name}_default, default
          const possibleKeys = [
            name ? `${name}_default` : null,
            "default",
          ].filter((k) => k !== null);

          for (const perRouteKey of possibleKeys) {
            if (this.instanceStateMap && this.instanceStateMap[perRouteKey]) {
              const existing = (this.tagNavList || []).some(
                (e) => !e.instanceId && e.menuName === name
              );
              if (!existing) {
                try {
                  delete this.instanceStateMap[perRouteKey];
                } catch (e) {}
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
      // 如果该标签刚刚被删除过（短时间内），则跳过添加，避免路由钩子导致的复原
      try {
        if (instanceId) {
          if (
            this.recentlyDeletedKeys &&
            this.recentlyDeletedKeys[instanceId]
          ) {
            // 如果当前仅剩 Home（即用户已关闭所有标签），允许重新添加
            const currentTags = this.getTagNav || [];
            if (currentTags.length > 1) {
              return;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      // 根据实例ID和菜单名称查找标签页
      let findTag = (this.tagNavList || []).find((e) => {
        if (instanceId && e.instanceId == instanceId) {
          return true;
        }
        if (!instanceId && e.menuName === name && !e.instanceId) {
          return true;
        }
        return false;
      });

      if (findTag) {
        findTag.fromMenuName = from.name;
        findTag.fromMenuQuery = from.query;
      } else {
        this.tagNavList.push({
          menuName: name,
          menuTitle: to.meta.title,
          menuQuery: to.query,
          fromMenuName: from.name,
          fromMenuQuery: from.query,
          instanceId: instanceId,
          customName: undefined, // 初始化自定义名称字段
        });
      }
      // 保存至浏览器本地缓存中
      localSave(localKey.USER_TAG_NAV, JSON.stringify(this.tagNavList));
    },
    //关闭标签页
    closeTagNav(menuName, closeAllFlag) {
      // 如果 tagNav 为空，直接返回 false
      if (_.isEmpty(this.getTagNav)) {
        return false;
      }

      let deleted = false;

      if (closeAllFlag && !menuName) {
        this.tagNavList = [];
        this.clearKeepAliveIncludes();
        // 清理所有实例状态
        this.instanceStateMap = {};
        deleted = true;
      } else {
        // 查找标签页索引（支持instanceId）
        let findIndex = (this.tagNavList || []).findIndex((e) => {
          if (e.instanceId && e.instanceId === menuName) {
            return true;
          }
          if (!e.instanceId && e.menuName === menuName) {
            return true;
          }
          return false;
        });

        if (closeAllFlag) {
          if (findIndex === -1) {
            this.tagNavList = [];
            this.clearKeepAliveIncludes();
            this.instanceStateMap = {};
            deleted = true;
          } else {
            let tagNavElement = (this.tagNavList || [])[findIndex];
            // 保存原始的 tagNav 数组用于释放ID
            const originalTagNav = [...(this.tagNavList || [])];
            this.tagNavList = [tagNavElement];
            // 使用原始菜单名称来处理缓存
            this.clearKeepAliveIncludes(tagNavElement.menuName);
            // 保留该实例的状态，清理其他实例
            if (tagNavElement.instanceId) {
              let keepId = tagNavElement.instanceId;
              let newMap = {};
              // 保留所有匹配 keepId 的状态键
              // 包括: keepId 本身, 以及 *_instance_keepId 格式 (如 json_instance_1, history_instance_1)
              for (let key in this.instanceStateMap) {
                if (key === keepId || key.endsWith(`_instance_${keepId}`)) {
                  newMap[key] = this.instanceStateMap[key];
                }
              }
              this.instanceStateMap = newMap;
            } else {
              // 保留默认实例
              let newMap = {};
              // 保留所有默认状态的键(包括 json_default, history_default 等)
              for (let key in this.instanceStateMap) {
                if (key.endsWith("_default")) {
                  newMap[key] = this.instanceStateMap[key];
                }
              }
              this.instanceStateMap = newMap;
            }
            deleted = true;
          }
        } else {
          if (findIndex !== -1) {
            let removed = (this.tagNavList || []).splice(findIndex, 1);
            // 使用原始菜单名称来处理缓存
            // 如果是按 instanceId 关闭，则清理对应的实例状态
            let removedInstanceId =
              removed && removed[0] && removed[0].instanceId;
            if (removedInstanceId) {
              this.removeInstanceState(removedInstanceId);
              // 标记为 recently deleted
              try {
                this.recentlyDeletedKeys = this.recentlyDeletedKeys || {};
                this.recentlyDeletedKeys[removedInstanceId] = Date.now();
                // 1s 后清理
                setTimeout(() => {
                  try {
                    if (this.recentlyDeletedKeys)
                      delete this.recentlyDeletedKeys[removedInstanceId];
                  } catch (e) {}
                }, 1000);
              } catch (e) {}
            } else {
              // 如果是无实例ID的默认页被关闭，只清理该页面的默认状态
              try {
                const stateKey = menuName ? `${menuName}_default` : "default";
                this.removeInstanceState(stateKey);
              } catch (e) {
                console.error("清理状态失败:", e);
              }
              // 标记 menuName 为 recently deleted
              try {
                this.recentlyDeletedKeys = this.recentlyDeletedKeys || {};
                this.recentlyDeletedKeys[menuName] = Date.now();
                setTimeout(() => {
                  try {
                    if (this.recentlyDeletedKeys)
                      delete this.recentlyDeletedKeys[menuName];
                  } catch (e) {}
                }, 1000);
              } catch (e) {}
            }
            this.deleteKeepAliveIncludes(menuName);
            deleted = true;
          }
        }
      }

      // 保存当前 tagNav 到本地存储，确保 getter 在下一次访问不会误恢复旧数据
      localSave(localKey.USER_TAG_NAV, JSON.stringify(this.tagNavList));
      return deleted;
    },
    // 添加标签页（用于复制标签页功能）
    addTagNav(tag) {
      if (_.isEmpty(this.getTagNav)) this.tagNavList = [];
      if (!tag || !tag.menuName || tag.menuName === HOME_PAGE_NAME) {
        return;
      }
      // 如果 tag 带 instanceId，则按 instanceId 查重（允许同一路由不同 instanceId 并存）
      if (tag.instanceId) {
        let findTag = (this.tagNavList || []).find(
          (e) => e.instanceId === tag.instanceId
        );
        if (!findTag) {
          this.tagNavList.push(tag);
          localSave(localKey.USER_TAG_NAV, JSON.stringify(this.tagNavList));
        }
      } else {
        // 无 instanceId 的普通标签仍按 menuName 查重（保持单例）
        let findTag = (this.tagNavList || []).find(
          (e) => !e.instanceId && e.menuName === tag.menuName
        );
        if (!findTag) {
          this.tagNavList.push(tag);
          localSave(localKey.USER_TAG_NAV, JSON.stringify(this.tagNavList));
        }
      }
    },
    //关闭页面
    closePage(route, router, path) {
      if (!this.getTagNav || _.isEmpty(this.getTagNav)) return;
      // 先尝试从 route.query 中找到 instanceId
      let instanceId = null;
      if (route && route.query) {
        for (let key in route.query) {
          if (key.startsWith("_instance_")) {
            instanceId = route.query[key];
            break;
          }
        }
      }
      // 记录关闭前的索引和项
      let index = -1;
      if (instanceId) {
        index = this.getTagNav.findIndex((e) => e.instanceId === instanceId);
      } else {
        index = this.getTagNav.findIndex(
          (e) => e.menuName === route.name && !e.instanceId
        );
      }

      // 记录要关闭的 key
      let closeKey = instanceId || route.name;

      // 先执行删除
      const deleted = this.closeTagNav(closeKey, false);

      if (!deleted) {
        // 删除失败则回退到首页
        router.push({ name: HOME_PAGE_NAME });
        return;
      }

      // 如果提供了 path，直接跳转
      if (path) {
        router.push({ path });
        return;
      }

      // 获取删除后的列表
      const newList = this.getTagNav || [];
      if (_.isEmpty(newList) || newList.length <= 1) {
        // 仅有 Home
        router.push({ name: HOME_PAGE_NAME });
        return;
      }

      // 选择跳转目标：优先使用被删除项的 fromMenuName（如果仍存在），否则使用左侧标签或第一个可用标签
      let target = null;
      // 尝试使用原先索引的 fromMenuName
      if (index !== -1) {
        const prevItem = (this.tagNavList || [])[index];
        if (
          prevItem &&
          prevItem.fromMenuName &&
          this.getTagNav.some((e) => e.menuName === prevItem.fromMenuName)
        ) {
          target = {
            name: prevItem.fromMenuName,
            query: prevItem.fromMenuQuery,
          };
        }
      }
      if (!target) {
        // 使用左侧标签（在 newList 中，跳过 Home）
        let leftIdx = index > 0 ? index - 1 : 1;
        if (leftIdx < 1) leftIdx = 1;
        if (leftIdx >= newList.length) leftIdx = newList.length - 1;
        const left = newList[leftIdx];
        if (left) {
          target = { name: left.menuName, query: left.menuQuery };
        }
      }
      if (target) {
        router.push(target);
      } else {
        router.push({ name: HOME_PAGE_NAME });
      }
    },
    // 获取下一个可用的实例ID（数字）
    getNextInstanceId() {
      this.instanceIdCounter = (this.instanceIdCounter || 0) + 1;
      // 保存更新后的数据
      this.saveInstanceIdData();
      return this.instanceIdCounter;
    },
    resetInstanceId() {
      this.instanceIdCounter = 0;
      // 保存更新后的数据
      this.saveInstanceIdData();
      return this.instanceIdCounter;
    },
    // 加入缓存
    pushKeepAliveIncludes(val) {
      if (!val) {
        return;
      }
      if (!this.keepAliveIncludes) {
        this.keepAliveIncludes = [];
      }
      if (this.keepAliveIncludes.length < 30) {
        let number = this.keepAliveIncludes.findIndex((e) => e === val);
        if (number === -1) {
          this.keepAliveIncludes.push(val);
        }
      }
    },
    // 删除缓存
    deleteKeepAliveIncludes(val) {
      if (!this.keepAliveIncludes || !val) {
        return;
      }
      let number = this.keepAliveIncludes.findIndex((e) => e === val);
      if (number !== -1) {
        this.keepAliveIncludes.splice(number, 1);
      }
    },
    // 清空缓存
    clearKeepAliveIncludes(val) {
      if (!val || !this.keepAliveIncludes.includes(val)) {
        this.keepAliveIncludes = [];
        return;
      }
      this.keepAliveIncludes = [val];
    },
    // 重排标签页（用于拖拽排序）
    reorderTagNav(fromIndex, toIndex) {
      if (_.isEmpty(this.tagNavList) || fromIndex === toIndex) {
        return;
      }
      // 注意：getTagNav getter 会自动在开头添加 Home 标签
      // 所以传入的 fromIndex 和 toIndex 是基于包含 Home 的完整列表
      // 我们需要将索引转换为相对于 this.tagNav（不含 Home）的索引
      const adjustedFromIndex = fromIndex - 1;
      const adjustedToIndex = toIndex - 1;

      if (adjustedFromIndex < 0 || adjustedToIndex < 0) {
        // Home 标签不能移动
        return;
      }

      if (
        adjustedFromIndex >= this.tagNavList.length ||
        adjustedToIndex >= this.tagNavList.length
      ) {
        return;
      }

      // 从数组中移除元素并插入到新位置
      const [movedItem] = this.tagNavList.splice(adjustedFromIndex, 1);
      this.tagNavList.splice(adjustedToIndex, 0, movedItem);

      // 保存到本地存储
      localSave(localKey.USER_TAG_NAV, JSON.stringify(this.tagNavList));
    },
  },
});

/**
 * 构建菜单父级集合
 */
function buildMenuParentIdListMap(menuTree) {
  let menuParentIdListMap = new Map();
  recursiveBuildMenuParentIdListMap(menuTree, [], menuParentIdListMap);
  return menuParentIdListMap;
}

function recursiveBuildMenuParentIdListMap(
  menuList,
  parentMenuList,
  menuParentIdListMap
) {
  for (const e of menuList) {
    // 顶级parentMenuList清空
    if (e.parentId === 0) {
      parentMenuList = [];
    }
    let menuIdStr = e.menuId.toString();
    let cloneParentMenuList = _.cloneDeep(parentMenuList);
    if (!_.isEmpty(e.children) && e.menuName) {
      // 递归
      cloneParentMenuList.push({ name: menuIdStr, title: e.menuName });
      recursiveBuildMenuParentIdListMap(
        e.children,
        cloneParentMenuList,
        menuParentIdListMap
      );
    } else {
      menuParentIdListMap.set(menuIdStr, cloneParentMenuList);
    }
  }
}

/**
 * 构建菜单树
 *
 * @param  menuList
 * @returns
 */
function buildMenuTree(menuList) {
  //1 获取所有 有效的 目录和菜单
  let catalogAndMenuList = menuList.filter(
    (menu) =>
      menu.menuType !== MENU_TYPE_ENUM.POINTS.value &&
      menu.visibleFlag &&
      !menu.disabledFlag
  );

  //2 获取顶级目录
  let topCatalogList = catalogAndMenuList.filter((menu) => menu.parentId === 0);
  for (const topCatalog of topCatalogList) {
    buildMenuChildren(topCatalog, catalogAndMenuList);
  }
  return topCatalogList;
}

function buildMenuChildren(menu, allMenuList) {
  let children = allMenuList.filter((e) => e.parentId === menu.menuId);
  if (children.length === 0) {
    return;
  }
  menu.children = children;
  for (const item of children) {
    buildMenuChildren(item, allMenuList);
  }
}
