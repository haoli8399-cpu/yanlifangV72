<template>
  <view class="discover-page">
    <!-- 加载骨架屏 -->
    <view v-if="loading" class="loading-skeleton">
      <view class="skeleton-bar" style="height: 40rpx; width: 60%; margin-bottom: 24rpx;" />
      <view class="skeleton-bar" style="height: 60rpx; width: 90%; margin-bottom: 16rpx;" />
      <view class="skeleton-bar" style="height: 40rpx; width: 80%; margin-bottom: 32rpx;" />
      <view class="skeleton-bar" style="height: 80rpx; width: 100%; border-radius: 48rpx; margin-bottom: 24rpx;" />
      <view class="skeleton-bar" style="height: 48rpx; width: 50%; margin-bottom: 32rpx;" />
      <view class="skeleton-bar" style="height: 120rpx; width: 100%; margin-bottom: 16rpx;" />
      <view class="skeleton-bar" style="height: 120rpx; width: 100%; margin-bottom: 16rpx;" />
      <view class="skeleton-bar" style="height: 120rpx; width: 100%;" />
    </view>

    <!-- 错误提示 -->
    <view v-else-if="error" class="error-state">
      <text class="error-icon">⚠️</text>
      <text class="error-title">加载失败</text>
      <text class="error-desc">网络异常，请检查后重试</text>
      <view class="error-retry-btn" @click="loadData">
        <text>重新加载</text>
      </view>
    </view>

    <scroll-view v-else scroll-y class="page-scroll" :show-scrollbar="false">
      <!-- ===== 品牌栏 ===== -->
      <view class="brand-bar">
        <view class="brand-left">
          <view class="brand-cube" />
          <text class="brand-name">演立方</text>
          <text class="brand-tagline">商演找演立方</text>
        </view>
        <view class="agent-badge">
          <view class="agent-dot" />
          <text>小演</text>
        </view>
      </view>

      <!-- ===== 需求输入区 ===== -->
      <view class="hero-section">
        <view class="hero-ai-hint">
          <view class="ai-mini-cube">AI</view>
          <text class="hero-ai-text">小演帮你快速成交</text>
        </view>
        <view class="hero-title">你只需要一句需求</view>
        <view class="hero-subtitle">小演自动匹配演出方案、算出报价、盯到成单</view>
      </view>

      <view class="input-bar">
        <view class="voice-btn" @click="goVoice">
          <text>🎤</text>
        </view>
        <input
          class="input-field"
          v-model="inputText"
          placeholder="说一句需求，小演立刻匹配..."
          placeholder-style="color: #9ca3af; font-size: 24rpx;"
          @confirm="onSend"
        />
        <view class="send-btn" @click="onSend">
          <text>发送</text>
        </view>
      </view>

      <view class="paste-link" @click="goPaste">
        <text>📎 粘贴微信聊天记录自动识别</text>
        <text class="paste-arrow">→</text>
      </view>

      <!-- ===== 活动类型标签 ===== -->
      <view class="tag-row">
        <view
          v-for="tag in activityTags"
          :key="tag.value"
          class="tag-item"
          :class="{ active: selectedTag === tag.value }"
          @click="onTagSelect(tag.value)"
        >
          <text>{{ tag.label }}</text>
        </view>
      </view>

      <!-- ===== 独立艺人工作台入口（仅独立艺人可见）===== -->
      <view v-if="isIndiePerformer" class="performer-entry" @tap="goPerformerWorkbench">
        <text class="performer-entry__icon">🎭</text>
        <view class="performer-entry__body">
          <text class="performer-entry__title">独立艺人工作台</text>
          <text class="performer-entry__desc">管理档期 · 接收订单 · 查看收益</text>
        </view>
        <text class="performer-entry__arrow">→</text>
      </view>

      <!-- ===== 区块1: AI最近生成方案 ===== -->
      <view class="section-block">
        <view class="section-header" @click="goAllPlans">
          <view class="section-header-left">
            <text class="section-icon">◇</text>
            <view>
              <text class="section-title">AI 最近为你生成</text>
              <text class="section-meta">个性化推荐</text>
            </view>
          </view>
          <view class="section-arrow">查看全部 →</view>
        </view>
        <view
          v-for="plan in recentPlans"
          :key="plan.id"
          class="plan-card"
          :style="{ borderLeftColor: plan.color || 'var(--color-primary)' }"
          @click="goPlan(plan.id)"
        >
          <view class="plan-info">
            <text class="plan-name">{{ plan.name }}</text>
            <text class="plan-meta">{{ plan.meta }}</text>
            <view class="plan-tags">
              <text class="plan-tag primary" v-if="plan.matchTag">{{ plan.matchTag }}</text>
              <text class="plan-tag subtle" v-if="plan.note">{{ plan.note }}</text>
            </view>
          </view>
          <text class="plan-price">{{ plan.price }}</text>
        </view>
      </view>

      <!-- ===== 区块2: 我的历史需求 ===== -->
      <view class="section-block">
        <view class="section-header" @click="goHistory">
          <view class="section-header-left">
            <text class="section-icon">📋</text>
            <view>
              <text class="section-title">我的历史需求</text>
              <text class="section-meta">任务延续</text>
            </view>
          </view>
          <view class="section-arrow">查看全部 →</view>
        </view>
        <view
          v-for="(item, idx) in historyDemands"
          :key="idx"
          class="history-card"
          @click="goDemandDetail(item)"
        >
          <view class="history-icon" :class="item.statusClass">
            <text>{{ item.icon }}</text>
          </view>
          <view class="history-info">
            <text class="history-name">{{ item.name }}</text>
            <text class="history-meta">{{ item.meta }}</text>
          </view>
          <view class="history-status" :class="item.statusClass">
            <text>{{ item.statusLabel }}</text>
          </view>
        </view>
        <view class="history-empty" v-if="historyDemands.length === 0">
          <text class="history-empty-text">暂无历史需求，现在去提一个？</text>
        </view>
      </view>

      <!-- ===== 区块3: 案例参考 ===== -->
      <view class="section-block">
        <view class="section-header" @click="goAllCases">
          <view class="section-header-left">
            <text class="section-icon">🏆</text>
            <view>
              <text class="section-title">真实成交案例</text>
              <text class="section-meta">参考借鉴</text>
            </view>
          </view>
          <view class="section-arrow">更多 →</view>
        </view>
        <view
          v-for="(item, idx) in caseStudies"
          :key="idx"
          class="case-card"
          @click="goCaseDetail(item)"
        >
          <view class="case-cover" :style="{ background: item.coverColor }">
            <text>{{ item.coverIcon }}</text>
          </view>
          <view class="case-body">
            <text class="case-title">{{ item.title }}</text>
            <text class="case-desc">{{ item.desc }}</text>
            <view class="case-footer">
              <text class="case-source-tag" :class="item.sourceClass">{{ item.sourceLabel }}</text>
              <text class="case-amount">{{ item.amount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ===== 区块4: 平台甄选 ===== -->
      <view class="section-block">
        <view class="section-header" @click="goCurated">
          <view class="section-header-left">
            <text class="section-icon">✦</text>
            <view>
              <text class="section-title">平台甄选</text>
              <text class="section-meta">高质量方案推荐</text>
            </view>
          </view>
          <view class="section-arrow">查看全部 →</view>
        </view>
        <view class="curated-grid">
          <view
            v-for="(item, idx) in curatedPlans"
            :key="idx"
            class="curated-card"
            @click="goPlan(item.id)"
          >
            <view class="curated-cover" :style="{ background: item.coverColor }">
              <text>{{ item.coverIcon }}</text>
            </view>
            <view class="curated-body">
              <text class="curated-name">{{ item.name }}</text>
              <view class="curated-tags">
                <text class="curated-tag" :class="item.sourceClass">{{ item.sourceLabel }}</text>
              </view>
              <text class="curated-price">{{ item.price }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const inputText = ref('');
const selectedTag = ref('all');
const loading = ref(true);
const error = ref(false);
const isIndiePerformer = ref(false);

function syncRole() {
  // 仅「独立艺人」可见入口：角色为 performer 且非经纪公司(agency)
  const role = uni.getStorageSync('user_role');
  const actorType = uni.getStorageSync('user_actor_type');
  isIndiePerformer.value = role === 'performer' && actorType !== 'agency';
}

function loadData() {
  loading.value = true;
  error.value = false;
  // 模拟数据加载，实际项目替换为真实接口调用
  setTimeout(() => {
    loading.value = false;
    // error.value = true; // 取消注释可测试错误状态
  }, 800);
}

onShow(syncRole);

onMounted(() => {
  uni.setNavigationBarTitle({ title: '演立方' });
  syncRole();
  loadData();
});

function goPerformerWorkbench() {
  uni.navigateTo({ url: '/pages/user/performer/index' });
}

const activityTags = [
  { value: 'all', label: '全部' },
  { value: 'talkshow', label: '脱口秀' },
  { value: 'annual', label: '年会' },
  { value: 'team', label: '团建' },
  { value: 'business', label: '商业活动' },
  { value: 'roadshow', label: '路演' },
  { value: 'other', label: '其他' },
];

const recentPlans = [
  {
    id: 'talkshow-corp', name: 'XX科技年会 · 脱口秀 T3 60min',
    meta: '匹配 94% · 最近生成', matchTag: '高匹配', note: '',
    price: '¥6,000', color: 'var(--color-primary)',
  },
  {
    id: 'magic-estate', name: 'XX地产开盘 · 魔术喜剧 T4 45min',
    meta: '匹配 87% · 可调整艺人级别', matchTag: '可调整', note: '',
    price: '¥3,800', color: 'var(--color-warning)',
  },
  {
    id: 'improv-bank', name: '某银行答谢 · 即兴喜剧 60min',
    meta: '匹配 82% · 需确认人数', matchTag: '待补信息', note: '',
    price: '¥4,500', color: 'var(--color-text-tertiary)',
  },
];

const historyDemands = [
  {
    name: 'XX公司年会 · 脱口秀', meta: '10月20日 · 300人',
    icon: '⏳', statusClass: 'amber', statusLabel: '报价中',
  },
  {
    name: 'XX地产开盘 · 魔术', meta: '等待客户确认方案',
    icon: '◇', statusClass: 'primary', statusLabel: '待确认',
  },
  {
    name: 'XX酒店年会 · 脱口秀', meta: '已完成 · 客户评价 5.0',
    icon: '✓', statusClass: 'green', statusLabel: '已成交',
  },
];

const caseStudies = [
  {
    title: '腾讯年会 · 脱口秀专场',
    desc: 'T2 级艺人 · 300 人 · 60 分钟 · 含互动环节',
    coverIcon: '🎭', coverColor: 'var(--color-primary-subtle)',
    sourceLabel: '自营', sourceClass: 'self', amount: '¥9,000',
  },
  {
    title: '万科开盘暖场 · 即兴喜剧',
    desc: 'T3 级艺人 · 200 人 · 45 分钟',
    coverIcon: '🎪', coverColor: '#fef2f2',
    sourceLabel: '经纪公司', sourceClass: 'third', amount: '¥4,500',
  },
];

const curatedPlans = [
  {
    id: 'talk-flagship', name: '脱口秀旗舰版 90min',
    coverIcon: '🎭', coverColor: 'var(--color-primary-subtle)',
    sourceLabel: '自营', sourceClass: 'self', price: '¥9,000',
  },
  {
    id: 'magic-standard', name: '魔术喜剧 45min',
    coverIcon: '🎩', coverColor: '#fef2f2',
    sourceLabel: '经纪合作', sourceClass: 'third', price: '¥3,800',
  },
  {
    id: 'improv-standard', name: '即兴喜剧 60min',
    coverIcon: '🎪', coverColor: '#fffbeb',
    sourceLabel: '自营', sourceClass: 'self', price: '¥4,500',
  },
  {
    id: 'family-comedy', name: '亲子喜剧 45min',
    coverIcon: '🎨', coverColor: '#ecfdf5',
    sourceLabel: '独立艺人', sourceClass: 'indie', price: '¥3,500',
  },
];

function goSubmit(mode: 'input' | 'paste' | 'voice') {
  uni.setStorageSync('submitEntryMode', mode);
  if (mode === 'input' && inputText.value.trim()) {
    uni.setStorageSync('submitPresetText', inputText.value.trim());
  }
  uni.navigateTo({ url: '/pages/request/submit/index' });
}

function onSend() {
  if (!inputText.value.trim()) return;
  goSubmit('input');
}

function goPaste() { goSubmit('paste'); }

function goVoice() {
  uni.setStorageSync('submitEntryMode', 'voice');
  uni.navigateTo({ url: '/pages/request/submit/index' });
}

function goHistory() { uni.switchTab({ url: '/pages/request/list/index' }); }
function goAllPlans() { uni.switchTab({ url: '/pages/sku/list/index' }); }
function goAllCases() {
  uni.showToast({ title: '案例详情开发中', icon: 'none' });
}
function goCurated() { uni.switchTab({ url: '/pages/sku/list/index' }); }

function onTagSelect(value: string) {
  selectedTag.value = value;
  uni.setStorageSync('skuActivityFilter', value);
  uni.switchTab({ url: '/pages/sku/list/index' });
}

function goPlan(id: string) { uni.navigateTo({ url: `/pages/sku/detail/index?id=${id}` }); }
function goDemandDetail(item: any) { uni.navigateTo({ url: `/pages/request/detail/index` }); }
function goCaseDetail(item: any) {
  uni.showToast({ title: '案例详情开发中', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.discover-page {
  min-height: 100vh;
  background: $color-bg-page;
}
.page-scroll {
  height: 100vh;
  box-sizing: border-box;
}

/* ===== Brand Bar ===== */
.brand-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 0;
}
.brand-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.brand-cube {
  width: 32rpx; height: 32rpx;
  border-radius: 8rpx;
  background: $color-primary;
}
.brand-name {
  font-size: $text-xl; font-weight: 700; color: $color-text-primary;
}
.brand-tagline {
  font-size: $text-xs; color: $color-text-tertiary;
  padding-left: 8rpx; border-left: 2rpx solid $color-border; font-weight: 400;
}
.agent-badge {
  display: flex; align-items: center; gap: 8rpx;
  height: 48rpx; padding: 0 16rpx;
  border-radius: $radius-full; background: $color-primary-subtle;
  color: $color-primary; font-size: $text-sm; font-weight: 600;
}
.agent-dot {
  width: 8rpx; height: 8rpx; border-radius: 50%;
  background: $color-success;
  animation: dot-breathe 2s ease-in-out infinite;
}
@keyframes dot-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ===== Hero ===== */
.hero-section {
  padding: 32rpx 32rpx 0; text-align: center;
}
.hero-ai-hint {
  display: flex; align-items: center; justify-content: center; gap: 8rpx; margin-bottom: 8rpx;
}
.ai-mini-cube {
  width: 28rpx; height: 28rpx; border-radius: 4rpx;
  background: $color-primary; color: #fff;
  font-size: 16rpx; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.hero-ai-text { font-size: $text-sm; color: $color-primary; font-weight: 600; }
.hero-title {
  display: block; font-size: $text-xl; font-weight: 800; line-height: 1.2;
  color: $color-text-primary; margin-bottom: 8rpx;
}
.hero-subtitle {
  display: block; font-size: $text-base; color: $color-text-secondary;
  line-height: 1.5; margin-bottom: 16rpx;
}

/* ===== Input Bar ===== */
.input-bar {
  margin: 0 32rpx; display: flex; align-items: center; gap: 8rpx;
  background: $color-bg-card; border: 2rpx solid $color-primary;
  border-radius: $radius-full; padding: 8rpx; box-shadow: $shadow-sm;
}
.voice-btn {
  width: 60rpx; height: 60rpx; border-radius: 50%;
  background: $color-primary-subtle; border: 2rpx solid $color-primary;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; flex-shrink: 0;
}
.voice-btn:active { opacity: 0.7; }
.input-field {
  flex: 1; height: 60rpx; padding: 0 16rpx;
  background: transparent; border: none; outline: none;
  font-size: $text-base; color: $color-text-primary;
}
.send-btn {
  height: 56rpx; padding: 0 24rpx;
  background: $color-primary; color: $color-text-inverse;
  border-radius: $radius-full;
  font-size: $text-base; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.send-btn:active { opacity: 0.85; }

/* ===== Paste Link ===== */
.paste-link {
  text-align: center; padding: 16rpx 0 8rpx;
  display: flex; align-items: center; justify-content: center; gap: 4rpx;
  font-size: $text-sm; color: $color-primary; font-weight: 600;
}
.paste-arrow { font-size: $text-xs; color: $color-primary-light; }

/* ===== Tag Row ===== */
.tag-row {
  display: flex; gap: 8rpx; padding: 16rpx 32rpx; flex-wrap: wrap;
}
.tag-item {
  padding: 8rpx 24rpx; border-radius: $radius-full;
  font-size: $text-sm; font-weight: 500;
  color: $color-text-secondary; background: $color-bg-input;
}
.tag-item.active {
  background: $color-primary-subtle; color: $color-primary; font-weight: 600;
}
.tag-item:active { opacity: 0.7; }

/* ===== Section Block ===== */
.section-block {
  padding: 24rpx 32rpx 0;
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16rpx;
}
.section-header-left {
  display: flex; align-items: center; gap: 8rpx;
}
.section-icon { font-size: 24rpx; }
.section-title {
  display: block; font-size: $text-lg; font-weight: 800; color: $color-text-primary; line-height: 1.3;
}
.section-meta {
  display: block; font-size: $text-xs; color: $color-text-tertiary; font-weight: 400;
}
.section-arrow {
  font-size: $text-xs; color: $color-text-tertiary; font-weight: 500;
}

/* ===== Plan Card ===== */
.plan-card {
  min-height: 112rpx; padding: 24rpx 24rpx; margin-bottom: 16rpx;
  border-radius: $radius-md; background: $color-bg-card;
  border-left: 6rpx solid $color-primary; box-shadow: $shadow-sm;
  display: flex; align-items: center; justify-content: space-between; gap: 16rpx;
}
.plan-card:active { opacity: 0.85; }
.plan-info { min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
.plan-name { font-size: $text-md; font-weight: 700; color: $color-text-primary; }
.plan-meta { font-size: $text-sm; color: $color-text-secondary; }
.plan-tags { display: flex; gap: 8rpx; flex-wrap: wrap; }
.plan-tag {
  padding: 2rpx 12rpx; border-radius: $radius-full; font-size: $text-xs; font-weight: 600;
}
.plan-tag.primary { background: $color-primary-subtle; color: $color-primary; }
.plan-tag.subtle { background: $color-bg-input; color: $color-text-secondary; }
.plan-price {
  flex-shrink: 0; color: $color-primary;
  font-size: $text-xl; font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

/* ===== History Card ===== */
.history-card {
  display: flex; align-items: center; gap: 12rpx;
  padding: 16rpx 24rpx; margin-bottom: 16rpx;
  border-radius: $radius-md; background: $color-bg-card;
  border: 2rpx solid $color-border;
}
.history-card:active { opacity: 0.8; }
.history-icon {
  width: 40rpx; height: 40rpx; border-radius: 8rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; flex-shrink: 0;
}
.history-icon.primary { background: $color-primary-subtle; color: $color-primary; }
.history-icon.amber { background: #fffbeb; color: #f59e0b; }
.history-icon.green { background: #f0fdf4; color: #16a34a; }
.history-info { flex: 1; min-width: 0; }
.history-name { display: block; font-size: $text-sm; font-weight: 600; color: $color-text-primary; }
.history-meta { display: block; font-size: $text-xs; color: $color-text-tertiary; margin-top: 4rpx; }
.history-status {
  font-size: $text-xs; font-weight: 600; padding: 4rpx 16rpx; border-radius: $radius-full; flex-shrink: 0;
}
.history-status.primary { background: $color-primary-subtle; color: $color-primary; }
.history-status.amber { background: #fffbeb; color: #f59e0b; }
.history-status.green { background: #f0fdf4; color: #16a34a; }
.history-empty {
  padding: 24rpx 0; text-align: center;
}
.history-empty-text { font-size: $text-sm; color: $color-text-tertiary; }

/* ===== Case Card ===== */
.case-card {
  border-radius: $radius-md; background: $color-bg-card;
  border: 2rpx solid $color-border; overflow: hidden; margin-bottom: 16rpx;
}
.case-card:active { opacity: 0.85; }
.case-cover {
  height: 120rpx; display: flex; align-items: center; justify-content: center; font-size: 40rpx;
}
.case-body { padding: 16rpx; }
.case-title { display: block; font-size: $text-md; font-weight: 700; color: $color-text-primary; margin-bottom: 4rpx; }
.case-desc { display: block; font-size: $text-xs; color: $color-text-secondary; line-height: 1.5; margin-bottom: 8rpx; }
.case-footer { display: flex; align-items: center; justify-content: space-between; }
.case-source-tag {
  font-size: $text-xs; font-weight: 600; padding: 2rpx 12rpx; border-radius: $radius-full;
}
.case-source-tag.self { background: $color-primary-subtle; color: $color-primary; }
.case-source-tag.third { background: $color-bg-input; color: $color-text-secondary; }
.case-amount {
  color: $color-primary; font-size: $text-lg; font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

/* ===== Curated Card ===== */
.curated-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx;
}
.curated-card {
  border-radius: $radius-md; background: $color-bg-card;
  border: 2rpx solid $color-border; overflow: hidden;
}
.curated-card:active { opacity: 0.85; }
.curated-cover {
  height: 100rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx;
}
.curated-body { padding: 16rpx; }
.curated-name { display: block; font-size: $text-sm; font-weight: 700; color: $color-text-primary; margin-bottom: 4rpx; }
.curated-tags { margin-bottom: 4rpx; }
.curated-tag {
  display: inline-block; font-size: $text-xs; font-weight: 600; padding: 2rpx 12rpx; border-radius: $radius-full;
}
.curated-tag.self { background: $color-primary-subtle; color: $color-primary; }
.curated-tag.third { background: $color-bg-input; color: $color-text-secondary; }
.curated-tag.indie { background: #ecfdf5; color: $color-success; }
.curated-price {
  color: $color-primary; font-size: $text-md; font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

/* ===== 独立艺人工作台入口 ===== */
.performer-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 24rpx 32rpx 0;
  padding: 24rpx 20rpx;
  background: #ffffff;
  border-left: 6rpx solid $brand-primary;
  border-radius: 16rpx;
  box-shadow: $shadow-sm;
}
.performer-entry:active { opacity: 0.85; }
.performer-entry__icon {
  font-size: 40rpx;
  flex-shrink: 0;
}
.performer-entry__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.performer-entry__title {
  font-size: 28rpx;
  font-weight: 700;
  color: $color-text-primary;
}
.performer-entry__desc {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 4rpx;
}
.performer-entry__arrow {
  font-size: 28rpx;
  color: $color-text-tertiary;
  flex-shrink: 0;
}

.bottom-space { height: 160rpx; }

/* ===== Loading Skeleton ===== */
.loading-skeleton {
  padding: 32rpx;
}
.skeleton-bar {
  background: linear-gradient(90deg, #f0f0f2 25%, #e5e7eb 50%, #f0f0f2 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 8rpx;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Error State ===== */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 64rpx 32rpx;
  text-align: center;
}
.error-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}
.error-title {
  font-size: 40rpx;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: 12rpx;
}
.error-desc {
  font-size: $text-base;
  color: $color-text-secondary;
  margin-bottom: 48rpx;
}
.error-retry-btn {
  padding: 16rpx 48rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: $text-base;
  font-weight: 600;
}
.error-retry-btn:active {
  opacity: 0.8;
}
</style>
