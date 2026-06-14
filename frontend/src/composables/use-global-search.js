/**
 * 全局搜索逻辑
 * 集成主题系统和全文检索功能
 */
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { logApi } from "/@/api/system/log-api";
import { smartSentry } from "/@/lib/smart-sentry";
import { ElMessage } from "element-plus";

export function useGlobalSearch() {
  const router = useRouter();

  // 搜索状态
  const searchModalVisible = ref(false);
  const searchKeyword = ref("");
  const searchResults = ref([]);
  const searchLoading = ref(false);
  const isPaginating = ref(false); // 分页加载状态标记

  // 分页状态
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 键盘导航选中索引
  const selectedIndex = ref(-1);

  // 防抖搜索函数
  const debouncedSearch = useDebounceFn(performSearch, 500);

  // 打开搜索
  function openSearch() {
    searchModalVisible.value = true;
    // 自动聚焦到搜索输入框
    nextTick(() => {
      // Element Plus 的输入框结构不同，需要选择 .el-input__inner
      const inputElement = document.querySelector(
        ".search-input .el-input__inner"
      );
      if (inputElement) {
        inputElement.focus();
      }
    });
  }

  // 关闭搜索
  function closeSearch() {
    searchModalVisible.value = false;
    searchKeyword.value = "";
    searchResults.value = [];
    pagination.current = 1;
    selectedIndex.value = -1;
  }

  // 执行搜索
  async function performSearch(skipLoading = false) {
    if (!searchKeyword.value.trim()) {
      searchResults.value = [];
      pagination.total = 0;
      return;
    }

    // 如果是分页切换,设置分页加载状态,但不设置主加载状态
    if (skipLoading) {
      isPaginating.value = true;
    } else {
      searchLoading.value = true;
    }

    try {
      const response = await logApi.searchLogsByKeyword({
        keyword: searchKeyword.value.trim(),
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      });

      // 字段名映射
      searchResults.value = (response.list || []).map((item) => ({
        ...item,
        parentPage: item.parent_page,
        optType: item.opt_type,
        crtTime: item.crt_time,
        updTime: item.upd_time,
      }));

      pagination.total = response.total || 0;
      selectedIndex.value = -1;
    } catch (error) {
      smartSentry.captureError(error);
      ElMessage.error("搜索失败,请稍后重试");
    } finally {
      searchLoading.value = false;
      isPaginating.value = false;
    }
  }

  // 键盘事件处理
  function handleKeydown(event) {
    if (!searchModalVisible.value) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedIndex.value = Math.min(
          selectedIndex.value + 1,
          searchResults.value.length - 1
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
        break;

      case "Enter":
        if (
          selectedIndex.value >= 0 &&
          searchResults.value[selectedIndex.value]
        ) {
          selectResult(searchResults.value[selectedIndex.value]);
        } else {
          // 如果没有选中项,执行搜索
          debouncedSearch();
        }
        break;

      case "Escape":
        closeSearch();
        break;

      case "PageDown":
        event.preventDefault();
        if (pagination.current * pagination.pageSize < pagination.total) {
          pagination.current++;
          debouncedSearch();
        }
        break;

      case "PageUp":
        event.preventDefault();
        if (pagination.current > 1) {
          pagination.current--;
          debouncedSearch();
        }
        break;
    }
  }

  // 选择搜索结果
  function selectResult(result) {
    // 跳转到详情页 (假设有 HistoryDetail 路由)
    // 如果没有详情页,可以跳转到历史记录页面
    router.push({
      name: "History",
      query: { id: result.id },
    });
    closeSearch();
  }

  // 格式化时间
  function formatTime(timeString) {
    if (!timeString) return "-";
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 分页变化处理
  function handlePageChange(page) {
    pagination.current = page;
    // 分页切换时直接调用搜索,不使用防抖,并跳过主加载状态
    performSearch(true);
  }

  // 每页数量变化处理
  function handlePageSizeChange(pageSize) {
    pagination.pageSize = pageSize;
    pagination.current = 1; // 重置到第一页
    // 分页切换时直接调用搜索,不使用防抖,并跳过主加载状态
    performSearch(true);
  }

  return {
    searchModalVisible,
    searchKeyword,
    searchResults,
    searchLoading,
    isPaginating,
    pagination,
    selectedIndex,
    openSearch,
    closeSearch,
    performSearch,
    debouncedSearch,
    handleKeydown,
    selectResult,
    formatTime,
    handlePageChange,
    handlePageSizeChange,
  };
}
