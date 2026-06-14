<template>
  <div class="qrcode-container">
    <div class="qrcode-label">{{ $t("setting.qrcode") }}</div>

    <div class="qrcode-row">
      <img
        src="/@/assets/images/qrcode/kofi.png"
        :alt="$t('setting.qrcode.kofi')"
        class="qrcode-image"
      />
      <div class="qrcode-item-label">{{ $t("setting.qrcode.kofi") }}</div>
    </div>

    <div class="qrcode-row">
      <img
        src="/@/assets/images/qrcode/lusion.jpg"
        :alt="$t('setting.qrcode.lusion')"
        class="qrcode-image"
      />
      <div class="qrcode-item-label">{{ $t("setting.qrcode.lusion") }}</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.qrcode-container {
  text-align: center;
  padding: 30px 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.qrcode-label {
  margin-bottom: 24px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.qrcode-row {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.qrcode-image {
  display: block;
  width: 220px;
  height: auto;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.qrcode-item-label {
  margin-top: 10px;
  font-size: 13px;
  color: #999;
}
</style>
