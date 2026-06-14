<!--
  * 首页 用户头部信息
  *
-->
<template>
  <div class="user-header">
    <a-page-header :title="welcomeSentence">
      <template #subTitle>
        <span style="color: #666; margin-left: 20px"> </span>
      </template>
      <template #extra>
        <p style="margin: 0">
          {{ dayInfo }}
        </p>
      </template>
    </a-page-header>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useUserStore } from "/@/store/modules/system/user";
import uaparser from "ua-parser-js";
import { Solar, Lunar } from "lunar-javascript";
import _ from "lodash";

const userStore = useUserStore();

const departmentName = computed(() => userStore.departmentName);

// 欢迎语
const welcomeSentence = computed(() => {
  let sentence = "";
  let now = new Date().getHours();
  if (now > 0 && now <= 6) {
    sentence = "午夜好";
  } else if (now > 6 && now <= 11) {
    sentence = "早上好";
  } else if (now > 11 && now <= 14) {
    sentence = "中午好，";
  } else if (now > 14 && now <= 18) {
    sentence = "下午好";
  } else {
    sentence = "晚上好";
  }
  return sentence;
});

//上次登录信息
const lastLoginInfo = computed(() => {
  let info = "";
  if (userStore.$state.lastLoginTime) {
    info = info + "上次登录:" + userStore.$state.lastLoginTime;
  }

  if (userStore.$state.lastLoginUserAgent) {
    let ua = uaparser(userStore.$state.lastLoginUserAgent);
    info = info + "; 设备:";
    if (ua.browser.name) {
      info = info + " " + ua.browser.name;
    }
    if (ua.os.name) {
      info = info + " " + ua.os.name;
    }
    let device = ua.device.vendor ? ua.device.vendor + ua.device.model : null;
    if (device) {
      info = info + " " + device + ";";
    }
  }

  if (userStore.$state.lastLoginIpRegion) {
    info = info + "; " + userStore.$state.lastLoginIpRegion;
  }
  if (userStore.$state.lastLoginIp) {
    info = info + "; " + userStore.$state.lastLoginIp;
  }
  return info;
});

//日期、节日、节气
const dayInfo = computed(() => {
  //阳历
  let solar = Solar.fromDate(new Date());
  let day = solar.toString();
  let week = solar.getWeekInChinese();
  //阴历
  let lunar = Lunar.fromDate(new Date());
  let lunarMonth = lunar.getMonthInChinese();
  let lunarDay = lunar.getDayInChinese();
  //节气
  let jieqi = lunar.getPrevJieQi().getName();
  let next = lunar.getNextJieQi();
  let nextJieqi = next.getName() + " " + next.getSolar().toYmd();

  return `${day} 星期${week}，农历${lunarMonth}${lunarDay}（当前${jieqi}，${nextJieqi} ）`;
});
</script>
<style scoped lang="less">
.user-header {
  width: 100%;
  background-color: var(--bg-color, #ffffff);
  margin-bottom: 10px;
  border-radius: 8px;
  height: calc(100vh - 110px);

  :deep(.ant-page-header-heading) {
    display: flex;
    align-items: center;
  }
}
</style>
