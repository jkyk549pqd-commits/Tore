/*
 *  keep-alive
 *  支持多实例标签页的缓存管理
 */
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "/@/store/modules/system/user";

// 从路由中获取实例ID
function getInstanceIdFromQuery(query) {
  if (!query) return null;
  for (let key in query) {
    if (key.startsWith("_instance_")) return String(query[key]);
  }
  return null;
}

// 获取实例级别的缓存key
function getInstanceKey(route) {
  const instanceId = getInstanceIdFromQuery(route.query);
  if (instanceId) {
    // 如果有实例ID，返回实例ID
    return instanceId;
  }
  // 否则返回路由名称
  return route.name;
}

export function smartKeepAlive() {
  const route = useRoute();
  const router = useRouter();

  // 需要keep-alive的页面
  const keepAliveIncludes = computed(() => {
    const includes = useUserStore().keepAliveIncludes || [];
    
    // 如果当前路由有实例ID，需要确保原始 componentName 也在 includes 中
    // 因为组件的 name 是固定的 menuId（如 "902", "906"）
    const instanceId = getInstanceIdFromQuery(route.query);
    if (instanceId) {
      // 多实例模式：keep-alive 通过组件的 name (menuId) 来匹配
      // 组件的 name 是固定的，所以 includes 中必须包含原始的 menuId
      // 例如: 组件 name="902", includes 应该包含 "902"
      const componentName = String(route.name);
      
      // 确保 includes 中包含组件的 name
      if (!includes.includes(componentName)) {
        return [...includes, componentName];
      }
    }
    
    return includes;
  });

  // ----------------------- iframe相关 -----------------------

  // 当前路由是否为不需要缓存的iframe页面
  const iframeNotKeepAlivePageFlag = computed(
    () => route.meta.frameFlag && !route.meta.keepAlive
  );
  const tagNav = computed(() => useUserStore().getTagNav || []);
  // 已打开的iframe列表
  const keepAliveIframePages = computed(() => {
    let routes = router.getRoutes();
    return routes.filter(
      (e) =>
        e.meta.frameFlag &&
        e.meta.keepAlive &&
        tagNav.value.some((t) => t.menuName == e.name)
    );
  });
  return {
    route,
    keepAliveIncludes,
    iframeNotKeepAlivePageFlag,
    keepAliveIframePages,
    getInstanceKey,
  };
}
