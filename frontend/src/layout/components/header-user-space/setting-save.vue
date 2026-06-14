<!--
  * 保存配置模块
-->
<template>
  <a-form layout="horizontal" :label-col="{ span: 10 }">
    <!-- CodeEditor自动保存间隔配置 -->
    <a-form-item :label="$t('setting.codeEditorSaveInterval')">
      <a-input-number
        v-model:value="formState.codeAutoSaveInterval"
        @change="changeCodeAutoSaveInterval"
        :min="30"
        :max="3600"
        style="width: 80px"
      />
      {{ $t("setting.saveUnit") }}
    </a-form-item>

    <!-- JSON编辑器自动保存间隔配置 -->
    <a-form-item :label="$t('setting.jsonEditorSaveInterval')">
      <a-input-number
        v-model:value="formState.jsonAutoSaveInterval"
        @change="changeJsonAutoSaveInterval"
        :min="30"
        :max="3600"
        style="width: 80px"
      />
      {{ $t("setting.saveUnit") }}
    </a-form-item>

    <!-- TextEditor自动保存间隔配置 -->
    <a-form-item :label="$t('setting.textEditorSaveInterval')">
      <a-input-number
        v-model:value="formState.textAutoSaveInterval"
        @change="changeTextAutoSaveInterval"
        :min="30"
        :max="3600"
        style="width: 80px"
      />
      {{ $t("setting.saveUnit") }}
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive } from "vue";
import { useAppConfigStore } from "/@/store/modules/system/app-config";
import { socketClient } from "/@/utils/socket-client";

const appConfigStore = useAppConfigStore();

// 表单状态
let formValue = {
  jsonAutoSaveInterval: appConfigStore.jsonAutoSaveInterval,
  codeAutoSaveInterval: appConfigStore.codeAutoSaveInterval,
  textAutoSaveInterval: appConfigStore.textAutoSaveInterval,
};

let formState = reactive({ ...formValue });

// 配置变更函数
async function changeJsonAutoSaveInterval(value) {
  appConfigStore.updateConfig({
    jsonAutoSaveInterval: value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    jsonAutoSaveInterval: value,
  });
}

async function changeCodeAutoSaveInterval(value) {
  appConfigStore.updateConfig({
    codeAutoSaveInterval: value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    codeAutoSaveInterval: value,
  });
}

async function changeTextAutoSaveInterval(value) {
  appConfigStore.updateConfig({
    textAutoSaveInterval: value,
  });
  const updResult = await socketClient.invoke("controller/system/updateConf", {
    textAutoSaveInterval: value,
  });
}
</script>
