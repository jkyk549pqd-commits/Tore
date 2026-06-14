/*
 * 首页路由
 *
 */
import { HOME_PAGE_NAME } from "/@/constants/system/home-const";
import { MENU_TYPE_ENUM } from "/@/constants/system/menu-const";
import SmartLayout from "/@/layout/index.vue";

export const homeRouters = [
  {
    path: "/",
    name: "_home",
    redirect: { name: HOME_PAGE_NAME },
    component: SmartLayout,
    meta: {
      title: "home.home",
      menuType: MENU_TYPE_ENUM.CATALOG.value,
      icon: "HomeOutlined",
    },
    children: [
      {
        path: "/home",
        name: HOME_PAGE_NAME,
        meta: {
          title: "home.home",
          menuType: MENU_TYPE_ENUM.MENU.value,
          icon: "HomeOutlined",
          parentMenuList: [{ name: "_home", title: "home.home" }],
        },
        component: () => import("/@/views/system/home/index.vue"),
      },
    ],
  },
];
