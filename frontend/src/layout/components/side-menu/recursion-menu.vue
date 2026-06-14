<!--
  * 传统菜单-递归菜单
  * 
-->
<template>
  <a-menu
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    class="smart-menu"
    mode="inline"
    :theme="theme"
    :inlineCollapsed="collapsed"
  >
    <template v-for="item in menuTree" :key="item.menuId">
      <template v-if="item.visibleFlag && !item.disabledFlag">
        <template v-if="$lodash.isEmpty(item.children)">
          <a-menu-item
            class="menu-blk"
            :key="item.menuId"
            @click="turnToPage(item)"
          >
            <template #icon>
              <span class="icon-wrapper">
                <component :is="$antIcons[item.icon]" />
              </span>
            </template>
            {{ $t(item.menuName) }}
          </a-menu-item>
        </template>
        <template v-else>
          <SubMenu
            :menu-info="item"
            :key="item.menuId"
            @turnToPage="turnToPage"
          />
        </template>
      </template>
    </template>
  </a-menu>
</template>
<script setup>
import _ from "lodash";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SubMenu from "./sub-menu.vue";
import { router } from "/@/router/index";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useUserStore } from "/@/store/modules/system/user";
import { useThemeStore } from "/@/store/modules/theme";

const theme = computed(() => useThemeStore().currentTheme);

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const menuTree = computed(() => useUserStore().getMenuTree || []);

//展开的菜单
let currentRoute = useRoute();
const selectedKeys = ref([]);
const openKeys = ref([]);

// 页面跳转
function turnToPage(menu) {
  useUserStore().deleteKeepAliveIncludes(menu.menuId.toString());
  router.push({ path: menu.path });
}

/**
 * SmartAdmin中 router的name 就是 后端存储menu的id
 * 所以此处可以直接监听路由，根据路由更新菜单的选中和展开
 */
function updateOpenKeysAndSelectKeys() {
  // 更新选中
  selectedKeys.value = [_.toNumber(currentRoute.name)];

  /**
   * 更新展开（1、获取新展开的menu key集合；2、保留原有的openkeys，然后把新展开的与之合并）
   */
  //获取需要展开的menu key集合
  let menuParentIdListMap = useUserStore().getMenuParentIdListMap;
  let parentList = menuParentIdListMap.get(currentRoute.name) || [];

  // 如果是折叠菜单的话，则不需要设置openkey
  if (!props.collapsed) {
    // 使用lodash的union函数，进行 去重合并两个数组
    let needOpenKeys = _.map(parentList, "name").map(Number);
    openKeys.value = _.union(openKeys.value, needOpenKeys);
  }
}

// 使用防抖函数包装,减少路由变化时的DOM更新频率
const updateOpenKeysAndSelectKeysDebounced = _.debounce(
  updateOpenKeysAndSelectKeys,
  100
);

watch(
  currentRoute,
  () => {
    updateOpenKeysAndSelectKeysDebounced();
  },
  {
    immediate: true,
  }
);

defineExpose({
  updateOpenKeysAndSelectKeys,
});
</script>

<style lang="less" scoped>
.smart-menu {
  background: none;
  position: relative;
}

.menu-blk {
  // 确保菜单项内容垂直居中对齐
  display: flex;
  align-items: center;

  .icon-wrapper {
    margin-top: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    // 为icon添加右边距，与文本保持适当间距
    margin-right: 1px;
  }
}

.menu-blk .icon-wrapper :deep(.anticon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  // 确保icon的垂直对齐
  vertical-align: middle;
}

// .menu-blk:hover .icon-wrapper :deep(.anticon) {
//   animation: rotate-icon 0.6s forwards;
// }

@keyframes rotate-icon {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
