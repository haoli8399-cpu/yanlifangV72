<template>
  <view class="request-detail-page">
    <CfNavBar title="需求详情" :showBack="true" backText="返回">
      <template #right>
        <text class="nav-right-link" @tap="editRequest">编辑</text>
      </template>
    </CfNavBar>

    <!-- Status Header -->
    <view class="card" style="margin-top: 16rpx;">
      <view class="request-detail-page__header">
        <text class="request-detail-page__title">{{ request.title }}</text>
        <CfStatusTag :type="request.status" />
      </view>
      <view style="height: 1rpx; background: $color-divider; margin: $space-md 0;" />
      <text class="request-detail-page__info">演出类型：脱口秀</text>
      <text class="request-detail-page__info">期望时间：2024-12-20 19:00</text>
      <text class="request-detail-page__info">演出地点：北京朝阳区XX会议中心</text>
      <text class="request-detail-page__info">预算范围：¥5,000 - ¥10,000</text>
      <text class="request-detail-page__info">创建时间：2024-11-15 14:30</text>
    </view>

    <!-- Quotes -->
    <view class="section-title"><text class="title">报价方案 (3)</text></view>
    <view class="request-detail-page__quotes">
      <view v-for="(q, i) in quotes" :key="i" class="card request-detail-page__quote">
        <view class="request-detail-page__quote-header">
          <image src="/static/images/performer-avatar.jpg" mode="aspectFill" class="request-detail-page__quote-avatar" />
          <view>
            <view class="request-detail-page__quote-name-row">
              <text class="request-detail-page__quote-name">{{ q.name }}</text>
              <view class="status-tag status-tag--signed"><text>{{ q.tier }}</text></view>
            </view>
          </view>
        </view>
        <view style="height: 1rpx; background: $color-divider; margin: $space-md 0;" />
        <text class="request-detail-page__quote-price">报价金额：¥{{ q.price.toLocaleString() }}/场</text>
        <text class="request-detail-page__quote-desc">{{ q.description }}</text>
        <text class="request-detail-page__quote-time">响应时间：{{ q.respondedAt }}</text>
        <view class="request-detail-page__quote-actions">
          <button class="btn btn-ghost" size="mini" @tap="contactPerformer(q)">联系沟通</button>
          <button class="btn btn-primary" size="mini" @tap="acceptQuote(q)">接受报价</button>
        </view>
      </view>
    </view>

    <!-- Timeline -->
    <view class="card">
      <text class="card-title">需求动态</text>
      <view class="request-detail-page__timeline">
        <view v-for="(t, i) in timeline" :key="i" class="request-detail-page__timeline-item">
          <view class="request-detail-page__timeline-dot" :style="{ backgroundColor: t.color }" />
          <view class="request-detail-page__timeline-content">
            <text class="request-detail-page__timeline-text">{{ t.text }}</text>
            <text class="request-detail-page__timeline-date">{{ t.date }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'

const request = { id: '1', title: '2024年会脱口秀演出', status: 'quoted' as const }

const quotes = [
  { name: '张脱口秀', tier: 'T3', price: 8800, description: '脱口秀之夜（90分钟，含互动环节）', respondedAt: '2024-11-16 10:30' },
  { name: '王喜剧', tier: 'T2', price: 12000, description: '脱口秀定制专场（120分钟，含彩排）', respondedAt: '2024-11-16 14:20' },
  { name: '李表演', tier: 'T4', price: 6500, description: '脱口秀精选集（60分钟）', respondedAt: '2024-11-16 16:00' },
]

const timeline = [
  { text: '提交需求', date: '2024-11-15 14:30', color: '#22c55e' },
  { text: '收到3家报价', date: '2024-11-16 10:30', color: '#3b82f6' },
  { text: '查看报价详情', date: '2024-11-16 15:20', color: '#9ca3af' },
]

function editRequest() { uni.showToast({ title: '编辑功能开发中', icon: 'none' }) }
function contactPerformer(q: any) { uni.showToast({ title: `联系${q.name}`, icon: 'none' }) }
function acceptQuote(q: any) { uni.showToast({ title: '已接受报价', icon: 'success' }) }
</script>

<style lang="scss" scoped>
.request-detail-page {
  padding-bottom: $space-2xl;

  &__header { display: flex; align-items: center; justify-content: space-between; }
  &__title { font-size: $text-2xl; font-weight: 600; color: $color-text-primary; flex: 1; margin-right: $space-sm; }
  &__info { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 8rpx; }

  &__quotes { padding: 0 $space-base; display: flex; flex-direction: column; gap: $space-md; margin-bottom: $space-lg; }
  &__quote { padding: $space-lg !important; }

  &__quote-header { display: flex; align-items: center; }
  &__quote-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; margin-right: $space-md; }
  &__quote-name-row { display: flex; align-items: center; gap: $space-sm; }
  &__quote-name { font-size: $text-md; font-weight: 500; color: $color-text-primary; }
  &__quote-price { font-size: $text-xl; font-weight: 600; color: $color-primary; display: block; margin-bottom: 8rpx; }
  &__quote-desc { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 8rpx; }
  &__quote-time { font-size: $text-sm; color: $color-text-tertiary; display: block; margin-bottom: $space-md; }
  &__quote-actions { display: flex; gap: $space-md; }

  &__timeline { padding-left: $space-xl; border-left: 4rpx solid $color-primary-subtle; }
  &__timeline-item { position: relative; padding: 0 0 $space-lg $space-xl; }
  &__timeline-dot { position: absolute; left: -36rpx; top: 4rpx; width: 16rpx; height: 16rpx; border-radius: 50%; }
  &__timeline-text { font-size: $text-base; color: $color-text-primary; display: block; }
  &__timeline-date { font-size: $text-sm; color: $color-text-tertiary; display: block; margin-top: 4rpx; }
}

.nav-right-link { font-size: $text-md; color: $color-primary; }
</style>
