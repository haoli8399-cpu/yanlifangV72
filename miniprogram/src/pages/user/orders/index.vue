<template>
  <view class="order-page">
    <CfNavBar title="订单详情" :showBack="true" backText="返回" />

    <!-- 加载骨架屏 -->
    <template v-if="loading">
      <scroll-view scroll-y class="order-page__scroll" :show-scrollbar="false">
        <view class="skeleton-state-chain">
          <view v-for="i in 6" :key="i" class="skeleton-state-node" />
        </view>
        <view class="skeleton-card">
          <view class="skeleton-card-header">
            <view class="skeleton-line" style="width: 50%;" />
            <view class="skeleton-line" style="width: 80rpx; height: 36rpx; border-radius: $radius-full;" />
          </view>
          <view v-for="i in 3" :key="i" class="skeleton-card-row">
            <view class="skeleton-line skeleton-line--sm" style="width: 80rpx;" />
            <view class="skeleton-line skeleton-line--sm" style="width: 280rpx;" />
          </view>
        </view>
        <view class="skeleton-won-card">
          <view class="skeleton-won-circle" />
          <view class="skeleton-line" style="width: 120rpx; margin: 0 auto 24rpx;" />
          <view class="skeleton-won-grid">
            <view v-for="i in 4" :key="i" class="skeleton-won-stat">
              <view class="skeleton-line skeleton-line--sm" style="width: 60rpx; margin: 0 auto 8rpx;" />
              <view class="skeleton-line" style="width: 100rpx; margin: 0 auto;" />
            </view>
          </view>
        </view>
      </scroll-view>
    </template>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-state__icon">😵</text>
      <text class="error-state__title">加载失败</text>
      <text class="error-state__desc">网络不给力，请检查网络后重试</text>
      <view class="error-state__btn" @tap="loadOrderDetail">
        <text>重新加载</text>
      </view>
    </view>

    <!-- 正常内容 -->
    <scroll-view v-else scroll-y class="order-page__scroll" :show-scrollbar="false">
      <view class="state-card">
        <view class="state-chain">
          <block v-for="(node, index) in states" :key="node.key">
            <view class="state-node" :class="`state-node--${node.tone}`">
              <text>{{ node.key }}</text>
            </view>
            <text v-if="index < states.length - 1" class="state-arrow">→</text>
          </block>
        </view>
      </view>

      <view class="order-card">
        <view class="order-card__header">
          <text class="order-card__title">XX科技年会</text>
          <CfStatusTag type="confirmed" />
        </view>
        <view class="order-card__row">
          <text class="order-card__label">方案</text>
          <text class="order-card__value">脱口秀标准版 · T3 · 60min</text>
        </view>
        <view class="order-card__row">
          <text class="order-card__label">时间</text>
          <text class="order-card__value">10月20日 · 300人</text>
        </view>
        <view class="order-card__row">
          <text class="order-card__label">报价</text>
          <text class="order-card__price">¥6,000</text>
        </view>
      </view>

      <view class="won-card">
        <view class="won-card__glow" />
        <view class="won-card__check">
          <text>✓</text>
        </view>
        <text class="won-card__title">已成交</text>
        <view class="won-card__grid">
          <view v-for="item in wonStats" :key="item.label" class="won-card__stat">
            <text class="won-card__stat-label">{{ item.label }}</text>
            <text class="won-card__stat-value">{{ item.value }}</text>
          </view>
        </view>
        <view class="won-card__action" @tap="viewFullOrder">
          <text>查看完整订单</text>
        </view>
      </view>

      <view class="action-row">
        <view class="action-row__btn action-row__btn--ghost" @tap="inviteReview">
          <text>邀请评价</text>
        </view>
        <view class="action-row__btn action-row__btn--primary" @tap="contactAgent">
          <text>联系小演</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'

const loading = ref(true)
const error = ref(false)

const states = [
  { key: 'new', tone: 'new' },
  { key: 'qualified', tone: 'qualified' },
  { key: 'quoted', tone: 'quoted' },
  { key: 'negotiating', tone: 'negotiating' },
  { key: 'pending', tone: 'pending' },
  { key: 'won', tone: 'won' },
]

const wonStats = [
  { label: '收益', value: '¥3,500' },
  { label: '评价', value: '待评价' },
  { label: '转化', value: '3 天' },
  { label: '周期', value: '行业平均 5 天' },
]

async function loadOrderDetail() {
  loading.value = true
  error.value = false
  try {
    // 模拟数据加载（后续接入真实 API）
    await new Promise(resolve => setTimeout(resolve, 600))
    // TODO: 调用真实 API 获取订单详情
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function viewFullOrder() {
  uni.showToast({ title: '订单信息已展开', icon: 'none' })
}

function inviteReview() {
  uni.showToast({ title: '已生成评价邀请', icon: 'success' })
}

function contactAgent() {
  uni.showToast({ title: '小演已接入', icon: 'success' })
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__scroll {
    height: 100vh;
  }
}

.state-card,
.order-card,
.won-card {
  margin: $space-md $space-base 0;
  border-radius: $radius-md;
}

.state-card {
  padding: $space-sm;
  background: $color-bg-card;
  border: 1rpx solid $color-border;
}

.state-chain {
  display: flex;
  align-items: center;
  gap: 8rpx;
  overflow-x: auto;
}

.state-node {
  flex-shrink: 0;
  height: 44rpx;
  padding: 0 12rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  color: $color-text-inverse;
  font-size: $text-xs;
  font-weight: 800;

  &--new { background: $color-text-tertiary; }
  &--qualified { background: $color-info; }
  &--quoted { background: $color-primary; }
  &--negotiating { background: $color-warning; }
  &--pending { background: $state-pending; }
  &--won { background: $color-success; }
}

.state-arrow {
  color: $color-text-tertiary;
  font-size: $text-xs;
}

.order-card {
  padding: $space-md;
  border: 1rpx solid $color-border;
  background: $color-bg-card;
  box-shadow: $shadow-sm;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-sm;
    margin-bottom: $space-sm;
  }

  &__title {
    color: $color-text-primary;
    font-size: $text-lg;
    font-weight: 800;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: $space-md;
    padding: $space-xs 0;
  }

  &__label {
    color: $color-text-secondary;
    font-size: $text-sm;
  }

  &__value {
    color: $color-text-primary;
    font-size: $text-sm;
    text-align: right;
  }

  &__price {
    color: $color-primary;
    font-family: 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: $text-md;
    font-weight: 800;
  }
}

.won-card {
  position: relative;
  overflow: hidden;
  padding: $space-xl $space-md $space-md;
  background: $color-stage-dark;
  color: $color-text-inverse;
  text-align: center;

  &__glow {
    position: absolute;
    top: -80rpx;
    left: 50%;
    width: 300rpx;
    height: 180rpx;
    border-radius: 50%;
    transform: translateX(-50%);
    background: rgba($color-primary, 0.45);
    filter: blur(36rpx);
  }

  &__check {
    position: relative;
    z-index: 1;
    width: 80rpx;
    height: 80rpx;
    margin: 0 auto $space-sm;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-success;
    font-size: $text-2xl;
    font-weight: 800;
  }

  &__title {
    position: relative;
    z-index: 1;
    display: block;
    font-size: $text-xl;
    font-weight: 800;
  }

  &__grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-sm;
    margin-top: $space-md;
  }

  &__stat {
    padding: $space-sm;
    border: 1rpx solid rgba($color-text-inverse, 0.16);
    border-radius: $radius-sm;
    background: rgba($color-text-inverse, 0.08);
  }

  &__stat-label,
  &__stat-value {
    display: block;
  }

  &__stat-label {
    color: rgba($color-text-inverse, 0.64);
    font-size: $text-xs;
  }

  &__stat-value { font-family: 'JetBrains Mono', monospace;
    margin-top: 4rpx;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 800;
  }

  &__action {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 56rpx;
    margin-top: $space-md;
    padding: 0 $space-lg;
    border-radius: $radius-full;
    background: $color-primary;
    font-size: $text-xs;
    font-weight: 800;
  }
}

.action-row {
  display: flex;
  gap: $space-sm;
  padding: $space-md $space-base $space-xl;

  &__btn {
    flex: 1;
    height: 72rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-base;
    font-weight: 800;
  }

  &__btn--ghost {
    border: 2rpx solid $color-primary;
    color: $color-primary;
    background: $color-bg-card;
  }

  &__btn--primary {
    background: $color-primary;
    color: $color-text-inverse;
  }
}

// ===== 加载骨架屏 =====
.skeleton-state-chain {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: $space-sm $space-base;
  margin: $space-md $space-base 0;
  background: $color-bg-card;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  overflow-x: auto;
}

.skeleton-state-node {
  flex-shrink: 0;
  width: 80rpx;
  height: 44rpx;
  border-radius: $radius-full;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-card {
  margin: $space-md $space-base 0;
  padding: $space-md;
  border: 1rpx solid $color-border;
  border-radius: $radius-md;
  background: $color-bg-card;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-sm;
  margin-bottom: $space-sm;
}

.skeleton-card-row {
  display: flex;
  justify-content: space-between;
  gap: $space-md;
  padding: $space-xs 0;
}

.skeleton-won-card {
  margin: $space-md $space-base 0;
  padding: $space-xl $space-md $space-md;
  background: $color-stage-dark;
  border-radius: $radius-md;
  text-align: center;
}

.skeleton-won-circle {
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto $space-sm;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  animation: shimmer-light 1.5s ease-in-out infinite;
}

.skeleton-won-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-sm;
}

.skeleton-won-stat {
  padding: $space-sm;
  border: 1rpx solid rgba(255,255,255,0.1);
  border-radius: $radius-sm;
}

.skeleton-line {
  height: 28rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &--sm {
    height: 22rpx;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes shimmer-light {
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
}

// ===== 错误状态 =====
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $space-base 120rpx;

  &__icon {
    font-size: 96rpx;
    margin-bottom: $space-lg;
  }

  &__title {
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: $space-sm;
  }

  &__desc {
    font-size: $text-sm;
    color: $color-text-secondary;
    margin-bottom: $space-xl;
  }

  &__btn {
    height: 80rpx;
    padding: 0 48rpx;
    border-radius: $radius-full;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
