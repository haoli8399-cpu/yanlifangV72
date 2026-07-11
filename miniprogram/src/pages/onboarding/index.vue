<template>
  <view class="onboarding-page page-with-cta">
    <CfNavBar title="演员入驻" :showBack="false">
      <template #left><text class="nav-text" @tap="cancel">取消</text></template>
      <template #right><text class="nav-text nav-text--primary" @tap="showHelp">帮助</text></template>
    </CfNavBar>

    <!-- Progress -->
    <view class="onboarding-page__progress">
      <view class="onboarding-page__steps">
        <view class="onboarding-page__step onboarding-page__step--done"><text>&#10003;</text></view>
        <view class="onboarding-page__step-line onboarding-page__step-line--done" />
        <view class="onboarding-page__step onboarding-page__step--active"><text>2</text></view>
        <view class="onboarding-page__step-line" />
        <view class="onboarding-page__step"><text>3</text></view>
      </view>
      <view class="onboarding-page__step-labels">
        <text class="onboarding-page__step-label onboarding-page__step-label--done">基本信息</text>
        <text class="onboarding-page__step-label onboarding-page__step-label--active">演艺经历</text>
        <text class="onboarding-page__step-label">资料上传</text>
      </view>
    </view>

    <!-- Form -->
    <view class="onboarding-page__body">
      <!-- 基本信息 -->
      <view class="card">
        <text class="card-title">基本信息</text>
        <view class="form-cell"><text class="form-label">艺名/舞台名</text><input v-model="form.stageName" placeholder="请输入艺名" placeholder-class="form-placeholder" /></view>
        <view class="form-cell"><text class="form-label">真实姓名</text><input v-model="form.realName" placeholder="请输入真实姓名" placeholder-class="form-placeholder" /></view>
        <view class="form-cell"><text class="form-label">手机号码</text><view style="display: flex; align-items: center;"><text style="color: $color-text-tertiary; margin-right: $space-sm; font-size: $text-md;">+86</text><input type="number" v-model="form.phone" placeholder="请输入手机号码" placeholder-class="form-placeholder" style="flex: 1;" /></view></view>
      </view>

      <!-- 演艺信息 -->
      <view class="card">
        <text class="card-title">演艺信息</text>
        <view class="form-cell" @tap="showPicker('showType')"><text class="form-label">表演类型</text><view class="form-cell__right"><text>脱口秀</text><text class="form-arrow">></text></view></view>
        <view class="form-cell" @tap="showPicker('tier')"><text class="form-label">咖位等级</text><view class="form-cell__right"><view class="status-tag status-tag--signed"><text>T3</text></view><text class="form-arrow">></text></view></view>
        <view class="form-cell" @tap="showPicker('years')"><text class="form-label">从业年限</text><view class="form-cell__right"><text>5-8年</text><text class="form-arrow">></text></view></view>
        <view class="form-textarea"><text class="form-label">个人简介</text><textarea v-model="form.bio" placeholder="请介绍你的表演风格和特色..." placeholder-class="form-placeholder" /></view>
      </view>

      <!-- 社交媒体 -->
      <view class="card">
        <text class="card-title">社交媒体</text>
        <view class="form-cell"><text class="form-label">抖音号</text><input v-model="form.douyin" placeholder="请输入抖音号" placeholder-class="form-placeholder" /></view>
        <view class="form-cell"><text class="form-label">小红书号</text><input v-model="form.xiaohongshu" placeholder="请输入小红书号" placeholder-class="form-placeholder" /></view>
        <view class="form-cell"><text class="form-label">其他作品链接</text><input v-model="form.otherLinks" placeholder="请输入链接" placeholder-class="form-placeholder" /></view>
      </view>
    </view>

    <!-- Fixed CTA -->
    <view class="fixed-bottom">
      <button class="btn btn-default" @tap="goPrev">上一步</button>
      <button class="btn btn-primary" style="flex: 1;" @tap="goNext">下一步</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const form = reactive({
  stageName: '', realName: '', phone: '', showType: '', tier: '', years: '', bio: '', douyin: '', xiaohongshu: '', otherLinks: '',
})

function cancel() { uni.navigateBack() }
function showHelp() { uni.showToast({ title: '帮助', icon: 'none' }) }
function showPicker(field: string) { uni.showToast({ title: field, icon: 'none' }) }
function goPrev() { uni.showToast({ title: '上一步', icon: 'none' }) }
function goNext() { uni.showToast({ title: '下一步', icon: 'none' }) }
</script>

<style lang="scss" scoped>
.onboarding-page { background-color: $color-bg-page; }
.nav-text { font-size: $text-md; color: $color-text-secondary; }
.nav-text--primary { color: $color-primary; }

.onboarding-page__progress { padding: $space-xl $space-base; }
.onboarding-page__steps { display: flex; align-items: center; justify-content: center; margin-bottom: $space-sm; }
.onboarding-page__step {
  width: 56rpx; height: 56rpx; border-radius: 50%; background-color: $color-bg-input;
  display: flex; align-items: center; justify-content: center; font-size: $text-base; color: $color-text-tertiary;
  &--done { background-color: $state-confirmed; color: #fff; }
  &--active { background-color: $color-primary; color: #fff; font-weight: 600; }
}
.onboarding-page__step-line { width: 80rpx; height: 4rpx; background-color: $color-primary-subtle; &--done { background-color: $state-confirmed; } }
.onboarding-page__step-labels { display: flex; justify-content: space-around; }
.onboarding-page__step-label { font-size: $text-sm; color: $color-text-tertiary; &--done { color: $state-confirmed; } &--active { color: $color-primary; font-weight: 600; } }

.onboarding-page__body { padding-bottom: 16rpx; }

.card-title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; margin-bottom: $space-md; display: block; }
.form-cell { display: flex; align-items: center; justify-content: space-between; height: 96rpx; border-bottom: 1rpx solid $color-divider; input { flex: 1; text-align: right; font-size: $text-md; } &__right { display: flex; align-items: center; gap: $space-xs; color: $color-text-primary; } }
.form-label { font-size: $text-base; color: $color-text-secondary; margin-right: $space-md; flex-shrink: 0; }
.form-placeholder { color: $color-text-placeholder; }
.form-arrow { color: $color-text-tertiary; margin-left: 4rpx; }
.form-textarea { padding: $space-md 0; textarea { width: 100%; height: 160rpx; font-size: $text-md; margin-top: $space-sm; } }
</style>
