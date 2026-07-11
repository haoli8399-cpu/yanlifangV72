<template>
  <view class="assignment-list-page">
    <CfNavBar title="我的排期" :showBack="false">
      <template #right>
        <text class="nav-right-link" @tap="goCalendar">📅</text>
      </template>
    </CfNavBar>

    <!-- Stats -->
    <view class="assignment-list-page__stats">
      <view class="assignment-list-page__stat-card">
        <text class="assignment-list-page__stat-label">待确认</text>
        <text class="assignment-list-page__stat-num assignment-list-page__stat-num--pending">3</text>
      </view>
      <view class="assignment-list-page__stat-card">
        <text class="assignment-list-page__stat-label">已确认</text>
        <text class="assignment-list-page__stat-num assignment-list-page__stat-num--confirmed">8</text>
      </view>
    </view>

    <!-- Month Label -->
    <text class="assignment-list-page__month">2024年12月</text>

    <!-- Schedule Cards -->
    <view class="assignment-list-page__list" style="padding-bottom: calc(120rpx + env(safe-area-inset-bottom));">
      <view v-for="item in assignments" :key="item.id" class="assignment-list-page__card" :class="`assignment-list-page__card--${item.status}`">
        <view class="assignment-list-page__card-header">
          <text class="assignment-list-page__card-title">{{ item.title }}</text>
          <CfStatusTag :type="item.status" />
        </view>
        <text class="assignment-list-page__card-info">演出类型：脱口秀 | 时长：90分钟</text>
        <text class="assignment-list-page__card-info">演出地点：{{ item.location }}</text>
        <text class="assignment-list-page__card-info">演出时间：{{ item.date }} {{ item.startTime }}</text>

        <!-- Actions for pending_confirm -->
        <view v-if="item.status === 'pending_confirm'" class="assignment-list-page__card-actions">
          <button class="btn btn-reject" size="mini" @tap="rejectAssignment(item.id)">拒绝</button>
          <button class="btn btn-accept" size="mini" @tap="confirmAssignment(item.id)">确认</button>
        </view>
        <view v-else-if="item.status === 'confirmed'" class="assignment-list-page__card-footer">
          <text class="assignment-list-page__card-link" @tap="goDetail(item.id)">查看详情 ></text>
        </view>
        <view v-else-if="item.status === 'completed'" class="assignment-list-page__card-footer">
          <text class="assignment-list-page__card-settled">已结算 ¥{{ item.compensation.toLocaleString() }}</text>
        </view>
      </view>
    </view>

    <!-- Custom Tab Bar -->
    <CfTabBar currentTab="assignment" />
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'
import CfTabBar from '@/components/CfTabBar.vue'

const assignments = [
  { id: '1', title: '星辰文化年会演出', status: 'pending_confirm' as const, date: '2024-12-20', startTime: '19:00', location: '北京朝阳区XX会议中心', compensation: 3500 },
  { id: '2', title: '科技公司年会脱口秀', status: 'confirmed' as const, date: '2024-12-22', startTime: '20:00', location: '海淀区XX大厦', compensation: 5000 },
  { id: '3', title: '跨年喜剧之夜', status: 'pending_confirm' as const, date: '2024-12-31', startTime: '21:00', location: '三里屯XX剧场', compensation: 4200 },
  { id: '4', title: '互联网大会暖场演出', status: 'completed' as const, date: '2024-12-10', startTime: '09:00', location: '国家会议中心', compensation: 3000 },
]

function goCalendar() { uni.navigateTo({ url: '/pages/assignment/calendar/index' }) }
function goDetail(id: string) { uni.navigateTo({ url: `/pages/assignment/detail/index?id=${id}` }) }
function confirmAssignment(id: string) { uni.showToast({ title: '已确认', icon: 'success' }) }
function rejectAssignment(id: string) { uni.showToast({ title: '已拒绝', icon: 'none' }) }
</script>

<style lang="scss" scoped>
.assignment-list-page { background-color: $color-bg-page; min-height: 100vh; }
.nav-right-link { font-size: $text-xl; }

.assignment-list-page__stats { display: flex; gap: $space-sm; padding: $space-md $space-base; }
.assignment-list-page__stat-card { flex: 1; background-color: $color-bg-card; border-radius: $radius-md; padding: $space-md $space-sm; text-align: center; box-shadow: $shadow-sm; }
.assignment-list-page__stat-label { font-size: $text-xs; color: $color-text-tertiary; display: block; margin-bottom: 8rpx; }
.assignment-list-page__stat-num { font-size: $text-4xl; font-weight: 700; display: block; }
.assignment-list-page__stat-num--pending { color: $state-pending; }
.assignment-list-page__stat-num--confirmed { color: $state-confirmed; }

.assignment-list-page__month { font-size: $text-md; font-weight: 600; color: $color-text-primary; padding: $space-lg $space-base $space-sm; display: block; }

.assignment-list-page__list { padding: 0 $space-base; display: flex; flex-direction: column; gap: $space-md; }

.assignment-list-page__card {
  background-color: $color-bg-card;
  border-radius: $radius-md;
  padding: $space-lg;
  box-shadow: $shadow-sm;
  border-left: 8rpx solid $color-border;
  &--pending_confirm { border-left-color: $state-pending; }
  &--confirmed { border-left-color: $state-confirmed; }
  &--completed { border-left-color: $state-quoted; }
}

.assignment-list-page__card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: $space-sm; }
.assignment-list-page__card-title { font-size: $text-md; font-weight: 500; color: $color-text-primary; flex: 1; margin-right: $space-sm; }
.assignment-list-page__card-info { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 4rpx; }
.assignment-list-page__card-actions { display: flex; gap: $space-md; margin-top: $space-lg; justify-content: flex-end; }
.assignment-list-page__card-footer { margin-top: $space-md; }
.assignment-list-page__card-link { font-size: $text-md; color: $color-primary; }
.assignment-list-page__card-settled { font-size: $text-md; color: $state-confirmed; font-weight: 500; }

.btn-accept { background-color: $state-confirmed; color: #fff; border-radius: $radius-full; border: none; padding: 0 40rpx; height: 64rpx; font-size: $text-sm; }
.btn-reject { background-color: transparent; color: $state-cancelled; border: 2rpx solid $state-cancelled; border-radius: $radius-full; padding: 0 40rpx; height: 64rpx; font-size: $text-sm; }
</style>
