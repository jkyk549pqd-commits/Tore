<!--
  * 传统菜单-递归菜单
  * 
-->
<template>
  <a-sub-menu :key="menuInfo.menuId">
    <template #icon>
      <span class="sub-menu-icon-wrapper">
        <component :is="$antIcons[menuInfo.icon]" />
      </span>
    </template>
    <template #title>{{ $t(menuInfo.menuName) }}</template>
    <template v-for="item in menuInfo.children" :key="item.menuId">
      <template v-if="item.visibleFlag && !item.disabledFlag">
        <template v-if="!item.children">
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
  </a-sub-menu>
</template>
<script setup>
const props = defineProps({
  menuInfo: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits(["turnToPage"]);
const turnToPage = (menu) => {
  emits("turnToPage", menu);
};
</script>

<style lang="less" scoped>
.menu-blk {
  // 确保菜单项内容垂直居中对齐
  display: flex;
  align-items: center;

  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    // 为icon添加右边距，与文本保持适当间距
    margin-right: 1px;
  }
}

.menu-blk :deep(.anticon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  // 确保icon的垂直对齐
  vertical-align: middle;
}

.menu-blk:hover :deep(.anticon) {
  animation: rotate 0.15s forwards;
}

.sub-menu-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  // 为子菜单icon添加右边距
  margin-right: 8px;
}

.sub-menu-icon-wrapper :deep(.anticon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  // 确保icon的垂直对齐
  vertical-align: middle;
}

:deep(.ant-menu-submenu-title:hover .anticon) {
  animation: rotate 0.15s forwards;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
