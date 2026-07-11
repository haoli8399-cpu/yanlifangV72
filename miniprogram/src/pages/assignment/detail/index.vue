<template>
  <view class="assignment-detail-page page-with-cta">
    <CfNavBar title="排期详情" :showBack="true" backText="返回" />

    <!-- Status Banner -->
    <view class="card assignment-detail-page__banner">
      <text class="assignment-detail-page__banner-title">星辰文化年会演出</text>
      <view style="display: flex; align-items: center; gap: $space-md; margin-top: $space-sm;">
        <CfStatusTag type="confirmed" />
        <text class="assignment-detail-page__banner-sub">脱口秀 | 90分钟 | T3级演员</text>
      </view>
    </view>

    <!-- 演出信息 -->
    <view class="card">
      <text class="card-title">演出信息</text>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">演出时间</text><text class="assignment-detail-page__detail-value">2024-12-20 19:00-20:30</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">演出地点</text><text class="assignment-detail-page__detail-value">北京朝阳区XX会议中心3楼宴会厅</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">到达时间</text><text class="assignment-detail-page__detail-value">2024-12-20 17:30（提前90分钟）</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">观众人数</text><text class="assignment-detail-page__detail-value">约200人</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">演出类型</text><text class="assignment-detail-page__detail-value">脱口秀</text></view>
    </view>

    <!-- 需求方信息 -->
    <view class="card">
      <text class="card-title">需求方信息</text>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">公司名称</text><text class="assignment-detail-page__detail-value">星辰文化传媒有限公司</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">联系人</text><text class="assignment-detail-page__detail-value">张经理</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">联系电话</text><text class="assignment-detail-page__detail-value" style="color: $color-primary;">138****8888</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">备注</text><text class="assignment-detail-page__detail-value">年会现场有LED大屏可使用</text></view>
    </view>

    <!-- 结算信息 -->
    <view class="card">
      <text class="card-title">结算信息</text>
      <text class="assignment-detail-page__compensation">¥3,500</text>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">结算方式</text><text class="assignment-detail-page__detail-value">演出结束后7个工作日内</text></view>
      <view class="assignment-detail-page__detail-row"><text class="assignment-detail-page__detail-label">结算状态</text><CfStatusTag type="pending" /></view>
    </view>

    <!-- Fixed CTA -->
    <view class="fixed-bottom">
      <button class="btn btn-primary" style="width: 100%;" @tap="contactClient">联系需求方</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'

function contactClient() { uni.makePhoneCall({ phoneNumber: '13888888888' }) }
</script>

<style lang="scss" scoped>
.assignment-detail-page {
  background-color: $color-bg-page;

  &__banner { margin-top: 16rpx; border-left: 8rpx solid $color-primary; }
  &__banner-title { font-size: $text-2xl; font-weight: 600; color: $color-text-primary; }
  &__banner-sub { font-size: $text-base; color: $color-text-secondary; }

  &__detail-row { display: flex; justify-content: space-between; padding: $space-sm 0; }
  &__detail-label { font-size: $text-base; color: $color-text-secondary; flex-shrink: 0; margin-right: $space-md; }
  &__detail-value { font-size: $text-base; color: $color-text-primary; text-align: right; }

  &__compensation { font-size: $text-3xl; font-weight: 700; color: $color-primary; display: block; margin-bottom: $space-md; }
}

.card-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; margin-bottom: $space-md; display: block; }
</style>
