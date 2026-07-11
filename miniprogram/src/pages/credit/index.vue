<template>
  <view class="credit-page">
    <CfNavBar title="我的信誉分" :showBack="true" backText="返回" />

    <!-- Score Hero -->
    <view class="credit-page__hero card">
      <view class="credit-page__circle">
        <text class="credit-page__score">92</text>
        <text class="credit-page__level">优秀</text>
      </view>
      <view class="credit-page__progress">
        <view class="credit-page__progress-bar" style="width: 92%;" />
      </view>
      <view class="credit-page__badges">
        <text class="credit-page__badge credit-page__badge--green">准时率 98%</text>
        <text class="credit-page__badge credit-page__badge--green">履约率 100%</text>
        <text class="credit-page__badge credit-page__badge--green">好评率 95%</text>
      </view>
    </view>

    <!-- Score Breakdown -->
    <view class="card">
      <text class="card-title">评分明细</text>
      <view v-for="item in breakdown" :key="item.label" class="credit-page__score-row">
        <text class="credit-page__score-label">{{ item.label }}</text>
        <view class="credit-page__score-bar-wrap">
          <view class="credit-page__score-bar" :style="{ width: item.score + '%', backgroundColor: item.color }" />
        </view>
        <text class="credit-page__score-value">{{ item.score }}分</text>
      </view>
    </view>

    <!-- Credit History -->
    <view class="card">
      <text class="card-title">信誉变动记录</text>
      <view class="credit-page__timeline">
        <view v-for="(r, i) in records" :key="i" class="credit-page__timeline-item">
          <view class="credit-page__timeline-dot" :style="{ backgroundColor: r.change > 0 ? '#16a34a' : '#ef4444' }" />
          <view class="credit-page__timeline-content">
            <text class="credit-page__timeline-text" :style="{ color: r.change > 0 ? '#16a34a' : '#ef4444' }">{{ r.change > 0 ? '+' : '' }}{{ r.change }}分 {{ r.reason }}</text>
            <text class="credit-page__timeline-date">{{ r.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Info -->
    <view class="credit-page__info">
      <text>信誉分影响接单优先级和咖位晋升，请保持良好的演出记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'

const breakdown = [
  { label: '准时签到', score: 95, color: '#16a34a' },
  { label: '演出质量', score: 90, color: '#16a34a' },
  { label: '沟通配合', score: 92, color: '#16a34a' },
  { label: '客户评价', score: 88, color: '#f59e0b' },
]

const records = [
  { change: 2, reason: '准时签到', date: '2024-12-20' },
  { change: 3, reason: '获得好评', date: '2024-12-18' },
  { change: -1, reason: '迟到15分钟', date: '2024-12-10' },
  { change: 2, reason: '顺利完成演出', date: '2024-12-05' },
]
</script>

<style lang="scss" scoped>
.credit-page { background-color: $color-bg-page; padding-bottom: $space-2xl; }

.credit-page__hero { text-align: center; padding: $space-2xl $space-xl !important; }
.credit-page__circle {
  width: 240rpx; height: 240rpx; border-radius: 50%;
  border: 8rpx solid $color-primary;
  background: conic-gradient($color-primary 92%, $color-primary-subtle 92%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  margin: 0 auto $space-xl;
}
.credit-page__score { font-size: 72rpx; font-weight: 700; color: $color-primary; line-height: 1; }
.credit-page__level { font-size: $text-md; color: $color-primary; margin-top: 8rpx; }

.credit-page__progress { height: 12rpx; background-color: $color-primary-subtle; border-radius: $radius-full; overflow: hidden; margin-bottom: $space-lg; }
.credit-page__progress-bar { height: 100%; border-radius: $radius-full; background: linear-gradient(90deg, $color-primary, $color-primary-light); }

.credit-page__badges { display: flex; justify-content: center; gap: $space-md; flex-wrap: wrap; }
.credit-page__badge { font-size: $text-sm; padding: 4rpx 16rpx; border-radius: $radius-full; }
.credit-page__badge--green { color: $state-confirmed; background-color: $state-confirmed-bg; }

.credit-page__score-row { display: flex; align-items: center; margin-bottom: $space-md; }
.credit-page__score-label { font-size: $text-base; color: $color-text-primary; width: 140rpx; flex-shrink: 0; }
.credit-page__score-bar-wrap { flex: 1; height: 12rpx; background-color: $color-primary-subtle; border-radius: $radius-full; overflow: hidden; margin: 0 $space-md; }
.credit-page__score-bar { height: 100%; border-radius: $radius-full; }
.credit-page__score-value { font-size: $text-base; font-weight: 600; color: $color-text-primary; width: 80rpx; text-align: right; }

.credit-page__timeline { padding-left: $space-xl; border-left: 4rpx solid $color-primary-subtle; }
.credit-page__timeline-item { position: relative; padding: 0 0 $space-lg $space-xl; }
.credit-page__timeline-dot { position: absolute; left: -36rpx; top: 4rpx; width: 16rpx; height: 16rpx; border-radius: 50%; }
.credit-page__timeline-text { font-size: $text-base; font-weight: 500; display: block; }
.credit-page__timeline-date { font-size: $text-sm; color: $color-text-tertiary; display: block; margin-top: 4rpx; }

.credit-page__info { margin: $space-md $space-base; padding: $space-md $space-lg; background-color: $color-bg-input; border-radius: $radius-md; font-size: $text-base; color: $color-text-secondary; }
</style>
