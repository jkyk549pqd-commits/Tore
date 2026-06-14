<!--
  * 通用设置模块
-->
<template>
  <a-form layout="horizontal" :label-col="{ span: 8 }">
    <a-form-item :label="$t('setting.language')">
      <a-select
        v-model:value="formState.language"
        @change="changeLanguage"
        style="width: 140px"
      >
        <a-select-option
          v-for="item in i18nList"
          :key="item.value"
          :value="item.value"
          >{{ item.text }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('setting.sidemenu.title')">
      <a-select
        v-model:value="formState.sideMenuSingleMode"
        @change="changeSideMenuSingleMode"
        style="width: 140px"
      >
        <a-select-option
          v-for="item in sideMenuModeList"
          :key="item.value"
          :value="item.value"
          >{{ item.text }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('setting.menu.layout')">
      <a-radio-group
        @change="changeLayout"
        button-style="solid"
        v-model:value="formState.layout"
      >
        <a-radio-button
          v-for="item in $smartEnumPlugin.getValueDescList('LAYOUT_ENUM')"
          :key="item.value"
          :value="item.value"
        >
          {{ $t(item.desc) }}
        </a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item
      :label="$t('setting.menu.width')"
      v-if="formState.layout === LAYOUT_ENUM.SIDE.value"
    >
      <a-input-number
        @change="changeSideMenuWidth"
        v-model:value="formState.sideMenuWidth"
        :min="1"
      />
      像素（px）
    </a-form-item>
    <a-form-item
      :label="$t('setting.page.width')"
      v-if="formState.layout === LAYOUT_ENUM.TOP.value"
    >
      <a-input @change="changePageWidth" v-model:value="formState.pageWidth" />
      像素（px）或者 百分比
    </a-form-item>
    <a-form-item :label="$t('setting.bread')">
      <a-switch
        @change="changeBreadCrumbFlag"
        v-model:checked="formState.breadCrumbFlag"
        :checked-children="$t('setting.bread.show')"
        :un-checked-children="$t('setting.bread.hide')"
      />
    </a-form-item>
    <a-form-item :label="$t('setting.pagetag')">
      <a-switch
        @change="changePageTagFlag"
        v-model:checked="formState.pageTagFlag"
        :checked-children="$t('setting.pagetag.show')"
        :un-checked-children="$t('setting.pagetag.hide')"
      />
    </a-form-item>
    <a-form-item :label="$t('setting.tooltip')">
      <a-switch
        @change="changeShowTooltipsFlag"
        v-model:checked="formState.showTooltipsFlag"
        :checked-children="$t('setting.tooltip.show')"
        :un-checked-children="$t('setting.tooltip.hide')"
      />
    </a-form-item>
    <a-form-item :label="$t('setting.keepTabs')">
      <a-switch
        @change="changeKeepTabsOnClose"
        v-model:checked="formState.keepTabsOnClose"
        :checked-children="$t('setting.keepTabs.keep')"
        :un-checked-children="$t('setting.keepTabs.clear')"
      />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, computed, watch } from "vue";
import { i18nList } from "/@/i18n/index";
import { useI18n } from "vue-i18n";
import { LAYOUT_ENUM } from "/@/constants/layout-const";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { socketClient } from "/@/utils/socket-client";

const appConfigStore = useAppConfigStore();
const { locale, t } = useI18n();

// 表单状态
let formValue = {
  language: appConfigStore.language,
  layout: appConfigStore.layout,
  pageWidth: appConfigStore.pageWidth,
  sideMenuWidth: appConfigStore.sideMenuWidth,
  sideMenuTheme: appConfigStore.sideMenuTheme,
  pageTagFlag: appConfigStore.pageTagFlag,
  breadCrumbFlag: appConfigStore.breadCrumbFlag,
  sideMenuSingleMode: appConfigStore.sideMenuSingleMode,
  showTooltipsFlag: appConfigStore.showTooltipsFlag,
  keepTabsOnClose: appConfigStore.keepTabsOnClose,
};

let formState = reactive({ ...formValue });

// 菜单模式选项列表（响应式，随语言切换自动更新）
const sideMenuModeList = computed(() => [
  { value: "single", text: t("setting.sidemenu.singlemode") },
  { value: "multi", text: t("setting.sidemenu.mutimode") },
]);

// 配置变更函数
async function changeLanguage(languageValue) {
  locale.value = languageValue;
  appConfigStore.updateConfig({
    language: languageValue,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    language: languageValue,
  });
  console.log("配置已保存到数据库:", updResult);
}

async function changeLayout(e) {
  appConfigStore.updateConfig({
    layout: e.target.value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    layout: e.target.value,
  });
}

async function changeSideMenuWidth(value) {
  appConfigStore.updateConfig({
    sideMenuWidth: value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    sideMenuWidth: value,
  });
}

async function changePageWidth(e) {
  appConfigStore.updateConfig({
    pageWidth: e.target.value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    pageWidth: e.target.value,
  });
}

async function changeBreadCrumbFlag(e) {
  appConfigStore.updateConfig({
    breadCrumbFlag: e,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    breadCrumbFlag: e,
  });
}

async function changePageTagFlag(e) {
  appConfigStore.updateConfig({
    pageTagFlag: e,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    pageTagFlag: e,
  });
}

async function changeSideMenuSingleMode(value) {
  appConfigStore.updateConfig({
    sideMenuSingleMode: value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    sideMenuSingleMode: value,
  });
}

async function changeShowTooltipsFlag(e) {
  appConfigStore.updateConfig({
    showTooltipsFlag: e,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    showTooltipsFlag: e,
  });
}

async function changeKeepTabsOnClose(e) {
  appConfigStore.updateConfig({
    keepTabsOnClose: e,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    keepTabsOnClose: e,
  });
}
</script>
