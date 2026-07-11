<template>
  <view class="request-submit-page">
    <!-- Tab 切换 -->
    <view class="submit-tabs">
      <view class="tab-item" :class="{ active: mode === 'ai' }" @click="mode = 'ai'">
        <text>描述需求提交</text>
      </view>
      <view class="tab-item" :class="{ active: mode === 'sku' }" @click="mode = 'sku'">
        <text>选方案提交</text>
      </view>
    </view>

    <!-- ===== Tab A: 描述需求 ===== -->
    <view class="ai-chat-container" v-if="mode === 'ai'">
      <!-- 微信粘贴入口：对话框顶部常驻 -->
      <view class="paste-bar" @click="onPaste">
        <text class="paste-icon">📎</text>
        <text class="paste-text">粘贴客户微信聊天记录，AI 自动识别</text>
      </view>

      <scroll-view scroll-y class="chat-scroll" :scroll-into-view="scrollInto">
        <!-- 首次进入：小演自我介绍 + 能力清单 -->
        <view class="first-intro" v-if="isFirstEntry">
          <view class="ai-bubble-intro">
            <view class="ai-avatar-row">
              <view class="ai-cube-avatar">AI</view>
              <text class="ai-name">小演</text>
              <text class="ai-subtitle">AI 商演经纪人</text>
            </view>
            <text class="intro-text">你好！我是小演，你的 AI 商演经纪人。</text>
            <text class="intro-text">你只需要告诉我客户的需求，我会帮你匹配最佳方案、算好报价、一直盯到成交。</text>
            <view class="capability-tags">
              <view class="cap-tag"><text>✅ 判断需求类型</text></view>
              <view class="cap-tag"><text>✅ 推荐匹配方案</text></view>
              <view class="cap-tag"><text>✅ 算出标准报价</text></view>
              <view class="cap-tag"><text>✅ 提醒跟进成单</text></view>
            </view>
          </view>
        </view>

        <!-- 对话消息列表 -->
        <view v-for="(msg, i) in messages" :key="i"
          class="chat-message"
          :class="msg.from === 'user' ? 'msg-user' : 'msg-ai'"
          :id="'msg-' + i"
        >
          <view v-if="msg.from === 'ai'" class="msg-avatar">
            <view class="ai-cube-sm">AI</view>
          </view>
          <view class="msg-bubble" :class="msg.from === 'user' ? 'bubble-user' : 'bubble-ai'">
            <text class="bubble-text">{{ msg.text }}</text>
            <!-- 内嵌方案卡片 -->
            <view class="bubble-plan-card" v-if="msg.plan" @click="goPlan(msg.plan.id)">
              <view class="bubble-plan-name">{{ msg.plan.name }}</view>
              <view class="bubble-plan-meta">{{ msg.plan.tier }} · {{ msg.plan.dur }} · 匹配 {{ msg.plan.match }}</view>
              <view class="bubble-plan-footer">
                <text class="bubble-plan-price">{{ msg.plan.price }}</text>
                <text class="bubble-plan-action">查看详情 →</text>
              </view>
            </view>
          </view>
        </view>

        <!-- AI typing 动画 -->
        <view class="typing-indicator" v-if="aiTyping">
          <view class="typing-dot" />
          <view class="typing-dot" />
          <view class="typing-dot" />
          <text class="typing-text">小演正在思考...</text>
        </view>

        <!-- 发送失败提示 -->
        <view class="send-error" v-if="sendError">
          <text class="send-error-text">发送失败，请检查网络后重试</text>
          <text class="send-error-retry" @click="sendError = false">重试</text>
        </view>

        <!-- 快捷回复芯片 -->
        <view class="quick-chips" v-if="showChips">
          <text class="chip" v-for="c in currentChips" :key="c" @click="onChip(c)">{{ c }}</text>
        </view>
        <view id="chat-bottom" style="height:4rpx"></view>
      </scroll-view>

      <!-- 底部输入栏 -->
      <view class="bottom-bar">
        <view class="voice-btn" @click="onVoice">
          <text>🎤</text>
        </view>
        <input class="chat-input" v-model="inputText" placeholder="描述你的演出需求..."
          placeholder-style="color: #9ca3af; font-size: 24rpx;" @confirm="onSend" />
        <view class="send-btn" @click="onSend">
          <text>发送</text>
        </view>
      </view>
    </view>

    <!-- ===== Tab B: 选方案提交 ===== -->
    <view class="sku-mode-container" v-if="mode === 'sku'">
      <view class="sku-empty" v-if="selectedSkus.length === 0">
        <text class="sku-empty-icon">📋</text>
        <text class="sku-empty-title">请从方案库中选择方案</text>
        <text class="sku-empty-desc">到「找方案」Tab 浏览并选择，回到此处提交</text>
      </view>
      <!-- 已选方案清单 -->
      <view class="sku-list" v-else>
        <view class="sku-list-header"><text>已选方案（{{ selectedSkus.length }}个）</text></view>
        <view class="sku-item" v-for="sku in selectedSkus" :key="sku.id">
          <view class="sku-item-info">
            <text class="sku-item-name">{{ sku.name }}</text>
            <text class="sku-item-meta">{{ sku.tier }} · {{ sku.dur }}</text>
          </view>
          <view class="sku-item-actions">
            <text class="sku-item-price">{{ sku.price }}</text>
            <text class="sku-item-remove" @click="removeSku(sku.id)">移除</text>
          </view>
        </view>
      </view>
      <!-- 补充需求表单 -->
      <view class="sku-form" v-if="selectedSkus.length > 0">
        <view class="form-title"><text>补充需求信息</text></view>
        <input class="form-field" v-model="supplement.date" placeholder="演出日期" placeholder-style="color: #9ca3af" />
        <input class="form-field" v-model="supplement.people" placeholder="预计人数" placeholder-style="color: #9ca3af" />
        <input class="form-field" v-model="supplement.budget" placeholder="预算范围" placeholder-style="color: #9ca3af" />
        <textarea class="form-textarea" v-model="supplement.notes" placeholder="其他补充说明…" placeholder-style="color: #9ca3af" />
        <view class="sku-submit-btn" @click="onSkuSubmit"><text>提交需求</text></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const mode = ref<'ai' | 'sku'>('ai');
const inputText = ref('');
const showChips = ref(true);
const scrollInto = ref('');
const isFirstEntry = ref(true);
const aiTyping = ref(false);
const sendError = ref(false);

const messages = ref<{ from: string; text: string; plan?: any }[]>([]);
const currentChips = ref(['50-100人', '100-300人', '300-500人', '脱口秀', '年会', '团建']);

// Tab B data
const selectedSkus = ref<any[]>([
  { id: '1', name: '脱口秀标准版', tier: 'T3', dur: '60min', price: '¥6,000' }
]);
const supplement = reactive({ date: '', people: '', budget: '', notes: '' });

onMounted(() => {
  uni.setNavigationBarTitle({ title: '提需求' });
});

function onSend() {
  if (!inputText.value.trim()) return;
  sendError.value = false;
  isFirstEntry.value = false;
  messages.value.push({ from: 'user', text: inputText.value.trim() });
  inputText.value = '';
  showChips.value = false;
  scrollInto.value = 'msg-' + (messages.value.length - 1);
  aiTyping.value = true;

  // Simulate AI reply with inline plan card
  setTimeout(() => {
    aiTyping.value = false;
    messages.value.push({
      from: 'ai',
      text: '收到！根据你的需求，我推荐以下方案：',
      plan: {
        id: 'talkshow-standard',
        name: '脱口秀标准版 T3 60min',
        tier: 'T3级',
        dur: '60分钟·2人',
        match: '94%',
        price: '¥6,000',
      },
    });
    currentChips.value = ['确认这个方案', '换个便宜点的', '想要更高级别', '修改人数'];
    showChips.value = true;
    scrollInto.value = 'chat-bottom';
  }, 1200);
}

function onChip(text: string) {
  inputText.value = text;
  onSend();
}

function onPaste() {
  uni.setStorageSync('submitEntryMode', 'paste');
  uni.showToast({ title: '请粘贴微信聊天记录', icon: 'none' });
}

function onVoice() {
  uni.setStorageSync('submitEntryMode', 'voice');
}

function goPlan(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail/index?id=${id}` });
}

function removeSku(id: string) {
  selectedSkus.value = selectedSkus.value.filter(s => s.id !== id);
}

function onSkuSubmit() {
  uni.showToast({ title: '需求已提交', icon: 'success' });
}
</script>

<style lang="scss" scoped>
.request-submit-page {
  min-height: 100vh;
  background: $color-bg-page;
  display: flex;
  flex-direction: column;
}

/* ===== Tabs ===== */
.submit-tabs {
  display: flex; gap: 8rpx;
  padding: 24rpx 32rpx;
  background: $color-bg-card;
  border-bottom: 2rpx solid $color-border;
}
.tab-item {
  flex: 1; text-align: center; padding: 16rpx 0;
  border-radius: $radius-sm;
  font-size: $text-base; font-weight: 600;
  color: $color-text-secondary; background: $color-bg-input;
}
.tab-item.active {
  background: $color-primary; color: $color-text-inverse;
}

/* ===== Paste Bar (顶部常驻) ===== */
.paste-bar {
  margin: 16rpx 32rpx; padding: 16rpx 24rpx;
  display: flex; align-items: center; gap: 12rpx;
  background: $color-primary-subtle;
  border: 2rpx dashed $color-primary;
  border-radius: $radius-md;
}
.paste-bar:active { opacity: 0.7; }
.paste-icon { font-size: 32rpx; }
.paste-text { font-size: $text-sm; font-weight: 600; color: $color-primary; }

/* ===== Chat ===== */
.ai-chat-container {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.chat-scroll { flex: 1; padding: 16rpx 32rpx; }

/* First intro */
.first-intro { margin-bottom: 24rpx; }
.ai-bubble-intro {
  background: $color-primary-subtle;
  border-radius: $radius-md;
  padding: 24rpx;
}
.ai-avatar-row {
  display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx;
}
.ai-cube-avatar {
  width: 48rpx; height: 48rpx; border-radius: 8rpx;
  background: $color-primary; color: #fff;
  font-size: 20rpx; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.ai-name { font-size: 28rpx; font-weight: 700; color: $color-text-primary; }
.ai-subtitle { font-size: 24rpx; color: $color-text-tertiary; }
.intro-text {
  display: block;
  font-size: $text-base; color: $color-text-secondary; line-height: 1.6; margin-bottom: 8rpx;
}
.capability-tags {
  display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 16rpx;
}
.cap-tag {
  font-size: 22rpx; font-weight: 600;
  padding: 8rpx 16rpx; border-radius: $radius-full;
  background: $color-bg-card; color: $color-primary;
}

/* Chat messages */
.chat-message {
  display: flex; gap: 8rpx; margin-bottom: 24rpx;
}
.msg-user { justify-content: flex-end; }
.msg-avatar { flex-shrink: 0; }
.ai-cube-sm {
  width: 40rpx; height: 40rpx; border-radius: 8rpx;
  background: $color-primary; color: #fff;
  font-size: 16rpx; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.msg-bubble {
  max-width: 500rpx; padding: 16rpx 24rpx;
  border-radius: $radius-md; font-size: $text-base; line-height: 1.5;
}
.bubble-ai { background: $color-primary-subtle; }
.bubble-user { background: $color-bg-input; }
.bubble-text { color: $color-text-primary; }

/* Inline plan card */
.bubble-plan-card {
  margin-top: 12rpx; padding: 16rpx;
  background: $color-bg-card; border-radius: $radius-sm;
  border: 2rpx solid $color-primary;
}
.bubble-plan-card:active { opacity: 0.8; }
.bubble-plan-name { font-size: $text-base; font-weight: 700; color: $color-text-primary; }
.bubble-plan-meta { font-size: 24rpx; color: $color-text-secondary; margin: 4rpx 0; }
.bubble-plan-footer {
  display: flex; justify-content: space-between; align-items: center; margin-top: 8rpx;
}
.bubble-plan-price {
  font-size: 28rpx; font-weight: 800; color: $color-primary;
  font-family: 'JetBrains Mono', monospace;
}
.bubble-plan-action { font-size: 22rpx; color: $color-primary; font-weight: 600; }

/* Quick chips */
.quick-chips {
  display: flex; gap: 8rpx; flex-wrap: wrap; padding: 8rpx 0 16rpx;
}
.chip {
  padding: 8rpx 24rpx; border: 2rpx solid $color-primary;
  border-radius: $radius-full;
  font-size: $text-sm; font-weight: 600; color: $color-primary;
}
.chip:active { background: $color-primary-subtle; }
.chip.active {
  background: $color-primary;
  color: #fff;
  border-color: $color-primary;
}

/* Input bar */
.bottom-bar {
  display: flex; align-items: center; gap: 8rpx;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: $color-bg-card;
  border-top: 2rpx solid $color-border;
}
.voice-btn {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: $color-primary-subtle; border: 2rpx solid $color-primary;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; flex-shrink: 0;
}
.chat-input {
  flex: 1; height: 64rpx; padding: 0 16rpx;
  background: $color-bg-input; border-radius: $radius-full;
  font-size: $text-base; border: none; outline: none;
}
.send-btn {
  height: 56rpx; padding: 0 24rpx;
  background: $color-primary; color: $color-text-inverse;
  border-radius: $radius-full;
  font-size: $text-base; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ===== Tab B: SKU mode ===== */
.sku-mode-container {
  flex: 1; padding: 24rpx 32rpx; overflow-y: auto;
}
.sku-empty {
  text-align: center; padding: 120rpx 0;
}
.sku-empty-icon { font-size: 64rpx; display: block; margin-bottom: 16rpx; }
.sku-empty-title { font-size: $text-lg; font-weight: 600; color: $color-text-primary; display: block; }
.sku-empty-desc { font-size: $text-sm; color: $color-text-secondary; display: block; margin-top: 8rpx; }

.sku-list-header {
  font-size: $text-base; font-weight: 700; color: $color-text-primary; margin-bottom: 12rpx;
}
.sku-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx 24rpx;
  background: $color-bg-card; border-radius: $radius-sm;
  border: 2rpx solid $color-border; margin-bottom: 8rpx;
}
.sku-item-name { font-size: $text-base; font-weight: 600; color: $color-text-primary; }
.sku-item-meta { font-size: 24rpx; color: $color-text-secondary; margin-top: 4rpx; }
.sku-item-price { font-size: 28rpx; font-weight: 800; color: $color-primary; font-family: 'JetBrains Mono', monospace; }
.sku-item-remove { font-size: 22rpx; color: $color-text-tertiary; margin-left: 16rpx; }

.sku-form { margin-top: 24rpx; }
.form-title { font-size: $text-base; font-weight: 700; color: $color-text-primary; margin-bottom: 12rpx; }
.form-field {
  width: 100%; height: 72rpx; padding: 0 20rpx;
  background: $color-bg-card; border: 2rpx solid $color-border;
  border-radius: $radius-sm; font-size: $text-base;
  box-sizing: border-box; margin-bottom: 16rpx;
}
.form-textarea {
  width: 100%; height: 120rpx; padding: 16rpx 20rpx;
  background: $color-bg-card; border: 2rpx solid $color-border;
  border-radius: $radius-sm; font-size: $text-base;
  box-sizing: border-box; margin-bottom: 16rpx;
}
.sku-submit-btn {
  height: 80rpx; line-height: 80rpx; text-align: center;
  background: $color-primary; color: $color-text-inverse;
  border-radius: $radius-full; font-size: $text-base; font-weight: 600;
}

/* ===== AI Typing Indicator ===== */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0;
}
.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $color-primary;
  animation: typing-bounce 1.4s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
.typing-text {
  font-size: $text-sm;
  color: $color-text-tertiary;
  margin-left: 8rpx;
}

/* ===== Send Error ===== */
.send-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  margin: 16rpx 0;
  background: #fef2f2;
  border-radius: $radius-sm;
  border: 2rpx solid rgba($color-danger, 0.2);
}
.send-error-text {
  font-size: $text-sm;
  color: $color-danger;
}
.send-error-retry {
  font-size: $text-sm;
  font-weight: 600;
  color: $color-primary;
  padding: 4rpx 16rpx;
}
</style>