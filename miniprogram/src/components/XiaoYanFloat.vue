<template>
  <view v-if="!open" class="xy-float" @tap="toggle">
    <text class="xy-float__badge" v-if="hasNew" />
    <text class="xy-float__text">小演</text>
  </view>
  <view v-else class="xy-panel">
    <view class="xy-panel__head">
      <view class="xy-panel__title">
        <text class="xy-panel__logo">小演</text>
        <text class="xy-panel__name">小演 AI</text>
      </view>
      <text class="xy-panel__close" @tap="toggle">✕</text>
    </view>
    <scroll-view scroll-y class="xy-panel__body">
      <view v-for="(item, i) in insights" :key="i" class="xy-panel__item">
        <text>{{ item }}</text>
      </view>
    </scroll-view>
    <view class="xy-panel__refresh" @tap="fetchInsights">
      <text>🔄 刷新洞察</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  contextType?: 'performer' | 'opportunity' | 'sku' | 'profit' | 'order'
}>()

const open = ref(false)
const insights = ref<string[]>([])
const loading = ref(false)
const hasNew = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

// 后端不可达/无登录态时的兜底洞察（基于艺人页现有 mock 数据：5 场排期 / ¥18,500 / 信誉 92）
const mockInsights = [
  '📅 近 7 天你有 2 场演出，总收入 ¥7,400',
  '🗓️ 下周 周五/周六 有演出',
  '⭐ 信誉分 92，较上周 +2',
  '💰 本月预计收入 ¥18,500，较上月 +12%',
]

function getBaseUrl(): string {
  return uni.getStorageSync('api_base_url') || 'http://127.0.0.1:3000'
}

async function fetchInsights() {
  loading.value = true
  try {
    const token = uni.getStorageSync('token')
    const res = (await uni.request({
      url: `${getBaseUrl()}/v1/ai/insight`,
      method: 'POST',
      data: { context_type: props.contextType || 'performer' },
      header: token ? { Authorization: `Bearer ${token}` } : {},
    })) as unknown as { data: { code: number; data?: { insights?: string[] } } }
    const body = res.data
    if (body?.code === 0 && Array.isArray(body.data?.insights) && body.data!.insights!.length) {
      insights.value = body.data!.insights!
    } else {
      insights.value = mockInsights
    }
  } catch {
    // 后端未接入或无登录态时，展示本地兜底洞察，保证悬浮助手可用
    insights.value = mockInsights
  } finally {
    loading.value = false
    hasNew.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) fetchInsights()
}

onMounted(() => {
  fetchInsights()
  timer = setInterval(fetchInsights, 60000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.xy-float {
  position: fixed;
  right: 32rpx;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(124, 58, 237, 0.35);
  z-index: 1000;

  &:active { opacity: 0.85; }

  &__badge {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: #ef4444;
    border: 4rpx solid #fff;
  }

  &__text {
    color: #fff;
    font-size: 28rpx;
    font-weight: 700;
  }
}

.xy-panel {
  position: fixed;
  right: 32rpx;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  width: 600rpx;
  max-height: 760rpx;
  background: $color-bg-card;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 64rpx rgba(124, 58, 237, 0.2);
  border: 2rpx solid #ddd6fe;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 28rpx;
    border-bottom: 2rpx solid $color-divider;
  }

  &__title { display: flex; align-items: center; gap: 12rpx; }

  &__logo {
    width: 48rpx;
    height: 48rpx;
    border-radius: 12rpx;
    background: $color-primary;
    color: #fff;
    font-size: 22rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__name { color: $color-primary; font-size: 26rpx; font-weight: 700; }

  &__close { color: $color-text-placeholder; font-size: 28rpx; padding: 8rpx; }

  &__body {
    flex: 1;
    max-height: 560rpx;
    padding: 20rpx 28rpx;
  }

  &__item {
    background: #f5f3ff;
    border-radius: 16rpx;
    padding: 16rpx 20rpx;
    margin-bottom: 16rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: $color-text-primary;
  }

  &__refresh {
    padding: 16rpx 28rpx;
    text-align: center;
    color: $color-primary;
    font-size: 22rpx;
    border-top: 2rpx solid $color-divider;

    &:active { opacity: 0.7; }
  }
}
</style>
