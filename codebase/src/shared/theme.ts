import type { ThemeConfig } from "antd";

// ── V4.7 Design System: Brand Color Tokens ──
export const brandColors = {
  primary: "#5B4FD6",
  primaryHover: "#4A3FC5",
  primaryActive: "#3D33B3",
  primarySubtle: "#F0EEFF",
  success: "#00875A",
  warning: "#B45309",
  danger: "#C53030",
  info: "#2563EB",
  gold: "#D4A017",
  textPrimary: "#1A1D2E",
  textSecondary: "#5B6178",
  textTertiary: "#8B92A8",
  bgPage: "#F7F8FA",
  bgCard: "#FFFFFF",
  border: "#E5E7EF",
};

// ── V4.7 Design System: Pipeline Status → HEX Color Map ──
// Replaces the old Ant Design named-color mapping ("blue", "green", etc.)
// All values use the official V4.7 Design System status tokens.
export const statusColorMap: Record<string, string> = {
  新需求: "#2563EB",        // --color-status-new
  需求确认: "#0891B2",      // --color-status-proposal
  有效商机: "#7C6FF7",      // --color-status-progress
  已报价: "#0891B2",        // --color-status-proposal
  沟通中: "#B45309",        // --color-status-negotiate
  谈判中: "#B45309",        // --color-status-negotiate
  等待客户确认: "#D4A017",  // gold — reserved for scoring stars
  已成交: "#00875A",        // --color-status-won
  已结束: "#64748B",        // --color-status-done
  已丢单: "#C53030",        // --color-status-lost

  // ── V4.7: 方案管理状态 ──
  draft: "#64748B",               // 草稿
  internal_review: "#2563EB",      // 内部审核
  shared: "#7C6FF7",               // 已分享
  viewed: "#0891B2",               // 已查看
  downloaded: "#0EA5E9",           // 已下载
  modified_by_client: "#B45309",   // 客户已修改
  revised: "#D4A017",              // 已修订
  approved: "#00875A",             // 已确认
  converted_to_order: "#00875A",   // 已转订单
  lost: "#C53030",                 // 丢单

  // ── V4.7: Admin / 消息 / Tier / 角色状态 ──
  已过期: "#C53030",
  已发送: "#0891B2",
  已开票: "#00875A",
  开票中: "#2563EB",
  "S · 战略": "#7C6FF7",
  "A · 重点": "#0EA5E9",
  "B · 常规": "#2563EB",
  "C · 长尾": "#64748B",
  需求抽取: "#7C6FF7",
  方案生成: "#0EA5E9",
  话术推荐: "#D4A017",
  邮件生成: "#0891B2",
  超级管理员: "#7C6FF7",
  运营主管: "#0EA5E9",
  销售运营: "#2563EB",
  财务: "#D4A017",
  只读: "#64748B",
  报价: "#7C6FF7",
  系统: "#64748B",
  AI提醒: "#0EA5E9",
  客服: "#B45309",
  经济方案: "#7C6FF7",
  推荐方案: "#0EA5E9",
  升级方案: "#D4A017",
  VIP: "#D4A017",
  好: "#00875A",
  差: "#C53030",
  高: "#00875A",
  中: "#B45309",
  低: "#C53030",
};

// ── V4.7 Design System: Ant Design Theme (Agent / Default) ──
export const agentTheme: ThemeConfig = {
  token: {
    colorPrimary: brandColors.primary,
    colorInfo: brandColors.info,
    colorSuccess: brandColors.success,
    colorWarning: brandColors.warning,
    colorError: brandColors.danger,
    colorTextBase: brandColors.textPrimary,
    colorBgLayout: brandColors.bgPage,
    borderRadius: 8,
    fontFamily:
      '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, "Segoe UI", Roboto, Inter, sans-serif',
    fontSize: 14,
    wireframe: false,
  },
  components: {
    Button: { borderRadius: 8, controlHeight: 40 },
    Card: { borderRadiusLG: 12 },
    Input: { borderRadius: 8, controlHeight: 40 },
    Select: { borderRadius: 8, controlHeight: 40 },
    Tag: { borderRadiusSM: 4 },
    Menu: { itemBorderRadius: 8 },
  },
};

// ── V4.7 Design System: Supplier Workspace Theme ──
// Sales workbench uses light mode (no dark bgLayout).
// Inherits all agentTheme tokens; only overrides what differs.
export const supplierTheme: ThemeConfig = {
  ...agentTheme,
  token: {
    ...agentTheme.token,
    colorBgLayout: "#F7F8FA",  // V4.7: light bg, same as page
    colorPrimary: brandColors.primary,
  },
  components: {
    ...agentTheme.components,
  },
};
