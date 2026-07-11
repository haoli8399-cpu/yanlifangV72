<template>
  <view class="cf-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="cf-nav-bar__content">
      <view v-if="showBack" class="cf-nav-bar__left" @tap="handleBack">
        <text class="cf-nav-bar__back-icon">&#x2039;</text>
        <text class="cf-nav-bar__back-text" v-if="backText">{{ backText }}</text>
      </view>
      <view v-else class="cf-nav-bar__left" />
      <view class="cf-nav-bar__title">
        <text>{{ title }}</text>
      </view>
      <view class="cf-nav-bar__right">
        <slot name="right" />
      </view>
    </view>
  </view>
  <view :style="{ height: (statusBarHeight + 44) + 'px' }" class="cf-nav-bar__placeholder" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  showBack?: boolean
  backText?: string
}>()

const statusBarHeight = ref(0)

const info = uni.getSystemInfoSync()
statusBarHeight.value = info.statusBarHeight || 0

function handleBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.cf-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: $color-bg-card;
  z-index: $z-nav-bar;

  &__content {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 $space-base;
  }

  &__left {
    width: 160rpx;
    display: flex;
    align-items: center;
  }

  &__back-icon {
    font-size: 48rpx;
    color: $color-text-primary;
    line-height: 1;
    margin-left: -8rpx;
  }

  &__back-text {
    font-size: $text-md;
    color: $color-text-primary;
    margin-left: -4rpx;
  }

  &__title {
    flex: 1;
    text-align: center;
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__right {
    width: 160rpx;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__placeholder {
    background-color: $color-bg-card;
  }
}
</style>
