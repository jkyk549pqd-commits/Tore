<!--
  * 系统日志操作模态框
  *
-->
<template>
  <el-drawer
    id="logOperateDrawer"
    :title="
      isUpdate ? $t('history.modal.viewTitle') : $t('history.modal.addTitle')
    "
    :size="800"
    v-model="visible"
    :close-on-click-modal="true"
    :destroy-on-close="true"
    @close="onClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item :label="$t('history.table.id')" prop="id">
        <el-input
          v-model="form.id"
          :placeholder="$t('history.table.id')"
          disabled
        />
      </el-form-item>
      <el-form-item :label="$t('history.form.type')" prop="type">
        <el-input
          v-model="form.type"
          :placeholder="$t('history.form.typePlaceholder')"
          readonly
          spellcheck="false"
        />
      </el-form-item>

      <el-form-item :label="$t('history.form.optType')" prop="optType">
        <el-input
          :model-value="getOptTypeText(form.optType)"
          readonly
          spellcheck="false"
        >
        </el-input>
      </el-form-item>

      <el-form-item :label="$t('history.form.parent')" prop="parentPage">
        <el-input
          v-model="form.parentPage"
          :placeholder="$t('history.form.parentPlaceholder')"
          readonly
          spellcheck="false"
        />
      </el-form-item>

      <el-form-item :label="$t('history.form.tag')" prop="tag">
        <el-input
          v-model="form.tag"
          :placeholder="$t('history.form.tagPlaceholder')"
          readonly
          spellcheck="false"
        />
      </el-form-item>

      <el-form-item :label="$t('history.form.content')" prop="content">
        <JsonEditorLite
          v-model="form.content"
          :model-type="form.type"
          :auto-format="true"
          :read-only="false"
        />
      </el-form-item>

      <el-form-item :label="$t('history.table.updTime')" prop="updTime">
        <el-input
          v-model="form.updTime"
          :placeholder="$t('history.table.updTime')"
          disabled
        />
      </el-form-item>

      <el-form-item :label="$t('history.table.crtTime')" prop="crtTime">
        <el-input
          v-model="form.crtTime"
          :placeholder="$t('history.table.crtTime')"
          disabled
        />
      </el-form-item>
    </el-form>
    <el-backtop
      target=".el-drawer__body"
      :visibility-height="150"
      :right="42"
      :bottom="70"
    />

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="onClose">{{ $t("history.btn.cancel") }}</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
          >{{ $t("history.btn.confirm") }}</el-button
        >
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { socketClient } from "/@/utils/socket-client";
import JsonEditorLite from "./json-editor-lite.vue";
import { AutoSaveManager } from "../../json/json-operations";

const { t } = useI18n();

// ------------------------ 表单相关 ------------------------
const formRef = ref();
const form = reactive({
  id: undefined,
  type: "",
  optType: "",
  parentPage: "",
  tag: "",
  content: "",
  updTime: "",
  crtTime: "",
});

const rules = {
  type: [
    {
      required: true,
      message: t("history.form.typeRequired"),
      trigger: "blur",
    },
  ],
  content: [
    {
      required: true,
      message: t("history.form.contentRequired"),
      trigger: "blur",
    },
  ],
};

// ------------------------ 弹窗相关 ------------------------
const visible = ref(false);
const isUpdate = ref(false);
const submitLoading = ref(false);

const emit = defineEmits(["reloadList"]);

// 获取操作类型的国际化文本
const getOptTypeText = (optType) => {
  switch (optType) {
    case "1":
      return t("history.optType.autoAdd");
    case "2":
      return t("history.optType.manualAdd");
    case "3":
      return t("history.optType.update");
    default:
      return optType;
  }
};

function showDrawer(rowData) {
  visible.value = true;
  // console.log("rowData.parentPage:", rowData.parentPage);
  if (rowData && rowData.id) {
    isUpdate.value = true;
    Object.assign(form, {
      id: rowData.id,
      type: rowData.type || "",
      optType: rowData.opt_type || "",
      parentPage: String(rowData.parentPage) || "",
      tag: rowData.tag || "",
      content: rowData.content || "",
      updTime: rowData.upd_time,
      crtTime: rowData.crt_time,
    });
  } else {
    isUpdate.value = false;
    resetForm();
  }
}

function onClose() {
  visible.value = false;
  resetForm();
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(form, {
    id: undefined,
    type: "",
    optType: "",
    parentPage: "",
    tag: "",
    content: "",
    updTime: undefined,
    crtTime: undefined,
  });
}

async function handleSubmit() {
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    let contentValue;
    try {
      if (form.type && form.type === "JSON") {
        contentValue = JSON.stringify(JSON.parse(form.content));
      } else {
        //
        contentValue = form.content;
      }
      // 验证JSON格式是否正确
    } catch (error) {
      ElMessage.error(t("json.editor.invalidJsonFormat"));
      return;
    }

    if (isUpdate.value) {
      // 更新 - 调用 electron 的 updateLog 方法
      const updateData = {
        id: form.id,
        type: form.type,
        opt_type: form.optType,
        parentPage: form.parentPage,
        tag: form.tag,
        content: contentValue,
      };
      console.log("updateData:", updateData);
      await socketClient.invoke("controller/system/updateLog", updateData);

      if (form.type && form.type === "JSON") {
        const result = await AutoSaveManager.manualSaveJsonData({
          fromPage: 2, // 表示来自详情编辑页面
          jsonStr: contentValue,
          routeName: "",
          customName: form.parentPage,
          instanceId: "",
          currentLogId: form.id,
          socketClient,
          message: ElMessage,
          onSuccess: (time) => {
            console.log("JSON数据手动保存成功", time);
          },
          onError: (error) => {
            console.error("JSON数据手动保存失败:", error);
          },
        });
      } else {
        // 其他类型数据的保存逻辑（如果有）
        const result = await AutoSaveManager.manualSaveTextData({
          fromPage: 2, // 表示来自日志编辑页面
          textType: form.type,
          textStr: contentValue,
          routeName: "",
          customName: form.parentPage,
          instanceId: "",
          currentLogId: form.id,
          socketClient,
          message: ElMessage,
          onSuccess: (time) => {
            console.log("Text数据手动保存成功", time);
          },
          onError: (error) => {
            console.error("Text数据手动保存失败:", error);
          },
        });
      }
      ElMessage.success(t("history.msg.updateSuccess"));
    }
    emit("reloadList");
    onClose();
  } catch (error) {
    console.error("提交失败:", error);
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    ElMessage.error(
      isUpdate.value
        ? t("history.msg.updateFailed")
        : t("history.msg.addFailed")
    );
  } finally {
    submitLoading.value = false;
  }
}

// 暴露方法给父组件
defineExpose({
  showDrawer,
});
</script>

<style lang="less" scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  .el-button {
    border-radius: 16px;
    transition: all 0.3s ease;

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
