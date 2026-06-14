<!--
  * 设置模块
  * 
-->
<template>
  <a-drawer
    :title="$t('setting.title')"
    placement="right"
    :open="visible"
    :width="500"
    @close="close"
  >
    <a-tabs
      type="border-card"
      v-model:activeKey="activeTab"
      class="custom-tabs-setting"
    >
      <!-- 设置选项卡 -->
      <a-tab-pane :key="'settings'" :tab="$t('setting.general')">
        <SettingGeneral />
      </a-tab-pane>
      <!-- 首页布局选项卡 -->
      <a-tab-pane :key="'homeLayout'" :tab="$t('setting.homeLayout')">
        <SettingHomeLayout />
      </a-tab-pane>
      <!-- 按钮配置选项卡 -->
      <a-tab-pane :key="'buttons'" :tab="$t('setting.button')">
        <SettingButton :visible="visible" />
      </a-tab-pane>
      <!-- 保存选项卡 -->
      <a-tab-pane :key="'save'" :tab="$t('setting.save')">
        <SettingSave />
      </a-tab-pane>
      <!-- 二维码选项卡 -->
      <a-tab-pane :key="'qrcode'" :tab="$t('setting.other')">
        <SettingQrcode />
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup>
import { ref } from "vue";
import SettingGeneral from "./setting-general.vue";
import SettingHomeLayout from "./setting-home-layout.vue";
import SettingButton from "./setting-button.vue";
import SettingSave from "./setting-save.vue";
import SettingQrcode from "./setting-qrcode.vue";

// ----------------- modal 显示与隐藏 -----------------

const visible = ref(false);
defineExpose({
  show,
});

function close() {
  visible.value = false;
}

function show() {
  visible.value = true;
}

// ----------------- 当前激活的选项卡 -----------------

const activeTab = ref("settings");
</script>

<style lang="less" scoped>
// 自定义tabs样式 - 参考page-tag组件的实现方式
.custom-tabs-setting {
  :deep(.ant-tabs-tab) {
    padding: 4px 8px;
    margin: 2px 2px !important;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  :deep(.ant-tabs-ink-bar) {
    display: none;
  }
}

.footer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: left;
  z-index: 1;
}
</style>
