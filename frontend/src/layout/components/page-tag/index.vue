<!--
  * 标签页
  * 
-->
<template>
  <!-- 标签页，共两部分：1、标签 ；2、标签操作区 -->
  <a-row
    style="
      border-bottom: 1px solid var(--el-border-color-lighter, #eeeeee);
      position: relative;
    "
    v-show="pageTagFlag"
  >
    <div class="smart-page-tag">
      <a-tabs
        style="width: 100%"
        :tab-position="mode"
        v-model:activeKey="selectedKey"
        size="small"
        @tabClick="selectTab"
      >
        <a-tab-pane
          v-for="item in tagNavWithUnsavedStatus"
          :key="String(item.instanceId || item.menuName)"
        >
          <template #tab>
            <a-dropdown :trigger="['contextmenu']">
              <span @mousedown="handleMiddleClick($event, item)">
                {{ item.displayName }}
                <!-- 显示未保存标识 -->
                <span
                  v-if="item.hasUnsavedChanges"
                  style="color: #ff4d4f; margin-left: 4px; font-weight: bold"
                  >*</span
                >
                <close-outlined
                  @click.stop="closeTag(item, false)"
                  v-if="item.menuName !== HOME_PAGE_NAME"
                  class="smart-page-tag-close"
                />
              </span>
              <template #overlay>
                <a-menu>
                  <a-menu-item
                    v-if="isMultiMode && !isHomeTab(item)"
                    @click="copyTab(item)"
                    >{{ $t("menu.copytab") }}</a-menu-item
                  >
                  <a-menu-item
                    v-if="!isHomeTab(item) && !isHistoryTab(item)"
                    @click="renameTab(item)"
                    >{{ $t("menu.renametab") }}</a-menu-item
                  >
                  <a-menu-item @click="closeOther(item)">{{
                    $t("menu.closeother")
                  }}</a-menu-item>
                  <a-menu-item @click="closeAll()">{{
                    $t("menu.closeall")
                  }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-dropdown>
      <!--标签页操作区-->
      <div class="smart-page-tag-operate">
        <div class="smart-page-tag-operate-icon">
          <AppstoreOutlined />
        </div>
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="closeAll()">{{
            $t("menu.closeall")
          }}</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-row>
</template>

<script setup>
import { AppstoreOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { ElMessageBox } from "element-plus";
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { useUserStore } from "/@/store/modules/system/user";
import { localSave } from "/@/utils/local-util";
import localKey from "/@/constants/local-storage-key-const";
import Sortable from "sortablejs";

// 获取 Vue 实例以使用 $t 函数
const { proxy } = getCurrentInstance();
const $t = proxy.$t;
//标签页 是否显示
const pageTagFlag = computed(() => useAppConfigStore().$state.pageTagFlag);
const router = useRouter();
const route = useRoute();
const mode = ref("top");
const tagNav = computed(() => useUserStore().getTagNav || []);
const userStore = useUserStore();

// 检查是否为多实例模式
const isMultiMode = computed(
  () => useAppConfigStore().$state.sideMenuSingleMode === "multi"
);
// 计算每个标签的未保存状态和显示名称(使用computed,避免在模板中重复调用)
const tagNavWithUnsavedStatus = computed(() => {
  const tags = tagNav.value || [];
  return tags.map((item) => {
    // 支持 json 和 text-editor 页面显示未保存标识
    const isJsonPage = item.menuName === "902" || item.menuName === "json";
    const isTextEditorPage =
      item.menuName === "textEditor" || item.menuName === "908";
    const isCodeEditorPage =
      item.menuName === "codeEditor" || item.menuName === "901" || item.menuName === "909";

    if (!item || (!isJsonPage && !isTextEditorPage && !isCodeEditorPage)) {
      const baseName = item.customName
        ? item.customName
        : item.menuTitle
        ? $t(item.menuTitle)
        : "";
      const displayName = item.instanceId
        ? `${baseName}-${item.instanceId}`
        : baseName;
      return {
        ...item,
        hasUnsavedChanges: false,
        displayName,
      };
    }

    // 直接使用 item.menuName 生成 stateKey，与组件内部保持一致
    const stateKey = item.instanceId
      ? `${item.menuName}_instance_${item.instanceId}`
      : `${item.menuName}_default`;

    // 获取保存状态
    const state = userStore.getInstanceState(stateKey);
    // 统一使用 isContentSaved 字段判断未保存状态
    const hasUnsavedChanges = state && state.isContentSaved === false;

    // 预计算显示名称
    const tabBaseName = item.customName
      ? item.customName
      : item.menuTitle
      ? $t(item.menuTitle)
      : "";
    const displayName = item.instanceId
      ? `${tabBaseName}-${item.instanceId}`
      : tabBaseName;
    return {
      ...item,
      hasUnsavedChanges,
      displayName,
    };
  });
});

// 检查指定标签是否为Home页面
function isHomeTab(item) {
  return item && item.menuName === HOME_PAGE_NAME;
}

function isHistoryTab(item) {
  // console.log("isHistoryTab:", item);
  return item && (item.menuName === "909" || item.menuName === "menu.jsonHis");
}

// helper: 从 route.query 中获取 instanceId（若存在），否则返回 route.name
function getInstanceIdFromRoute(route) {
  if (route.query) {
    for (let k in route.query) {
      if (k.startsWith("_instance_")) return String(route.query[k]); // 统一转换为字符串
    }
  }
  return String(route.name || ""); // 统一转换为字符串
}

const selectedKey = ref(getInstanceIdFromRoute(route));

// 监听 route 的变化（包括 query）以更新激活 key
watch(
  () => [route.name, route.query],
  () => {
    const newKey = getInstanceIdFromRoute(route);
    // 只有当 key 真正改变时才更新，避免不必要的重渲染
    if (selectedKey.value !== newKey) {
      selectedKey.value = newKey;
    }
  },
  { immediate: true }
);

//选择某个标签页
async function selectTab(name) {
  // 统一转换为字符串，与 tab-pane 的 key 保持一致
  // tab-pane 的 key 生成逻辑：:key="String(item.instanceId || item.menuName)"
  const targetKey = String(name);
  const currentKey = String(selectedKey.value);

  if (currentKey === targetKey) {
    return;
  }

  // 按照 tab-pane 的 key 生成逻辑查找标签
  // key = item.instanceId || item.menuName ；注意：需要统一转换为字符串进行比较
  let tag = tagNav.value.find((e) => {
    const tabKey = String(e.instanceId || e.menuName);
    return tabKey === targetKey;
  });

  if (!tag) {
    router.push({ name: HOME_PAGE_NAME });
    return;
  }

  // 优化：在路由跳转前立即设置 selectedKey，提供即时视觉反馈；使用字符串类型，与 tab-pane 的 key 保持一致
  selectedKey.value = targetKey;

  router.push({ name: tag.menuName, query: tag.menuQuery }).catch((err) => {
    console.error("selectTab 路由跳转失败:", err);
  });
}

// 关闭其他标签（保留右键点击的标签）
function closeOther(item) {
  if (item) {
    // 关闭其他tag（保留右键点击的标签）
    userStore.closeTagNav(item.instanceId || item.menuName, true);
  }
}

// 关闭所有标签
function closeAll() {
  userStore.closeTagNav(null, true);
  router.push({ name: HOME_PAGE_NAME });
}

// 复制指定的标签页
async function copyTab(item) {
  if (isHomeTab(item)) {
    return;
  }

  // 获取下一个可用的实例ID（数字）
  const instanceId = userStore.getNextInstanceId();
  const instanceIdKey = `_instance_${instanceId}`;
  const instanceIdStr = String(instanceId);

  // 复制当前标签页的查询参数，添加实例ID
  const newQuery = item.menuQuery ? { ...item.menuQuery } : {};
  // 如果当前标签页已经有instanceId，则移除它，添加新的instanceId
  Object.keys(newQuery).forEach((key) => {
    if (key.startsWith("_instance_")) {
      delete newQuery[key];
    }
  });
  newQuery[instanceIdKey] = instanceId;

  // 设置 selectedKey 为新的实例ID（使用字符串类型）
  selectedKey.value = instanceIdStr;

  // 路由跳转到新的标签页（使用 item.menuName 而不是 route.name）
  // 路由守卫会自动调用 setTagNav 来添加新标签，避免重复调用
  await router.push({ name: item.menuName, query: newQuery });
}

// 重命名指定的标签页
async function renameTab(item) {
  if (isHomeTab(item) || isHistoryTab(item)) {
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt(
      $t("message.enterNewName"),
      $t("menu.renametab"),
      {
        confirmButtonText: $t("message.confirm"),
        cancelButtonText: $t("message.cancel"),
        inputValue: item.customName || $t(item.menuTitle),
        draggable: true,
        customClass: "confirm-dialog-rename",
      }
    );

    if (value && value.trim()) {
      // 直接从 userStore.tagNavList 中查找并更新（不包含 Home 标签）
      const tagIndex = userStore.tagNavList.findIndex(
        (e) => e.instanceId === item.instanceId && e.menuName === item.menuName
      );
      if (tagIndex !== -1) {
        userStore.tagNavList[tagIndex].customName = value.trim();
        // 保存到 localStorage
        localSave(localKey.USER_TAG_NAV, JSON.stringify(userStore.tagNavList));
      }
    }
  } catch (error) {
    // 用户取消操作，不做处理
    if (error !== "cancel") {
      console.error("重命名标签页失败:", error);
    }
  }
}

//处理鼠标中键点击事件
function handleMiddleClick(event, item) {
  // 鼠标中键(button === 1)
  if (event.button === 1) {
    // 阻止中键的默认行为（如在新标签页打开链接）
    event.preventDefault();

    if (item.menuName === HOME_PAGE_NAME) {
      return; // 不允许关闭Home标签
    }

    // 检查未保存状态
    if (item.hasUnsavedChanges) {
      // 使用 ElMessageBox 显示确认对话框
      ElMessageBox.confirm(
        $t("message.unsavedChangesWarning"),
        $t("message.confirmClose"),
        {
          confirmButtonText: $t("message.confirm"),
          cancelButtonText: $t("message.cancel"),
          type: "warning",
          draggable: true,
          customClass: "confirm-dialog-with-hover-effects",
        }
      )
        .then(() => {
          // 用户点击确认
          closeTag(item, false);
        })
        .catch(() => {
          // 用户点击取消或关闭对话框
        });
    } else {
      closeTag(item, false);
    }
  }
  // 左键(button === 0)和右键(button === 2)不阻止默认行为，允许拖拽等功能正常工作
}

//直接关闭
function closeTag(item, closeAllFlag) {
  // 关闭单个tag
  if (item && !closeAllFlag) {
    // 使用 store 提供的 closePage 来处理关闭与路由跳转，避免时序与重复添加标签问题
    userStore.closePage({ name: item.menuName, query: item.menuQuery }, router);
    return;
  } else if (item && closeAllFlag) {
    // 关闭其他tag（保留当前选中的标签）
    userStore.closeTagNav(item.instanceId || item.menuName, true);
    // 保持在当前标签,不进行路由跳转
  } else if (!item && closeAllFlag) {
    // 关闭所有tag
    userStore.closeTagNav(null, true);
    router.push({ name: HOME_PAGE_NAME });
  }
}

// ----------------------- 拖拽排序相关 -----------------------
let sortableInstance = null;

// 初始化拖拽排序
function initSortable() {
  const navEl = document.querySelector(".smart-page-tag .ant-tabs-nav-list");
  if (!navEl) return;

  // 如果已经初始化过，先销毁
  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = Sortable.create(navEl, {
    swap: true,
    animation: 150,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    delay: 80, // 延迟触发，防止误触
    delayOnTouchOnly: true,
    ghostClass: "sortable-ghost",
    dragClass: "sortable-drag",
    chosenClass: "sortable-chosen",
    // 过滤掉 Home 标签，不允许拖动
    filter: (evt, item) => {
      // 检查是否是第一个标签（Home 标签）
      const allTabs = navEl.querySelectorAll(".ant-tabs-tab");
      if (allTabs[0] === item) {
        return true; // 过滤掉 Home 标签
      }
      return false; // 其他标签（包括激活标签）都可以拖动
    },
    preventOnFilter: false,
    // 拖拽开始
    onStart(evt) {
      // 仅提升层级，背景色由 CSS .sortable-chosen 类控制
      evt.item.style.zIndex = "10000";
    },
    // 拖拽中（位置改变）
    onMove(evt) {
      // 阻止拖动到 Home 标签之前
      const allTabs = navEl.querySelectorAll(".ant-tabs-tab");
      const homeTab = allTabs[0];

      // 如果拖动的元素要在 Home 标签之前插入
      if (evt.related === homeTab && evt.willInsertAfter === false) {
        return false; // 阻止移动
      }

      return true; // 允许移动
    },
    // 拖拽结束
    onEnd(evt) {
      const { oldIndex, newIndex } = evt;

      // 恢复样式
      evt.item.style.zIndex = "";

      // oldIndex 和 newIndex 是相对于整个 nav-list 的索引
      // 需要转换为相对于 tagNav 数组的索引
      // 注意：getTagNav getter 会自动在开头添加 Home 标签
      // 所以传入的索引需要包含 Home
      if (
        oldIndex !== undefined &&
        newIndex !== undefined &&
        oldIndex !== newIndex
      ) {
        // 调用 store 的重排方法
        userStore.reorderTagNav(oldIndex, newIndex);
      }
    },
  });
}

// 监听标签页数量变化，重新初始化拖拽
// 移除 deep: true,改为只监听数组长度变化,避免频繁触发Sortable初始化
watch(
  () => tagNav.value.length,
  (newLength, oldLength) => {
    // 只有标签数量变化时才重新初始化
    if (newLength !== oldLength) {
      // 等待 DOM 更新后重新初始化
      setTimeout(() => {
        initSortable();
      }, 100);
    }
  }
);

onMounted(() => {
  // 等待 DOM 渲染完成后初始化
  setTimeout(() => {
    initSortable();
  }, 200);
});

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
});
</script>

<style lang="less" scoped src="./index.less"></style>
<style lang="less">
.confirm-dialog-rename {
  border-radius: 16px;

  .el-button {
    transition: all 0.3s ease;
    border-radius: 16px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
