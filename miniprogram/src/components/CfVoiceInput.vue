<template>
  <view
    class="cf-voice-input"
    :class="[`cf-voice-input--${status}`, { 'cf-voice-input--compact': compact }]"
    @tap="handleTap"
  >
    <text class="cf-voice-input__icon">{{ icon }}</text>
    <view v-if="status === 'recording'" class="cf-voice-input__waves">
      <view class="cf-voice-input__wave" />
      <view class="cf-voice-input__wave" />
      <view class="cf-voice-input__wave" />
    </view>
    <text v-else-if="!iconOnly" class="cf-voice-input__label">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  status?: 'idle' | 'recording' | 'uploading' | 'done'
  compact?: boolean
  iconOnly?: boolean
}>(), {
  status: 'idle',
  compact: false,
  iconOnly: false,
})

const emit = defineEmits<{
  (e: 'tap'): void
}>()

const icon = computed(() => {
  if (props.status === 'recording') return '●'
  if (props.status === 'uploading') return '↟'
  if (props.status === 'done') return '✓'
  return '🎤'
})

const label = computed(() => {
  if (props.status === 'recording') return '录音中'
  if (props.status === 'uploading') return '上传中'
  if (props.status === 'done') return '已完成'
  return '语音'
})

function handleTap() {
  emit('tap')
}
</script>

<style lang="scss" scoped>
.cf-voice-input {
  min-width: 120rpx;
  height: 72rpx;
  padding: 0 $space-md;
  border: 2rpx solid $color-primary;
  border-radius: $radius-full;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-xs;
  color: $color-primary;
  background: $color-bg-card;
  font-size: $text-sm;
  font-weight: 600;

  &--compact {
    min-width: 72rpx;
    width: 72rpx;
    padding: 0;
  }

  &--recording {
    background: $color-primary;
    color: $color-text-inverse;
  }

  &--uploading {
    background: $color-primary-subtle;
  }

  &--done {
    border-color: $color-success;
    color: $color-success;
  }

  &__icon {
    font-size: $text-lg;
    line-height: 1;
  }

  &__label {
    font-size: $text-sm;
  }

  &__waves {
    height: 28rpx;
    display: flex;
    align-items: center;
    gap: 5rpx;
  }

  &__wave {
    width: 5rpx;
    height: 14rpx;
    border-radius: $radius-full;
    background: $color-text-inverse;
    animation: cf-voice-wave 0.9s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

@keyframes cf-voice-wave {
  0%, 100% { transform: scaleY(0.55); opacity: 0.7; }
  50% { transform: scaleY(1.45); opacity: 1; }
}
</style>
