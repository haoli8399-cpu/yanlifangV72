import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import {
  DownloadOutlined,
  MessageOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  StarFilled,
  CustomerServiceOutlined,
  PushpinOutlined,
  FileDoneOutlined,
  PhoneOutlined,
  CopyOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { Proposal } from "../../shared/types";
import { mockProposal, mockProposals } from "../../shared/mock/data";
import { DownloadButton } from "../../shared/components/DownloadButton";

// ============ 数据获取（Mock 模拟 Token 验证） ============

function isValidProposalId(id: string): boolean {
  // 接受两种格式：prop-xxx 和 YLF-2026-xxxx
  return /^(prop-\d+|YLF-\d{4}-\d{4})$/.test(id);
}

function isTokenExpired(_proposalId: string): boolean {
  // Mock：模拟过期判断 —— 2026-07-17 之后的日期视为过期
  // 实际应从 token 参数解析
  return false; // 改为 true 可测试过期态
}

function getProposal(id: string): Proposal {
  return mockProposals.find((p) => p.id === id) ?? mockProposal;
}

// ============ 异常状态：方案不存在 ============

function NotFoundState() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F7F8FA" }}
    >
      <div
        className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-10"
        style={{
          boxShadow: "0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04)",
          borderRadius: 12,
        }}
      >
        <FileTextOutlined style={{ fontSize: "var(--yl-space-12)", color: "var(--yl-text-tertiary)" }} />
        <h2
          className="m-0 text-lg font-semibold"
          style={{ color: "#1A1D2E" }}
        >
          📋 方案未找到
        </h2>
        <p className="m-0 text-sm leading-relaxed" style={{ color: "#5B6178" }}>
          该方案链接无效或已被删除
        </p>
        <a
          href="/m"
          className="inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white no-underline"
          style={{ backgroundColor: "#5B4FD6", borderRadius: 8 }}
        >
          回到首页
        </a>
      </div>
    </div>
  );
}

// ============ 异常状态：Token 过期 ============

function ExpiredState() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F7F8FA" }}
    >
      <div
        className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-10"
        style={{
          boxShadow: "0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04)",
          borderRadius: 12,
        }}
      >
        <ClockCircleOutlined style={{ fontSize: "var(--yl-space-12)", color: "var(--yl-gold)" }} />
        <h2
          className="m-0 text-lg font-semibold"
          style={{ color: "#1A1D2E" }}
        >
          ⏰ 方案已过期
        </h2>
        <p className="m-0 text-sm leading-relaxed" style={{ color: "#5B6178" }}>
          该方案的查看有效期已过
        </p>
        <p className="m-0 text-sm leading-relaxed" style={{ color: "#5B6178" }}>
          请联系活动顾问获取最新方案
        </p>
        <Button
          type="primary"
          icon={<MessageOutlined />}
          style={{ borderRadius: 8 }}
        >
          联系顾问
        </Button>
      </div>
    </div>
  );
}

// ============ 主页面 ============

function ProposalPage({ proposal }: { proposal: Proposal }) {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [optimizeText, setOptimizeText] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const formatPrice = (p: number) =>
    `¥${p.toLocaleString("zh-CN")}`;

  // 下载 → 留资弹窗
  const handleDownload = () => setLeadModalOpen(true);

  const handleLeadSubmit = () => {
    if (!phone || phone.length < 11) {
      message.warning("请输入正确的手机号");
      return;
    }
    message.success("方案已发送给活动顾问，顾问将为你准备下载版本并联系你");
    setLeadModalOpen(false);
    setPhone("");
  };

  // 联系顾问
  const handleContact = () => setContactModalOpen(true);

  const handleCopyText = async () => {
    const text = `你好，我是${proposal.customerName}的，收到了${proposal.eventTheme}方案，想进一步了解`;
    try {
      await navigator.clipboard.writeText(text);
      message.success("咨询文案已复制");
    } catch {
      message.info("请手动复制");
    }
  };

  // 申请优化
  const handleOptimize = () => setOptimizeModalOpen(true);

  const handleOptimizeSubmit = () => {
    if (!optimizeText.trim()) {
      message.warning("请描述你想调整的部分");
      return;
    }
    message.success("活动顾问将在24小时内联系你");
    setOptimizeModalOpen(false);
    setOptimizeText("");
  };

  // 确认意向
  const handleConfirm = () => setConfirmModalOpen(true);

  const handleConfirmSubmit = () => {
    setConfirmLoading(true);
    // Mock API
    setTimeout(() => {
      setConfirmLoading(false);
      message.success("活动顾问将尽快与你联系确认合同细节");
      setConfirmModalOpen(false);
    }, 800);
  };

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: "#F7F8FA", paddingBottom: 100 }}
    >
      {/* ===== Block 1：封面 ===== */}
      <CoverBlock proposal={proposal} onDownload={handleDownload} onContact={handleContact} />

      {/* ===== Block 1.5：封面与正文过渡 ===== */}
      <ProposalBridge proposal={proposal} />

      {/* ===== Block 2：需求理解 ===== */}
      <CardBlock
        icon={<FileTextOutlined style={{ fontSize: "var(--yl-space-4)", color: "var(--yl-primary)" }} />}
        title="我们对需求的理解"
        tag="需求分析"
      >
        <p
          className="m-0"
          style={{ font: "var(--yl-text-body-lg)", color: "var(--yl-text-primary)", lineHeight: 1.7 }}
        >
          {proposal.understanding}
        </p>
      </CardBlock>

      {/* ===== Block 3：推荐方案 ===== */}
      <CardBlock
        icon={<StarFilled style={{ fontSize: "var(--yl-space-4)", color: "var(--yl-gold)" }} />}
        title={`推荐方案：脱口秀年会专场`}
        tag="核心方案"
      >
        <div className="flex flex-col gap-5">
          <div>
            <div style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-text-secondary)", marginBottom: "var(--yl-space-3)" }}>
              活动结构
            </div>
            <div className="relative flex flex-col gap-3">
              {(proposal.planStructure ?? []).map((item, idx) => (
                <div key={idx} className="relative flex items-center gap-3 pl-5">
                  {idx < (proposal.planStructure ?? []).length - 1 && (
                    <div
                      className="absolute left-[5px] top-4 h-full w-px"
                      style={{ backgroundColor: "var(--yl-border-default)" }}
                    />
                  )}
                  <div
                    className="absolute left-0 top-[6px] h-2.5 w-2.5 rounded-full border-2"
                    style={{
                      backgroundColor: idx === 0 ? "var(--yl-primary)" : "var(--yl-bg-surface)",
                      borderColor: "var(--yl-primary)",
                    }}
                  />
                  <span
                    className="flex-1"
                    style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-primary)" }}
                  >
                    {item.name}
                    {item.detail ? `（${item.detail}）` : ""}
                  </span>
                  <span
                    className="shrink-0"
                    style={{
                      font: "var(--yl-text-body-md)",
                      color: "var(--yl-text-tertiary)",
                      fontFamily: "var(--yl-font-mono)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: "var(--yl-bg-page)", borderRadius: "var(--yl-radius-lg)", padding: "var(--yl-space-4)", border: "1px solid var(--yl-border-subtle)" }}>
            <div style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-text-secondary)", marginBottom: "var(--yl-space-3)" }}>
              预算说明
            </div>
            <div style={{ font: "var(--yl-text-numeric-md)", fontWeight: 700, color: "var(--yl-text-primary)", fontFamily: "var(--yl-font-mono)", fontVariantNumeric: "tabular-nums", marginBottom: "var(--yl-space-1)" }}>
              {formatPrice(proposal.price ?? 0)}
              <span style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", fontWeight: 400, marginLeft: "var(--yl-space-2)" }}>
                标准价
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span style={{ font: "var(--yl-text-body-md)", color: "var(--yl-success)", lineHeight: "22px" }}>✓</span>
                <span style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-primary)", lineHeight: 1.5 }}>
                  包含：{(proposal.includes ?? []).slice(0, 3).join("、")}{((proposal.includes?.length ?? 0) > 3) ? ` 等${(proposal.includes?.length ?? 0)}项` : ""}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-tertiary)", lineHeight: "22px" }}>○</span>
                <span style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-secondary)", lineHeight: 1.5 }}>
                  不含：{(proposal.excludes ?? []).join("、")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBlock>

      {/* ===== Block 4：内容团队 ===== */}
      <CardBlock
        icon={<CustomerServiceOutlined style={{ fontSize: "var(--yl-space-4)", color: "var(--yl-primary)" }} />}
        title="推荐内容团队"
        tag="团队配置"
      >
        <div className="flex flex-col gap-4">
          {(proposal.performers ?? []).map((performer, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-lg p-4"
              style={{
                backgroundColor: "var(--yl-bg-page)",
                borderRadius: "var(--yl-radius-lg)",
                border: "1px solid var(--yl-border-subtle)",
              }}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: "var(--yl-primary)",
                  font: "var(--yl-text-heading-3)",
                }}
              >
                {performer.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ font: "var(--yl-text-heading-3)", color: "var(--yl-text-primary)" }}
                  >
                    {performer.name}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: "var(--yl-primary-subtle)",
                      color: "var(--yl-primary)",
                      borderRadius: "var(--yl-radius-sm)",
                      font: "var(--yl-text-caption-xs)",
                      fontWeight: 500,
                    }}
                  >
                    {performer.role}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: "var(--yl-bg-sunken)",
                      color: "var(--yl-text-tertiary)",
                      borderRadius: "var(--yl-radius-sm)",
                      font: "var(--yl-text-caption-xs)",
                    }}
                  >
                    推荐
                  </span>
                </div>
                <div
                  className="mt-1"
                  style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)" }}
                >
                  {performer.style}
                </div>
                <div
                  className="mt-2"
                  style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-tertiary)", fontStyle: "italic", lineHeight: 1.5 }}
                >
                  "{performer.bio}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBlock>

      {/* ===== Block 5：案例参考 ===== */}
      <CardBlock
        icon={<PushpinOutlined style={{ fontSize: "var(--yl-space-4)", color: "var(--yl-primary)" }} />}
        title="类似活动案例"
        tag="成功案例"
      >
        <div className="flex flex-col gap-4">
          {(proposal.cases ?? []).map((c, idx) => (
            <div
              key={idx}
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--yl-bg-page)",
                borderRadius: "var(--yl-radius-lg)",
                border: "1px solid var(--yl-border-subtle)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--yl-secondary)", borderRadius: "var(--yl-radius-md)" }}
                >
                  🏢
                </div>
                <div>
                  <span
                    className="text-sm font-semibold"
                    style={{ font: "var(--yl-text-heading-3)", color: "var(--yl-text-primary)" }}
                  >
                    {c.company}
                  </span>
                  <span
                    style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-tertiary)", marginLeft: "var(--yl-space-2)" }}
                  >
                    {c.event}
                  </span>
                </div>
              </div>
              <div
                style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-secondary)", marginBottom: "var(--yl-space-2)" }}
              >
                {c.content}
              </div>
              <div
                style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-tertiary)", fontStyle: "italic", lineHeight: 1.5, marginBottom: "var(--yl-space-3)" }}
              >
                "{c.feedback}"
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="rounded px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--yl-success-bg)",
                    color: "var(--yl-success)",
                    borderRadius: "var(--yl-radius-sm)",
                    font: "var(--yl-text-caption)",
                  }}
                >
                  客户满意度：{c.satisfaction}
                </span>
                <span style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                  已交付
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBlock>

      {/* ===== Block 6：服务说明 ===== */}
      <CardBlock
        icon={<FileDoneOutlined style={{ fontSize: "var(--yl-space-4)", color: "var(--yl-success)" }} />}
        title="服务说明"
        tag="交付范围"
      >
        <div className="flex flex-col gap-5">
          <div style={{ background: "var(--yl-success-bg)", borderRadius: "var(--yl-radius-md)", padding: "var(--yl-space-4)", border: "1px solid var(--yl-success-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-2)", marginBottom: "var(--yl-space-3)" }}>
              <span style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-success)" }}>✓</span>
              <div style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-success)", fontWeight: 600 }}>包含服务</div>
            </div>
            <div className="flex flex-col gap-2">
              {(proposal.includes ?? []).map((item, idx) => (
                <div
                  key={idx}
                  style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-primary)", paddingLeft: "var(--yl-space-5)", position: "relative" }}
                >
                  <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--yl-success)" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--yl-bg-page)", borderRadius: "var(--yl-radius-md)", padding: "var(--yl-space-4)", border: "1px solid var(--yl-border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-2)", marginBottom: "var(--yl-space-3)" }}>
              <span style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-text-tertiary)" }}>○</span>
              <div style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-text-secondary)", fontWeight: 600 }}>不包含服务</div>
            </div>
            <div className="flex flex-col gap-2">
              {(proposal.excludes ?? []).map((item, idx) => (
                <div
                  key={idx}
                  style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-secondary)", paddingLeft: "var(--yl-space-5)", position: "relative" }}
                >
                  <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--yl-text-tertiary)" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--yl-warning-bg)", borderRadius: "var(--yl-radius-md)", padding: "var(--yl-space-4)", border: "1px solid var(--yl-warning-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-2)", marginBottom: "var(--yl-space-2)" }}>
              <span style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-warning)" }}>⚠️</span>
              <div style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-warning)", fontWeight: 600 }}>重要说明</div>
            </div>
            <div style={{ font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)", lineHeight: 1.6 }}>
              以上报价为标准方案报价，实际费用可能因活动规模、时间安排及特殊需求而有所调整，最终以活动顾问确认的正式报价单为准。
            </div>
            <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", marginTop: "var(--yl-space-2)" }}>
              方案有效期至 {proposal.validUntil}
            </div>
          </div>
        </div>
      </CardBlock>

      {/* ===== Block 7：底部固定 CTA ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 bg-white px-4 py-3"
        style={{
          borderTop: "1px solid var(--yl-border-subtle)",
          boxShadow: "0 -4px 12px rgba(26,29,46,0.06)",
          padding: "var(--yl-space-3) var(--yl-space-4)",
        }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <DownloadButton proposalCode={proposal.code || proposal.id} variant="client" />
          <button
            onClick={handleContact}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-none px-3 py-2.5 text-sm font-semibold text-white"
            style={{
              backgroundColor: "var(--yl-primary)",
              borderRadius: "var(--yl-radius-md)",
              font: "var(--yl-text-body-sm)",
              fontWeight: 600,
            }}
          >
            <MessageOutlined />
            联系顾问
          </button>
          <button
            onClick={handleOptimize}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-white px-3 py-2.5 text-sm font-semibold"
            style={{
              borderColor: "var(--yl-border-default)",
              borderRadius: "var(--yl-radius-md)",
              color: "var(--yl-text-primary)",
              font: "var(--yl-text-body-sm)",
              fontWeight: 500,
            }}
          >
            <EditOutlined />
            申请优化
          </button>
          <button
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-white px-3 py-2.5 text-sm font-semibold"
            style={{
              borderColor: "var(--yl-success)",
              borderRadius: "var(--yl-radius-md)",
              color: "var(--yl-success)",
              font: "var(--yl-text-body-sm)",
              fontWeight: 600,
            }}
          >
            <CheckCircleOutlined />
            确认意向
          </button>
        </div>
        <div
          className="mt-2 text-center select-none"
          style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)" }}
        >
          Powered by 演立方
        </div>
      </div>

      {/* ============ 弹窗 ============ */}

      {/* 下载 → 留资弹窗 */}
      <Modal
        title="下载方案"
        open={leadModalOpen}
        onOk={handleLeadSubmit}
        onCancel={() => { setLeadModalOpen(false); setPhone(""); }}
        okText="提交并下载"
        cancelText="取消"
        centered
        closeIcon={<CloseOutlined />}
        okButtonProps={{ style: { borderRadius: 8, backgroundColor: "#5B4FD6" } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <p className="text-sm" style={{ color: "#5B6178", marginBottom: 16 }}>
          请留下手机号，顾问将为你准备专属下载版本
        </p>
        <Input
          placeholder="请输入手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          size="large"
          style={{ borderRadius: 8 }}
          maxLength={11}
          prefix={<PhoneOutlined style={{ color: "#8B92A8" }} />}
        />
      </Modal>

      {/* 联系顾问弹窗 */}
      <Modal
        title="活动顾问"
        open={contactModalOpen}
        onCancel={() => setContactModalOpen(false)}
        footer={null}
        centered
        closeIcon={<CloseOutlined />}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: "#5B4FD6" }}
          >
            {proposal.consultant?.name?.[0]}
          </div>
          <div className="text-center">
            <div className="text-base font-semibold" style={{ color: "#1A1D2E" }}>
              {proposal.consultant?.name}
            </div>
            <div className="text-sm" style={{ color: "var(--yl-text-secondary)", marginTop: "var(--yl-space-1)" }}>
              <PhoneOutlined className="mr-1" />
              <a
                href={`tel:${proposal.consultant?.phone}`}
                style={{ color: "var(--yl-primary)", textDecoration: "none" }}
              >
                {proposal.consultant?.phone}
              </a>
            </div>
          </div>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopyText}
            style={{ borderRadius: 8 }}
            block
          >
            复制咨询文案
          </Button>
        </div>
      </Modal>

      {/* 申请优化弹窗 */}
      <Modal
        title="申请方案优化"
        open={optimizeModalOpen}
        onOk={handleOptimizeSubmit}
        onCancel={() => { setOptimizeModalOpen(false); setOptimizeText(""); }}
        okText="提交"
        cancelText="取消"
        centered
        closeIcon={<CloseOutlined />}
        okButtonProps={{ style: { borderRadius: 8, backgroundColor: "#5B4FD6" } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <p className="text-sm" style={{ color: "#5B6178", marginBottom: 12 }}>
          请描述你想调整的部分（如预算、人数、内容类型等）
        </p>
        <Input.TextArea
          placeholder="例如：希望增加一个互动游戏环节，预算可以适当增加"
          value={optimizeText}
          onChange={(e) => setOptimizeText(e.target.value)}
          rows={4}
          style={{ borderRadius: 8 }}
        />
      </Modal>

      {/* 确认意向弹窗 */}
      <Modal
        title="确认合作意向"
        open={confirmModalOpen}
        onOk={handleConfirmSubmit}
        onCancel={() => setConfirmModalOpen(false)}
        okText="确认"
        cancelText="再想想"
        centered
        closeIcon={<CloseOutlined />}
        confirmLoading={confirmLoading}
        okButtonProps={{ style: { borderRadius: 8, backgroundColor: "#5B4FD6" } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <p className="text-sm" style={{ color: "#1A1D2E", lineHeight: 1.6 }}>
          确认以本方案为基础进入正式合作流程？
        </p>
        <p className="text-xs" style={{ color: "var(--yl-text-tertiary)", marginTop: "var(--yl-space-2)" }}>
          确认后活动顾问将尽快与你联系确认合同细节
        </p>
      </Modal>
    </div>
  );
}

// ============ 封面 Block ============

function CoverBlock({
  proposal,
  onDownload,
  onContact,
}: {
  proposal: Proposal;
  onDownload: () => void;
  onContact: () => void;
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center px-6 pb-10 pt-16 text-white"
      style={{
        background: "linear-gradient(160deg, var(--yl-primary), var(--yl-primary-hover))",
        borderBottomLeftRadius: "var(--yl-radius-xl)",
        borderBottomRightRadius: "var(--yl-radius-xl)",
        minHeight: "65vh",
      }}
    >
      <div
        className="mb-10 rounded-full px-3 py-1 text-xs"
        style={{
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: "var(--yl-radius-full)",
          marginBottom: "var(--yl-space-10)",
          font: "var(--yl-text-caption)",
        }}
      >
        🏷️ 演立方 · 企业活动方案
      </div>

      <h1
        className="mb-6 text-center font-bold leading-tight"
        style={{
          font: "var(--yl-text-display-sm)",
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {proposal.customerName}
        <br />
        {proposal.eventTheme}方案
      </h1>

      <div
        className="flex flex-col items-center gap-2 text-center"
        style={{ opacity: 0.85 }}
      >
        <span style={{ font: "var(--yl-text-body-sm)" }}>专属方案 · 仅供内部使用</span>
        <span style={{ font: "var(--yl-text-body-sm)", fontFamily: "var(--yl-font-mono)" }}>
          方案编号：{proposal.id}
        </span>
        <span
          className="flex items-center gap-1"
          style={{ font: "var(--yl-text-body-sm)", fontFamily: "var(--yl-font-mono)" }}
        >
          <ClockCircleOutlined style={{ fontSize: "var(--yl-space-3)" }} />
          有效期至：{proposal.validUntil}
        </span>
      </div>

      {(proposal.consultant?.name || proposal.consultant?.phone) && (
        <div className="mt-5 text-center" style={{ opacity: 0.75 }}>
          <span style={{ font: "var(--yl-text-body-sm)" }}>活动顾问：{proposal.consultant?.name} {proposal.consultant?.phone}</span>
        </div>
      )}

      <div
        className="mt-8 rounded-full px-4 py-2 text-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.18)",
          font: "var(--yl-text-caption)",
          color: "rgba(255,255,255,0.88)",
          borderRadius: "var(--yl-radius-full)",
        }}
      >
        顾问已为你准备好专属方案 · 下载 / 优化 / 确认请在底部操作区完成
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
        style={{
          borderBottomLeftRadius: "var(--yl-radius-xl)",
          borderBottomRightRadius: "var(--yl-radius-xl)",
          background: "linear-gradient(to bottom, transparent, rgba(247,248,250,0.1))",
        }}
      />
    </div>
  );
}

function ProposalBridge({ proposal }: { proposal: Proposal }) {
  const summaryItems = [
    { label: "活动日期", value: proposal.eventDate || "待确认" },
    { label: "人数规模", value: proposal.headcount ? `${proposal.headcount} 人` : "待确认" },
    { label: "方案预算", value: proposal.price ? `¥${proposal.price.toLocaleString("zh-CN")}` : "待确认" },
  ];

  return (
    <div style={{ padding: "0 var(--yl-space-4)", marginTop: "calc(var(--yl-space-6) * -1)", position: "relative", zIndex: 2 }}>
      <div
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,238,255,0.86))",
          border: "1px solid var(--yl-border-ai)",
          borderRadius: "var(--yl-radius-lg)",
          boxShadow: "var(--yl-shadow-md)",
          padding: "var(--yl-space-4)",
        }}
      >
        <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-primary)", marginBottom: "var(--yl-space-2)" }}>
          方案摘要
        </div>
        <div style={{ font: "var(--yl-text-body-md)", color: "var(--yl-text-secondary)", marginBottom: "var(--yl-space-3)", lineHeight: 1.6 }}>
          这是一份可直接进入内部沟通的初版提案。先看时间、人数和预算是否对齐，再决定是否下载、优化或确认意向。
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--yl-space-3)" }}>
          {summaryItems.map((item) => (
            <div key={item.label} style={{ background: "var(--yl-bg-surface)", border: "1px solid var(--yl-border-subtle)", borderRadius: "var(--yl-radius-md)", padding: "var(--yl-space-3)" }}>
              <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)", marginBottom: "var(--yl-space-1)" }}>{item.label}</div>
              <div style={{ font: "var(--yl-text-heading-4)", color: "var(--yl-text-primary)" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ 通用卡片容器 ============

function CardBlock({
  icon,
  title,
  tag,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mx-4 my-3 rounded-xl bg-white"
      style={{
        margin: "0 var(--yl-space-4) var(--yl-space-3) var(--yl-space-4)",
        padding: "var(--yl-space-5)",
        boxShadow: "var(--yl-shadow-sm)",
        borderRadius: "var(--yl-radius-lg)",
        border: "1px solid var(--yl-border-subtle)",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div style={{ width: 36, height: 36, borderRadius: "var(--yl-radius-md)", backgroundColor: "var(--yl-primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--yl-space-2)", marginBottom: 2 }}>
            <span style={{ font: "var(--yl-text-caption)", color: "var(--yl-primary)", fontWeight: 500 }}>
              提案模块
            </span>
            {tag && (
              <span style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)", backgroundColor: "var(--yl-bg-sunken)", padding: "var(--yl-space-1) var(--yl-space-2)", borderRadius: "var(--yl-radius-sm)" }}>
                {tag}
              </span>
            )}
          </div>
          <h2
            className="m-0 font-semibold"
            style={{ font: "var(--yl-text-heading-2)", color: "var(--yl-text-primary)" }}
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}

// ============ 路由定义 ============

export const Route = createFileRoute("/p/$proposalId")({
  component: ProposalRoute,
});

function ProposalRoute() {
  const { proposalId } = Route.useParams();

  // 异常：方案不存在
  if (!isValidProposalId(proposalId)) {
    return <NotFoundState />;
  }

  // 异常：Token 过期
  if (isTokenExpired(proposalId)) {
    return <ExpiredState />;
  }

  const proposal = getProposal(proposalId);

  return <ProposalPage proposal={proposal} />;
}
