<template>
  <view class="request-list-page page-with-tabbar">
    <!-- Stats Summary -->
    <view class="request-list-page__stats">
      <view class="request-list-page__stat">
        <text class="request-list-page__stat-num request-list-page__stat-num--primary">12</text>
        <text class="request-list-page__stat-label">全部</text>
      </view>
      <view class="request-list-page__stat">
        <text class="request-list-page__stat-num request-list-page__stat-num--pending">5</text>
        <text class="request-list-page__stat-label">进行中</text>
      </view>
      <view class="request-list-page__stat">
        <text class="request-list-page__stat-num request-list-page__stat-num--confirmed">7</text>
        <text class="request-list-page__stat-label">已签约</text>
      </view>
    </view>

    <!-- Status Filter Tabs -->
    <scroll-view scroll-x class="request-list-page__tabs">
      <view v-for="tab in statusTabs" :key="tab.value" class="request-list-page__tab" :class="{ 'request-list-page__tab--active': activeStatus === tab.value }" @tap="activeStatus = tab.value">
        <text>{{ tab.label }}</text>
      </view>
    </scroll-view>

    <!-- Request Cards -->
    <view class="request-list-page__list">
      <view v-for="item in requestList" :key="item.id" class="request-list-page__card" :class="{ 'request-list-page__card--cancelled': item.status === 'cancelled' }" @tap="goDetail(item.id)">
        <view class="request-list-page__card-header">
          <text class="request-list-page__card-title">{{ item.title }}</text>
          <CfStatusTag :type="item.status" />
        </view>
        <text class="request-list-page__card-info">演出类型：{{ item.showTypeLabel }}</text>
        <text class="request-list-page__card-info">期望时间：{{ item.expectedDate }}</text>
        <text class="request-list-page__card-info">预算范围：¥{{ item.budgetMin.toLocaleString() }} - ¥{{ item.budgetMax.toLocaleString() }}</text>
        <view class="request-list-page__card-footer">
          <text class="request-list-page__card-date">提交于 {{ item.createdAt }}</text>
          <text v-if="item.status === 'quoted'" class="request-list-page__card-action" @tap.stop="viewQuotes(item.id)">查看报价 ></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CfStatusTag from '@/components/CfStatusTag.vue'
import type { Request, RequestStatus } from '@/types'

const activeStatus = ref<RequestStatus | 'all'>('all')
const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待报价', value: 'pending_quote' },
  { label: '已报价', value: 'quoted' },
  { label: '已确认', value: 'confirmed' },
  { label: '已签约', value: 'signed' },
  { label: '已取消', value: 'cancelled' },
]

const requestList = ref<Request[]>([
  { id: '1', title: '2024年会脱口秀演出', status: 'pending_quote', showType: 'talkshow', businessType: 'commercial', expectedDate: '2024-12-20', location: '北京', duration: 90, budgetMin: 5000, budgetMax: 10000, contactName: '张经理', contactPhone: '138****8888', createdAt: '2024-11-15', quotes: [], showTypeLabel: '脱口秀' },
  { id: '2', title: '公司十周年庆典表演', status: 'quoted', showType: 'improv', businessType: 'commercial', expectedDate: '2024-12-25', location: '上海', duration: 120, budgetMin: 15000, budgetMax: 25000, contactName: '李经理', contactPhone: '139****9999', createdAt: '2024-11-10', quotes: [], showTypeLabel: '即兴喜剧' },
  { id: '3', title: '客户答谢晚宴脱口秀', status: 'signed', showType: 'talkshow', businessType: 'commercial', expectedDate: '2024-12-28', location: '深圳', duration: 60, budgetMin: 8000, budgetMax: 15000, contactName: '王总', contactPhone: '137****7777', createdAt: '2024-11-08', quotes: [], showTypeLabel: '脱口秀' },
  { id: '4', title: '团队建设即兴喜剧', status: 'cancelled', showType: 'improv', businessType: 'outshow', expectedDate: '2024-12-15', location: '广州', duration: 90, budgetMin: 3000, budgetMax: 8000, contactName: '赵经理', contactPhone: '136****6666', createdAt: '2024-11-05', quotes: [], showTypeLabel: '即兴喜剧' },
])

function goDetail(id: string) { uni.navigateTo({ url: `/pages/request/detail/index?id=${id}` }) }
function viewQuotes(id: string) { uni.navigateTo({ url: `/pages/request/detail/index?id=${id}` }) }
</script>

<style lang="scss" scoped>
.request-list-page {
  &__stats {
    display: flex;
    gap: $space-sm;
    padding: $space-md $space-base;
  }

  &__stat {
    flex: 1;
    background-color: $color-bg-card;
    border-radius: $radius-md;
    padding: $space-md $space-sm;
    text-align: center;
    box-shadow: $shadow-sm;
  }

  &__stat-num { font-size: $text-3xl; font-weight: 700; display: block; }
  &__stat-num--primary { color: $color-primary; }
  &__stat-num--pending { color: $state-pending; }
  &__stat-num--confirmed { color: $state-confirmed; }
  &__stat-label { font-size: $text-xs; color: $color-text-tertiary; margin-top: 4rpx; display: block; }

  &__tabs { white-space: nowrap; padding: $space-sm $space-base; }

  &__tab {
    display: inline-block;
    padding: 12rpx $space-lg;
    border-radius: $radius-full;
    font-size: $text-base;
    color: $color-text-secondary;
    background-color: #f0f0f2;
    margin-right: $space-sm;
    &--active { background-color: $color-primary; color: $color-text-inverse; }
  }

  &__list {
    padding: 0 $space-base $space-xl;
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__card {
    background-color: $color-bg-card;
    border-radius: $radius-md;
    padding: $space-lg;
    box-shadow: $shadow-sm;
    &:active { opacity: 0.85; }
    &--cancelled { opacity: 0.55; }
  }

  &__card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: $space-sm; }

  &__card-title { font-size: $text-md; font-weight: 500; color: $color-text-primary; flex: 1; margin-right: $space-sm; }

  &__card-info { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 4rpx; }

  &__card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: $space-md; }

  &__card-date { font-size: $text-sm; color: $color-text-tertiary; }

  &__card-action { font-size: $text-md; color: $color-primary; font-weight: 500; }
}
</style>
