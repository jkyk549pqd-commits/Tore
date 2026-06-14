/**
 * Code Editor 路由配置
 */
import { MENU_TYPE_ENUM } from "/@/constants/system/menu-const";
import SmartLayout from "/@/layout/index.vue";

export const codeEditorRouters = [
  {
    path: "/code-editor",
    name: "909", // 与数据库菜单ID一致
    meta: {
      title: "menu.codeEditor", // 使用国际化键名
      menuType: MENU_TYPE_ENUM.MENU.value,
      icon: "CodeOutlined",
      parentMenuList: [{ name: "_home", title: "home.home" }],
    },
    component: () => import("/@/views/system/code-editor/index.vue"),
  },
];
