<template>
  <view class="invoice-page">
    <CfNavBar title="发票管理" :showBack="true" backText="返回" />

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view v-for="i in 3" :key="i" class="card skeleton-card">
        <view class="skeleton-line" style="width: 50%; margin-bottom: 24rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 80%;" />
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="invoices.length === 0" class="empty-state">
      <text class="empty-state__icon">🧾</text>
      <text class="empty-state__title">暂无发票记录</text>
      <text class="empty-state__desc">结算完成后可在这里申请开具发票</text>
    </view>

    <!-- 列表 -->
    <view v-else class="invoice-list">
      <view v-for="item in invoices" :key="item.id" class="card invoice-card">
        <view class="invoice-card__top">
          <text class="invoice-card__title">{{ item.title }}</text>
          <view class="invoice-card__status" :class="`invoice-card__status--${item.statusType}`">
            <text>{{ item.status }}</text>
          </view>
        </view>
        <view class="invoice-card__row">
          <text class="invoice-card__label">开票金额</text>
          <text class="invoice-card__amount">¥{{ item.amount.toLocaleString() }}</text>
        </view>
        <view class="invoice-card__row">
          <text class="invoice-card__label">开票日期</text>
          <text class="invoice-card__value">{{ item.date }}</text>
        </view>
        <view class="invoice-card__row" v-if="item.invoiceNo">
          <text class="invoice-card__label">发票号码</text>
          <text class="invoice-card__value">{{ item.invoiceNo }}</text>
        </view>
      </view>
      <view class="bottom-space" />
    </view>

    <!-- 悬浮申请按钮 -->
    <view v-if="!loading" class="invoice-page__fab" @tap="apply">
      <text class="invoice-page__fab-text">+ 申请开票</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const loading = ref(true)
const invoices = ref([
  { id: 'i1', title: '2026年6月商演结算', amount: 36000, date: '2026-07-02', status: '已开具', statusType: 'done', invoiceNo: '2441200000012345' },
  { id: 'i2', title: 'XX地产开盘演出', amount: 12000, date: '2026-06-20', status: '开票中', statusType: 'pending', invoiceNo: '' },
])

function apply() {
  uni.showToast({ title: '申请开票功能开发中', icon: 'none' })
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 500)
})
</script>

<style lang="scss" scoped>
.invoice-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__fab {
    position: fixed;
    right: 32rpx;
    bottom: calc(40rpx + env(safe-area-inset-bottom));
    height: 88rpx;
    padding: 0 40rpx;
    border-radius: $radius-full;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-md;

    &:active { opacity: 0.85; }
  }
}

.invoice-list { padding: $space-base $space-base 0; }

.invoice-card {
  & + & { margin-top: $space-md; }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-sm;
  }

  &__title { font-size: $text-lg; font-weight: 700; color: $color-text-primary; flex: 1; }

  &__status {
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: 600;

    &--done { background: rgba($color-success, 0.1); color: $color-success; }
    &--pending { background: rgba($color-warning, 0.1); color: $color-warning; }
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 0;
  }

  &__label { font-size: $text-base; color: $color-text-secondary; }
  &__value { font-size: $text-base; color: $color-text-primary; }
  &__amount { font-family: 'JetBrains Mono', monospace; font-size: $text-lg; font-weight: 700; color: $color-primary; }
}

.bottom-space { height: 160rpx; }

// 骨架屏
.skeleton { padding: $space-base; }
.skeleton-card { height: 220rpx; margin-bottom: $space-md; }
.skeleton-line {
  height: 28rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &--sm { height: 22rpx; }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $space-base;

  &__icon { font-size: 80rpx; margin-bottom: $space-md; }
  &__title { font-size: $text-lg; font-weight: 600; color: $color-text-primary; margin-bottom: $space-xs; }
  &__desc { font-size: $text-sm; color: $color-text-tertiary; text-align: center; }
}
</style>
