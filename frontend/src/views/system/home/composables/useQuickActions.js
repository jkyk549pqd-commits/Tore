/**
 * 快速操作相关的 Composable
 * 处理首页快速入口功能的导航逻辑
 */
import { useRouter } from "vue-router";
import { ref } from "vue";

export function useQuickActions() {
  const router = useRouter();

  // 导入弹框的显示状态
  const importDialogVisible = ref(false);

  /**
   * 跳转到 JSON 格式化页面
   */
  function handleJsonFormat() {
    router.push("/json");
  }

  function handleJsonClipboard() {
    router.push({
      path: "/json",
      query: {
        paste: "true",
        _instance_: Date.now(),
      },
    });
  }

  /**
   * 跳转到历史记录页面
   */
  function handleHistory() {
    router.push("/jsonHis");
  }

  /**
   * 显示导入弹框
   */
  function handleImport() {
    importDialogVisible.value = true;
  }

  return {
    handleJsonFormat,
    handleJsonClipboard,
    handleHistory,
    handleImport,
    importDialogVisible,
  };
}
