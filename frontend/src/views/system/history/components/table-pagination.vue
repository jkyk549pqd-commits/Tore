<!--
  * 分页组件
  *
-->
<template>
  <el-pagination
    :current-page="current"
    :page-size="pageSize"
    :page-sizes="[10, 20, 50, 100]"
    :total="total"
    :prev-text="prevText"
    :next-text="nextText"
    :page-sizes-text="pageSizesText"
    :jumper-text="jumperText"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    @update:current-page="handleCurrentUpdate"
    @update:page-size="handlePageSizeUpdate"
    style="margin-top: 16px; justify-content: flex-end"
  />
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  current: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:current", "update:pageSize", "change"]);

// 获取 i18n 实例
const { locale } = useI18n();

// 分页组件国际化文本
const prevText = computed(() => {
  return locale.value === "zh_CN" ? "上一页" : "Previous";
});

const nextText = computed(() => {
  return locale.value === "zh_CN" ? "下一页" : "Next";
});

const pageSizesText = computed(() => {
  return locale.value === "zh_CN" ? "条/页" : "items/page";
});

const jumperText = computed(() => {
  return locale.value === "zh_CN" ? "前往" : "Go to";
});

// 处理分页大小变化
const handleSizeChange = (size) => {
  emit("change", { current: props.current, pageSize: size });
};

// 处理当前页变化
const handleCurrentChange = (page) => {
  emit("change", { current: page, pageSize: props.pageSize });
};

// 处理 current-page 的更新
const handleCurrentUpdate = (page) => {
  emit("update:current", page);
};

// 处理 page-size 的更新
const handlePageSizeUpdate = (size) => {
  emit("update:pageSize", size);
};
</script>

<style lang="less" scoped></style>
