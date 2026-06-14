import { ElMessage, ElMessageBox } from "element-plus";
import {
  computed,
  onMounted,
  onActivated,
  onBeforeUnmount,
  reactive,
  ref,
  nextTick,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { logApi } from "/@/api/system/log-api";
import { logVersionApi } from "/@/api/system/log-version-api";
import { smartSentry } from "/@/lib/smart-sentry";
import { useUserStore } from "/@/store/modules/system/user";
import nProgress from "nprogress";

// 导入统一的状态管理工具
import {
  initializeInstanceState,
  handleActivatedState,
  handleRouteQueryChange,
  genStateKey,
} from "/@/utils/instance-state-manager";

// ------------------------ 表格列定义 ------------------------
export const columns = [
  {
    title: "history.table.id",
    dataIndex: "id",
    columnKey: "id",
    width: 70,
    minWidth: 40,
    align: "center",
    key: "id",
  },
  {
    title: "history.table.type",
    dataIndex: "type",
    columnKey: "type",
    width: 100,
    align: "center",
    key: "type",
  },
  {
    title: "history.table.optType",
    dataIndex: "optType",
    columnKey: "optType",
    width: 120,
    align: "center",
    key: "optType",
  },
  {
    title: "history.table.parentPage",
    dataIndex: "parentPage",
    columnKey: "parentPage",
    width: 100,
    align: "center",
    key: "parentPage",
  },
  {
    title: "history.table.tag",
    dataIndex: "tag",
    columnKey: "tag",
    width: 120,
    align: "center",
    key: "tag",
  },
  {
    title: "history.table.content",
    dataIndex: "content",
    columnKey: "content",
    width: 200,
    align: "center",
    key: "content",
  },
  {
    title: "history.table.crtTime",
    dataIndex: "crtTime",
    columnKey: "crtTime",
    width: 160,
    align: "center",
    key: "crtTime",
  },
  {
    title: "history.table.updTime",
    dataIndex: "updTime",
    columnKey: "updTime",
    width: 160,
    minWidth: 120,
    align: "center",
    key: "updTime",
  },
  {
    title: "history.table.operate",
    dataIndex: "operate",
    columnKey: "operate",
    width: 250,
    minWidth: 200,
    fixed: "right",
    align: "center",
    key: "operate",
  },
];

// ------------------------ 查询表单 ------------------------
const queryFormState = {
  type: "",
  optType: "",
  tag: "",
  parentPage: "",
  keyword: "",
};

// ------------------------ 工具函数 ------------------------
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ------------------------ 主要逻辑 composable ------------------------
export function useHistory() {
  const { t } = useI18n();
  const route = useRoute();
  const userStore = useUserStore();

  // 实例状态管理
  const instanceId = ref(null);
  const routeName = ref(route.name || "906"); // 路由名称 (menuId: 906)
  const stateKey = ref(genStateKey(null, routeName.value));
  const isRestoringState = ref(false); // 标志位:控制 watch 是否保存状态

  // 查询表单
  const queryForm = reactive({ ...queryFormState });

  // 表格数据
  const tableLoading = ref(false);
  const tableData = ref([]);

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => t("history.pagination.total", { total }),
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  // 多选操作
  const selectedRowKeys = ref([]);
  let selectedRows = [];
  const hasSelected = computed(() => selectedRowKeys.value.length > 0);

  // 模态框引用
  const logOperateModal = ref();

  // ------------------------ 状态管理辅助函数 ------------------------

  // 保存当前实例状态
  function saveInstanceState() {
    const currentState = {
      queryForm: { ...queryForm },
      pagination: { ...pagination },
    };
    userStore.setInstanceState(stateKey.value, currentState);
  }

  // 恢复实例状态
  function restoreInstanceState() {
    const state = userStore.getInstanceState(stateKey.value);
    if (state) {
      Object.assign(queryForm, state.queryForm || {});
      Object.assign(
        pagination,
        state.pagination || { current: 1, pageSize: 10, total: 0 }
      );
      return true;
    }
    return false;
  }

  // 重置查询
  function resetQuery() {
    Object.assign(queryForm, queryFormState);
    query();
  }

  // 查询日志
  async function query() {
    nProgress.start(); // 显示顶部进度条
    try {
      tableLoading.value = true;

      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        type: queryForm.type || undefined,
        optType: queryForm.optType || undefined,
        tag: queryForm.tag || undefined,
        parentPage: queryForm.parentPage || undefined,
      };

      let response;

      // 如果有关键词，使用全文检索
      if (queryForm.keyword && queryForm.keyword.trim()) {
        params.keyword = queryForm.keyword.trim();
        response = await logApi.searchLogsByKeyword(params);
      } else {
        // 否则使用普通分页查询
        response = await logApi.getLogsPage(params);
      }

      // console.log("日志数据：", response);
      if (response) {
        // 字段名映射：将后端的下划线命名转换为前端的驼峰命名
        const mappedData = (response.list || []).map((item) => ({
          ...item,
          parentPage: item.parent_page,
          optType: item.opt_type,
          crtTime: item.crt_time,
          updTime: item.upd_time,
        }));
        tableData.value = mappedData;
        pagination.total = response.total || 0;
      }
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
      nProgress.done(); // 隐藏顶部进度条
    }
  }

  // 表格变化处理
  function handleTableChange(pag, filters, sorter) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    query();
  }

  // 多选变化
  function onSelectChange(keyArray, selectRows) {
    selectedRowKeys.value = keyArray;
    selectedRows = selectRows;
  }

  // 单个删除
  function singleDelete(record) {
    confirmBatchDelete([record]);
  }

  // 批量删除
  function batchDelete() {
    confirmBatchDelete(selectedRows);
  }

  // 确认批量删除
  function confirmBatchDelete(logArray) {
    const logIdArray = logArray.map((e) => e.id);

    ElMessageBox.confirm(
      t("history.confirm.deleteContent", { count: logArray.length }),
      t("history.confirm.deleteTitle"),
      {
        confirmButtonText: t("history.confirm.okText"),
        cancelButtonText: t("history.confirm.cancelText"),
        type: "warning",
        draggable: true,
        customClass: "confirm-dialog-with-hover-effects",
      }
    )
      .then(() => {
        // 用户点击确认
        requestBatchDelete(logIdArray);
        selectedRows = [];
        selectedRowKeys.value = [];
      })
      .catch(() => {
        // 用户点击取消或关闭对话框
      });

    async function requestBatchDelete(logIdList) {
      nProgress.start(); // 显示顶部进度条
      try {
        // 逐个删除（同时清理版本记录）
        for (const id of logIdList) {
          await logVersionApi.deleteLogVersionsByLogId(id);
          await logApi.deleteLog(id);
        }
        ElMessage.success(t("history.msg.deleteSuccess"));
        query();
      } catch (e) {
        smartSentry.captureError(e);
        ElMessage.error(t("history.msg.deleteFailed"));
      } finally {
        nProgress.done();
      }
    }
  }

  // 显示操作抽屉
  function openDrawer(rowData) {
    logOperateModal.value.showDrawer(rowData);
  }

  // ------------------------ 生命周期钩子 ------------------------

  // 监听路由查询变化
  watch(
    () => route.query,
    (newQuery, oldQuery) => {
      // 如果正在恢复状态,不处理
      if (isRestoringState.value) {
        console.log("路由 query watch: 正在恢复状态,跳过");
        return;
      }

      // 设置标志位，禁止状态保存 watch 在路由切换期间工作
      isRestoringState.value = true;

      // 先保存当前状态（使用当前 stateKey）
      saveInstanceState();

      // 然后更新 instanceId 和 stateKey
      const { oldInstanceId, newInstanceId, oldStateKey, newStateKey } =
        handleRouteQueryChange(newQuery, oldQuery, routeName.value);

      // 如果实例ID发生变化
      if (oldInstanceId !== newInstanceId) {
        instanceId.value = newInstanceId;
        stateKey.value = newStateKey;

        // 恢复新实例状态
        if (restoreInstanceState()) {
          query();
        } else {
          // 新实例，重置状态并查询
          Object.assign(queryForm, queryFormState);
          pagination.current = 1;
          pagination.pageSize = 10;
          pagination.total = 0;
          query();
        }
      }

      // 使用 nextTick 在下一个 tick 解除标志位
      nextTick(() => {
        isRestoringState.value = false;
      });
    },
    { deep: true }
  );

  // 监听主要状态变化并保存
  watch(
    [queryForm, pagination],
    () => {
      // 如果正在恢复状态,不保存状态,避免覆盖
      if (isRestoringState.value) {
        return;
      }
      saveInstanceState();
    },
    { deep: true }
  );

  // 组件挂载时初始化状态并查询数据
  onMounted(() => {
    // 更新 routeName
    routeName.value = route.name || "906";

    // 初始化实例状态
    const initResult = initializeInstanceState(route.query, routeName.value);
    instanceId.value = initResult.instanceId;
    stateKey.value = initResult.stateKey;

    // 恢复状态
    if (!restoreInstanceState()) {
      // 新实例，重置状态
      Object.assign(queryForm, queryFormState);
      pagination.current = 1;
      pagination.pageSize = 10;
      pagination.total = 0;
    }
    query();
  });

  // keep-alive 激活时恢复状态 - 优化：延迟数据加载，等待标签动画完成
  onActivated(() => {
    // 设置标志位,禁用 watch 监听器
    isRestoringState.value = true;

    // 更新 routeName
    routeName.value = route.name || "906";

    const { instanceId: activatedInstanceId, stateKey: activatedStateKey } =
      handleActivatedState(route.query, routeName.value);
    instanceId.value = activatedInstanceId;
    stateKey.value = activatedStateKey;

    // 延迟数据加载，等待标签动画完成
    setTimeout(() => {
      // 恢复状态
      if (restoreInstanceState()) {
        query();
      } else {
        // 没有保存的状态，使用默认值
        Object.assign(queryForm, queryFormState);
        pagination.current = 1;
        pagination.pageSize = 10;
        pagination.total = 0;
        query();
      }
    }, 150); // 延迟 150ms，等待标签动画完成

    // DOM 更新完成后,解除标志位
    nextTick(() => {
      isRestoringState.value = false;
    });
  });

  // 组件卸载前保存状态
  onBeforeUnmount(() => {
    saveInstanceState();
  });

  return {
    // 响应式数据
    queryForm,
    tableLoading,
    tableData,
    pagination,
    selectedRowKeys,
    hasSelected,
    logOperateModal,

    // 方法
    query,
    resetQuery,
    handleTableChange,
    onSelectChange,
    singleDelete,
    batchDelete,
    openDrawer,
  };
}
