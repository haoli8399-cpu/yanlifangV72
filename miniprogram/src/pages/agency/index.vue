<template>
  <view class="agency-page">
    <!-- 公司信息头 -->
    <view class="agency-page__header">
      <view class="agency-page__company">
        <text class="agency-page__name">{{ company.name }}</text>
        <view class="agency-page__verified">
          <text class="agency-page__verified-dot">✓</text>
          <text class="agency-page__verified-text">已认证</text>
        </view>
      </view>
      <view class="agency-page__month">
        <text class="agency-page__month-label">本月概览</text>
        <view class="agency-page__month-row">
          <text>接单 {{ company.monthOrder }} 单</text>
          <text class="agency-page__month-divider">·</text>
          <text>收入 ¥{{ company.monthIncome }}</text>
          <text class="agency-page__month-divider">·</text>
          <text>艺人 {{ company.artistCount }} 人</text>
        </view>
      </view>
    </view>

    <!-- 数据概览 KPI -->
    <view class="agency-page__kpi">
      <view
        v-for="kpi in kpis"
        :key="kpi.label"
        class="agency-page__kpi-card"
      >
        <text class="agency-page__kpi-label">{{ kpi.label }}</text>
        <text class="agency-page__kpi-num">{{ kpi.value }}</text>
        <view class="agency-page__kpi-trend">
          <text class="agency-page__kpi-arrow">↑</text>
          <text class="agency-page__kpi-trend-text">{{ kpi.trend }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 2x2 -->
    <view class="agency-page__section card">
      <text class="agency-page__section-title">快捷入口</text>
      <view class="agency-page__grid">
        <view
          v-for="entry in quickEntries"
          :key="entry.label"
          class="agency-page__grid-item"
          @tap="onQuickTap(entry)"
        >
          <view class="agency-page__grid-icon" :style="{ backgroundColor: entry.iconBg }">
            <text>{{ entry.icon }}</text>
          </view>
          <text class="agency-page__grid-label">{{ entry.label }}</text>
        </view>
      </view>
    </view>

    <!-- 最近订单 -->
    <view class="agency-page__section card">
      <view class="agency-page__section-head">
        <text class="agency-page__section-title">最近订单</text>
        <text class="agency-page__section-more" @tap="goOrders">全部 ›</text>
      </view>
      <view
        v-for="order in recentOrders"
        :key="order.id"
        class="agency-page__order"
        @tap="goOrders"
      >
        <view class="agency-page__order-main">
          <text class="agency-page__order-name">{{ order.name }}</text>
          <text class="agency-page__order-artist">艺人：{{ order.artist }}</text>
        </view>
        <view class="agency-page__order-side">
          <text class="agency-page__order-amount">¥{{ order.amount }}</text>
          <view class="agency-page__order-status" :class="statusClass(order.status)">
            <text>{{ order.statusText }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="agency-page__bottom-space" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ===== Mock 数据 =====
const company = ref({
  name: 'XX文化传媒',
  monthOrder: 6,
  monthIncome: '45,000',
  artistCount: 8,
})

const kpis = ref([
  { label: '本月订单', value: '6 单', trend: '12%' },
  { label: '本月收入', value: '¥45,000', trend: '8%' },
  { label: '旗下艺人', value: '8 人', trend: '2 人' },
])

type QuickEntry = {
  label: string
  icon: string
  iconBg: string
  action: 'toast' | 'nav'
  toast?: string
  url?: string
}

const quickEntries = ref<QuickEntry[]>([
  { label: '艺人管理', icon: '👥', iconBg: '#f5f3ff', action: 'toast', toast: '请在PC端管理艺人' },
  { label: '公司排期', icon: '📅', iconBg: '#eff6ff', action: 'nav', url: '/pages/assignment/calendar/index' },
  { label: '公司结算', icon: '🏦', iconBg: '#fffbeb', action: 'toast', toast: '请在PC端查看结算' },
  { label: '公司信誉', icon: '⭐', iconBg: '#f0fdf4', action: 'toast', toast: '请在PC端查看信誉' },
])

type OrderStatus = 'pending' | 'confirmed' | 'signed' | 'cancelled'

const recentOrders = ref([
  { id: 1, name: '品牌发布会暖场', artist: '李脱口秀', amount: '8,000', status: 'confirmed' as OrderStatus, statusText: '已确认' },
  { id: 2, name: '商场周末专场', artist: '王即兴', amount: '12,000', status: 'signed' as OrderStatus, statusText: '已签约' },
  { id: 3, name: '企业年会表演', artist: '赵漫才', amount: '15,000', status: 'pending' as OrderStatus, statusText: '待确认' },
])

const statusClassMap: Record<OrderStatus, string> = {
  pending: 'agency-page__order-status--pending',
  confirmed: 'agency-page__order-status--confirmed',
  signed: 'agency-page__order-status--signed',
  cancelled: 'agency-page__order-status--cancelled',
}

function statusClass(status: OrderStatus): string {
  return statusClassMap[status]
}

function onQuickTap(entry: QuickEntry) {
  if (entry.action === 'toast') {
    uni.showToast({ title: entry.toast || '敬请期待', icon: 'none' })
    return
  }
  if (entry.url) uni.navigateTo({ url: entry.url })
}

function goOrders() {
  uni.navigateTo({ url: '/pages/user/orders/index' })
}
</script>

<style lang="scss" scoped>
.agency-page {
  background-color: $color-bg-page;
  min-height: 100vh;
}

// ===== 公司信息头 =====
.agency-page__header {
  background: linear-gradient(135deg, $color-primary, $color-primary-active);
  padding: $space-xl $space-lg 88rpx;
}
.agency-page__company {
  display: flex;
  align-items: center;
  gap: $space-sm;
}
.agency-page__name {
  font-size: $text-xl;
  font-weight: 700;
  color: #fff;
}
.agency-page__verified {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 14rpx;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.2);
}
.agency-page__verified-dot {
  font-size: 18rpx;
  color: #fff;
  line-height: 1;
}
.agency-page__verified-text {
  font-size: $text-xs;
  color: #fff;
}
.agency-page__month {
  margin-top: $space-lg;
}
.agency-page__month-label {
  font-size: $text-xs;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: $space-xs;
}
.agency-page__month-row {
  display: flex;
  align-items: center;
  gap: $space-sm;
  font-size: $text-base;
  color: #fff;
}
.agency-page__month-divider {
  color: rgba(255, 255, 255, 0.5);
}

// ===== KPI 概览 =====
.agency-page__kpi {
  display: flex;
  gap: $space-sm;
  margin: -56rpx $space-lg 0;
  position: relative;
  z-index: 1;
}
.agency-page__kpi-card {
  flex: 1;
  background: $color-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  padding: $space-md $space-sm;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.agency-page__kpi-label {
  font-size: $text-xs;
  color: $color-text-tertiary;
}
.agency-page__kpi-num {
  font-size: $text-lg;
  font-weight: 700;
  color: $color-text-primary;
  margin: $space-xs 0;
}
.agency-page__kpi-trend {
  display: flex;
  align-items: center;
  gap: 4rpx;
}
.agency-page__kpi-arrow {
  font-size: 18rpx;
  color: $color-success;
}
.agency-page__kpi-trend-text {
  font-size: 18rpx;
  color: $color-success;
}

// ===== 区块通用 =====
.agency-page__section {
  margin: $space-lg $space-lg 0;
}
.agency-page__section-title {
  display: block;
  font-size: $text-lg;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-md;
}
.agency-page__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.agency-page__section-more {
  font-size: $text-sm;
  color: $color-primary;
}

// ===== 快捷入口 2x2 =====
.agency-page__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-md;
}
.agency-page__grid-item {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-md;
  background: $color-gray-50;
  border-radius: $radius-md;
  &:active { opacity: 0.85; }
}
.agency-page__grid-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}
.agency-page__grid-label {
  font-size: $text-md;
  color: $color-text-primary;
}

// ===== 最近订单 =====
.agency-page__order {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-md 0;
  border-bottom: 1rpx solid $color-divider;
  &:last-child { border-bottom: none; padding-bottom: 0; }
  &:active { opacity: 0.85; }
}
.agency-page__order-main {
  flex: 1;
  min-width: 0;
}
.agency-page__order-name {
  font-size: $text-md;
  font-weight: 600;
  color: $color-text-primary;
  display: block;
}
.agency-page__order-artist {
  font-size: $text-xs;
  color: $color-text-tertiary;
  margin-top: 4rpx;
  display: block;
}
.agency-page__order-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: $space-xs;
  flex-shrink: 0;
  margin-left: $space-md;
}
.agency-page__order-amount {
  font-size: $text-md;
  font-weight: 700;
  color: $color-primary;
}
.agency-page__order-status {
  padding: 2rpx 14rpx;
  border-radius: $radius-full;
  font-size: 18rpx;
}
.agency-page__order-status--pending { background: $state-pending-bg; color: $state-pending; }
.agency-page__order-status--confirmed { background: $state-confirmed-bg; color: $state-confirmed; }
.agency-page__order-status--signed { background: $state-signed-bg; color: $state-signed; }
.agency-page__order-status--cancelled { background: $state-cancelled-bg; color: $state-cancelled; }

.agency-page__bottom-space { height: 160rpx; }
</style>
