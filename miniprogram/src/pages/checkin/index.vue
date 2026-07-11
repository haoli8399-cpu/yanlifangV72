<template>
  <view class="checkin-page">
    <CfNavBar title="签到打卡" :showBack="true" backText="返回" />

    <!-- Event Info -->
    <view class="checkin-page__event card">
      <text class="checkin-page__event-title">星辰文化年会演出</text>
      <text class="checkin-page__event-info">2024-12-20 19:00 | 北京朝阳区XX会议中心</text>
      <CfStatusTag type="confirmed" />
    </view>

    <!-- Check-in Status -->
    <view class="checkin-page__status card">
      <view class="checkin-page__status-icon">
        <text class="checkin-page__checkmark">&#10003;</text>
      </view>
      <text class="checkin-page__status-text">已签到</text>
      <text class="checkin-page__status-time">签到时间：2024-12-20 17:35</text>
      <text class="checkin-page__status-location">签到地点：XX会议中心3楼</text>
    </view>

    <!-- Detail -->
    <view class="card">
      <text class="card-title">签到信息</text>
      <view class="checkin-page__detail-row"><text class="checkin-page__detail-label">到达时间</text><text class="checkin-page__detail-value">17:35（提前85分钟）</text></view>
      <view class="checkin-page__detail-row"><text class="checkin-page__detail-label">签到方式</text><text class="checkin-page__detail-value">GPS定位签到</text></view>
      <view class="checkin-page__detail-row"><text class="checkin-page__detail-label">签到地点</text><text class="checkin-page__detail-value">北京朝阳区XX会议中心（距离场地50m）</text></view>
      <view class="checkin-page__detail-row"><text class="checkin-page__detail-label">签到照片</text><view class="checkin-page__photo" /></view>
    </view>

    <!-- Note -->
    <view class="checkin-page__note">
      <text>请在演出开始前90分钟内完成签到，迟到签到将影响信誉评分</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'
</script>

<style lang="scss" scoped>
.checkin-page { background-color: $color-bg-page; padding-bottom: $space-2xl; }

.checkin-page__event { margin-top: 16rpx; padding: $space-lg !important; border-left: 8rpx solid $color-primary; }
.checkin-page__event-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; display: block; margin-bottom: $space-sm; }
.checkin-page__event-info { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: $space-sm; }

.checkin-page__status {
  text-align: center;
  padding: $space-2xl $space-lg !important;
}

.checkin-page__status-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: $state-confirmed-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $space-lg;
}

.checkin-page__checkmark { font-size: 80rpx; color: $state-confirmed; font-weight: 700; }

.checkin-page__status-text { font-size: $text-2xl; font-weight: 600; color: $state-confirmed; display: block; margin-bottom: $space-sm; }
.checkin-page__status-time { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 4rpx; }
.checkin-page__status-location { font-size: $text-base; color: $color-text-secondary; display: block; }

.checkin-page__detail-row { display: flex; justify-content: space-between; padding: $space-sm 0; }
.checkin-page__detail-label { font-size: $text-base; color: $color-text-secondary; }
.checkin-page__detail-value { font-size: $text-base; color: $color-text-primary; }

.checkin-page__photo { width: 96rpx; height: 96rpx; border-radius: $radius-sm; background-color: $color-bg-input; }

.checkin-page__note {
  margin: $space-md $space-base;
  padding: $space-md $space-lg;
  background-color: $color-bg-input;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $color-text-secondary;
}
</style>
