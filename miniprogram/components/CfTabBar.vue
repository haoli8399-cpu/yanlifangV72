<template>
  <view class="cf-tab-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="cf-tab-bar__item"
      :class="{ 'cf-tab-bar__item--active': currentTab === tab.key }"
      @tap="switchTab(tab.key)"
    >
      <view class="cf-tab-bar__icon-wrap">
        <!-- Simple text icons as placeholders -->
        <text class="cf-tab-bar__icon">{{ tab.icon }}</text>
      </view>
      <text class="cf-tab-bar__label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  currentTab: string
}>()

const safeAreaBottom = ref(0)
const info = uni.getSystemInfoSync()
safeAreaBottom.value = info.safeAreaInsets?.bottom || 0

const tabs = [
  { key: 'assignment', label: '排期', icon: '☰', path: '/pages/assignment/list/index' },
  { key: 'settlement', label: '结算', icon: '¥', path: '/pages/settlement/index' },
  { key: 'performer', label: '我的', icon: '👤', path: '/pages/user/performer/index' },
]

function switchTab(key: string) {
  const tab = tabs.find(t => t.key === key)
  if (tab) {
    uni.redirectTo({ url: tab.path })
  }
}
</script>

<style lang="scss" scoped>
.cf-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: $color-bg-card;
  border-top: 1rpx solid $color-border;
  height: $tab-bar-height;
  z-index: $z-tab-bar;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    transition: color $transition-fast;

    &--active {
      .cf-tab-bar__icon,
      .cf-tab-bar__label {
        color: $color-primary;
      }
    }
  }

  &__icon-wrap {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4rpx;
  }

  &__icon {
    font-size: 36rpx;
    color: $color-text-tertiary;
  }

  &__label {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }
}
</style>
