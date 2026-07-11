<template>
  <view class="cf-empty-state">
    <view class="cf-empty-state__icon">
      <text class="iconfont" v-if="icon">{{ icon }}</text>
      <text v-else class="cf-empty-state__placeholder">!</text>
    </view>
    <text class="cf-empty-state__text">{{ text || '暂无数据' }}</text>
    <view v-if="actionText" class="cf-empty-state__action" @tap="$emit('action')">
      <text>{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  text?: string
  actionText?: string
}>()

defineEmits<{
  (e: 'action'): void
}>()
</script>

<style lang="scss" scoped>
.cf-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $space-base;

  &__icon {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: $color-bg-input;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $space-xl;

    .iconfont { font-size: 64rpx; color: $color-text-tertiary; }
    .cf-empty-state__placeholder { font-size: 64rpx; color: $color-text-tertiary; }
  }

  &__text {
    font-size: $text-md;
    color: $color-text-tertiary;
    margin-bottom: $space-md;
  }

  &__action {
    padding: $space-sm $space-xl;
    background-color: $color-primary-bg;
    border-radius: $radius-full;
    font-size: $text-md;
    color: $color-primary;
  }
}
</style>
