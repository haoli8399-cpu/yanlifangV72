<template>
  <view class="settlement-page">
    <CfNavBar title="结算记录" :showBack="false" />

    <!-- Monthly Summary -->
    <view class="settlement-page__summary card">
      <text class="settlement-page__summary-title">2024年12月</text>
      <view class="settlement-page__summary-row">
        <view class="settlement-page__summary-item">
          <text class="settlement-page__summary-label">总收入</text>
          <text class="settlement-page__summary-num settlement-page__summary-num--total">¥18,500</text>
        </view>
        <view class="settlement-page__summary-item">
          <text class="settlement-page__summary-label">已结算</text>
          <text class="settlement-page__summary-num settlement-page__summary-num--settled">¥12,000</text>
        </view>
        <view class="settlement-page__summary-item">
          <text class="settlement-page__summary-label">待结算</text>
          <text class="settlement-page__summary-num settlement-page__summary-num--pending">¥6,500</text>
        </view>
      </view>
    </view>

    <!-- Month Selector -->
    <view class="settlement-page__month-selector">
      <text class="settlement-page__month-arrow" @tap="prevMonth">&#x2039;</text>
      <text class="settlement-page__month-text">2024年12月</text>
      <text class="settlement-page__month-arrow" @tap="nextMonth">&#x203a;</text>
    </view>

    <!-- Settlement List -->
    <view class="settlement-page__list" style="padding-bottom: calc(120rpx + env(safe-area-inset-bottom));">
      <view v-for="item in settlements" :key="item.id" class="settlement-page__card card">
        <view class="settlement-page__card-header">
          <text class="settlement-page__card-title">{{ item.title }}</text>
          <view class="settlement-page__card-right">
            <text class="settlement-page__card-amount">¥{{ item.amount.toLocaleString() }}</text>
            <CfStatusTag :type="item.status" />
          </view>
        </view>
        <text class="settlement-page__card-info">演出日期：{{ item.showDate }}</text>
        <text class="settlement-page__card-info">结算方式：{{ item.method }}</text>
        <view style="height: 1rpx; background: $color-divider; margin: $space-md 0;" />
        <text class="settlement-page__card-date">到账日期：{{ item.transferDate || '待确认' }}</text>
      </view>
    </view>

    <CfTabBar currentTab="settlement" />
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'
import CfTabBar from '@/components/CfTabBar.vue'

const settlements = [
  { id: '1', title: '星辰文化年会', showDate: '2024-12-20', amount: 3500, status: 'transferred' as const, method: '银行转账', transferDate: '2024-12-25' },
  { id: '2', title: '脱口秀之夜第88期', showDate: '2024-12-18', amount: 5000, status: 'settled' as const, method: '银行转账', transferDate: '2024-12-23' },
  { id: '3', title: '欢乐剧场专场演出', showDate: '2024-12-15', amount: 4200, status: 'pending' as const, method: '银行转账', transferDate: '' },
  { id: '4', title: '企业年终晚会', showDate: '2024-12-10', amount: 5800, status: 'transferred' as const, method: '银行转账', transferDate: '2024-12-15' },
]

function prevMonth() { uni.showToast({ title: '上一月', icon: 'none' }) }
function nextMonth() { uni.showToast({ title: '下一月', icon: 'none' }) }
</script>

<style lang="scss" scoped>
.settlement-page { background-color: $color-bg-page; min-height: 100vh; }

.settlement-page__summary { margin-top: 0; }
.settlement-page__summary-title { font-size: $text-md; font-weight: 600; color: $color-text-primary; margin-bottom: $space-lg; display: block; }
.settlement-page__summary-row { display: flex; justify-content: space-between; }
.settlement-page__summary-item { flex: 1; text-align: center; }
.settlement-page__summary-label { font-size: $text-sm; color: $color-text-tertiary; display: block; margin-bottom: 8rpx; }
.settlement-page__summary-num { font-size: $text-2xl; font-weight: 700; display: block; }
.settlement-page__summary-num--total { color: $color-primary; }
.settlement-page__summary-num--settled { color: $state-confirmed; }
.settlement-page__summary-num--pending { color: $state-pending; }

.settlement-page__month-selector { display: flex; align-items: center; justify-content: center; padding: $space-md $space-base; gap: $space-2xl; }
.settlement-page__month-text { font-size: $text-md; font-weight: 600; color: $color-text-primary; }
.settlement-page__month-arrow { font-size: $text-2xl; color: $color-text-secondary; padding: $space-xs; }

.settlement-page__list { padding: 0 $space-base; display: flex; flex-direction: column; gap: $space-md; }

.settlement-page__card { padding: $space-lg !important; }
.settlement-page__card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: $space-sm; }
.settlement-page__card-title { font-size: $text-md; font-weight: 500; color: $color-text-primary; }
.settlement-page__card-right { display: flex; align-items: center; gap: $space-sm; }
.settlement-page__card-amount { font-size: $text-xl; font-weight: 600; color: $color-primary; }
.settlement-page__card-info { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 4rpx; }
.settlement-page__card-date { font-size: $text-sm; color: $color-text-tertiary; text-align: right; display: block; }
</style>
