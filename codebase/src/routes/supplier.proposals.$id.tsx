import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Input,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import { mockProposals, leads } from "../shared/mock/data";
import type { Proposal, PlanStructureItem, ProposalPerformer } from "../shared/types";
import { ProposalPreview } from "../shared/components/ProposalPreview";
import { DownloadButton } from "../shared/components/DownloadButton";

// ============ 路由定义 ============

interface ProposalSearch {
  from?: string;
  leadId?: string;
}

export const Route = createFileRoute("/supplier/proposals/$id")({
  component: ProposalEditPage,
  notFoundComponent: () => (
    <div style={{ padding: 48, textAlign: "center", color: "#8B92A8" }}>
      方案不存在
    </div>
  ),
  validateSearch: (search: Record<string, unknown>): ProposalSearch => ({
    from: typeof search.from === "string" ? search.from : undefined,
    leadId: typeof search.leadId === "string" ? search.leadId : undefined,
  }),
});

// ============ 预算选项 ============

const BUDGET_OPTIONS = [
  { value: "1万以下", label: "1万以下" },
  { value: "1-2万", label: "1-2万" },
  { value: "2-5万", label: "2-5万" },
  { value: "5-10万", label: "5-10万" },
  { value: "10-20万", label: "10-20万" },
  { value: "20万以上", label: "20万以上" },
];

// ============ 组件 ============

function ProposalEditPage() {
  const { id } = useParams({ from: "/supplier/proposals/$id" });
  const search = useSearch({ from: "/supplier/proposals/$id" });
  const nav = useNavigate();

  // 尝试从 mockProposals 找到已有方案，或从 leads 预填新方案
  const existing = mockProposals.find((p) => p.id === id);

  // 如果从线索跳转（?from=lead&leadId=xxx），预填客户信息
  const sourceLead =
    search.from === "lead" && search.leadId
      ? leads.find((l) => l.id === search.leadId)
      : undefined;

  const initFromLead = (): Partial<Proposal> => {
    if (!sourceLead) return {};
    return {
      customerName: sourceLead.customer_name ?? sourceLead.company ?? "",
      eventTheme: sourceLead.answers["活动类型"] ?? "",
      headcount: sourceLead.answers["人数"] ? parseInt(sourceLead.answers["人数"]) : undefined,
      budget: sourceLead.answers["预算"] ?? "",
      understanding: sourceLead.ai_result_summary ?? "",
      createdBy: sourceLead.assigned_to,
    };
  };

  const base = existing ?? initFromLead();

  const [proposal, setProposal] = useState<Proposal>({
    id: id,
    code: base.code ?? `YLF-2026-${String(Math.floor(Math.random() * 9000 + 1000))}`,
    customerName: base.customerName ?? "",
    eventTheme: base.eventTheme ?? "",
    eventDate: base.eventDate ?? "",
    headcount: base.headcount ?? undefined,
    budget: base.budget ?? "",
    understanding: base.understanding ?? "",
    planStructure: base.planStructure ?? [{ name: "", duration: "" }],
    price: base.price ?? undefined,
    includes: base.includes ?? [],
    excludes: base.excludes ?? [],
    performers: base.performers ?? [{ name: "", role: "", style: "" }],
    cases: base.cases ?? [],
    consultantName: base.consultantName ?? base.consultant?.name ?? "",
    consultantPhone: base.consultantPhone ?? base.consultant?.phone ?? "",
    serviceNotes: base.serviceNotes ?? "",
    validUntil: base.validUntil ?? "",
    status: base.status ?? "draft",
    createdBy: base.createdBy ?? "",
    createdAt: base.createdAt ?? new Date().toISOString(),
    updatedAt: base.updatedAt ?? new Date().toISOString(),
  });

  const [priceDisplayMode, setPriceDisplayMode] = useState<"full" | "range" | "hidden">("full");

  // ========== 方案结构增删 ==========
  const handlePlanItemChange = (
    idx: number,
    field: keyof PlanStructureItem,
    value: string
  ) => {
    const items = [...(proposal.planStructure ?? [])];
    items[idx] = { ...items[idx], [field]: value };
    setProposal((p) => ({ ...p, planStructure: items }));
  };

  const addPlanItem = () => {
    setProposal((p) => ({
      ...p,
      planStructure: [...(p.planStructure ?? []), { name: "", duration: "" }],
    }));
  };

  const removePlanItem = (idx: number) => {
    const items = proposal.planStructure ?? [];
    if (items.length <= 1) return;
    setProposal((p) => ({
      ...p,
      planStructure: items.filter((_, i) => i !== idx),
    }));
  };

  // ========== 演员增删 ==========
  const handlePerformerChange = (
    idx: number,
    field: keyof ProposalPerformer,
    value: string
  ) => {
    const performers = [...(proposal.performers ?? [])];
    performers[idx] = { ...performers[idx], [field]: value };
    setProposal((p) => ({ ...p, performers }));
  };

  const addPerformer = () => {
    setProposal((p) => ({
      ...p,
      performers: [...(p.performers ?? []), { name: "", role: "", style: "" }],
    }));
  };

  const removePerformer = (idx: number) => {
    const performers = proposal.performers ?? [];
    if (performers.length <= 1) return;
    setProposal((p) => ({
      ...p,
      performers: performers.filter((_, i) => i !== idx),
    }));
  };

  // ========== 保存草稿 ==========
  const handleSave = () => {
    const now = new Date().toISOString();
    setProposal((p) => ({ ...p, updatedAt: now }));
    // TODO: 替换为真实 API 调用
    // await fetch(`/v1/proposals/${id}`, { method: "PATCH", body: JSON.stringify(proposal) });
    message.success("已保存");
  };

  // ========== 生成客户链接 ==========
  const handleGenerateLink = async () => {
    const link = `https://yanlifang.com/p/${proposal.code}?token=xxx`;
    try {
      await navigator.clipboard.writeText(link);
      setProposal((p) => ({ ...p, status: "shared", updatedAt: new Date().toISOString() }));
      message.success("方案链接已复制到剪贴板");
    } catch {
      message.error("复制失败，请手动复制");
    }
  };

  // ========== 预览用数据 ==========
  const previewData = {
    code: proposal.code,
    customerName: proposal.customerName,
    eventTheme: proposal.eventTheme,
    eventDate: proposal.eventDate,
    headcount: proposal.headcount,
    budget: proposal.budget,
    understanding: proposal.understanding,
    planStructure: proposal.planStructure,
    price: proposal.price,
    includes: proposal.includes,
    excludes: proposal.excludes,
    performers: proposal.performers,
    cases: proposal.cases,
    consultantName: proposal.consultantName,
    consultantPhone: proposal.consultantPhone,
    serviceNotes: proposal.serviceNotes,
    validUntil: proposal.validUntil,
    priceDisplayMode,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 56px)",
        overflow: "hidden",
        background: "#F7F8FA",
      }}
    >
      {/* ===== 左栏：编辑区 ===== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 24px 100px",
        }}
      >
        {/* 顶部面包屑 */}
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => nav({ to: "/supplier/proposals" })}
          >
            返回方案列表
          </Button>
          {sourceLead && (
            <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-body-sm)" }}>
              从线索「{sourceLead.customer_name ?? sourceLead.company}」生成
            </Typography.Text>
          )}
        </Space>

        {/* 客户信息 Card */}
        <Card
          title="客户信息"
          size="small"
          style={{ borderRadius: 12, marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Input
              addonBefore="方案编号"
              value={proposal.code}
              disabled
              style={{ fontFamily: "monospace" }}
            />
            <Input
              addonBefore="客户名称"
              value={proposal.customerName}
              onChange={(e) =>
                setProposal((p) => ({ ...p, customerName: e.target.value }))
              }
              placeholder="请输入客户名称"
            />
            <Input
              addonBefore="活动主题"
              value={proposal.eventTheme}
              onChange={(e) =>
                setProposal((p) => ({ ...p, eventTheme: e.target.value }))
              }
              placeholder="请输入活动主题"
            />
            <div style={{ display: "flex", gap: 12 }}>
              <DatePicker
                placeholder="活动日期"
                value={proposal.eventDate ? dayjs(proposal.eventDate) : null}
                onChange={(d) =>
                  setProposal((p) => ({
                    ...p,
                    eventDate: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
                style={{ flex: 1 }}
              />
              <Input
                placeholder="人数"
                type="number"
                value={proposal.headcount ?? ""}
                onChange={(e) =>
                  setProposal((p) => ({
                    ...p,
                    headcount: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                style={{ flex: 1 }}
              />
              <Select
                placeholder="预算范围"
                value={proposal.budget || undefined}
                onChange={(v) =>
                  setProposal((p) => ({ ...p, budget: v }))
                }
                options={BUDGET_OPTIONS}
                style={{ flex: 1 }}
                allowClear
              />
            </div>
          </Space>
        </Card>

        {/* 需求理解 Card */}
        <Card
          title="需求理解"
          size="small"
          style={{ borderRadius: 12, marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Input.TextArea
            value={proposal.understanding}
            onChange={(e) =>
              setProposal((p) => ({ ...p, understanding: e.target.value }))
            }
            rows={4}
            placeholder="请输入对客户需求的理解..."
          />
        </Card>

        {/* 方案配置 Card */}
        <Card
          title="方案配置"
          size="small"
          style={{ borderRadius: 12, marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            {/* 活动结构 */}
            <div>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: 8, fontSize: "var(--yl-text-body-sm)" }}
              >
                活动结构
              </Typography.Text>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {(proposal.planStructure ?? []).map((item, idx) => (
                  <Space key={idx} size={8} style={{ width: "100%" }}>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        handlePlanItemChange(idx, "name", e.target.value)
                      }
                      placeholder="环节名称"
                      style={{ flex: 1 }}
                    />
                    <Input
                      value={item.duration}
                      onChange={(e) =>
                        handlePlanItemChange(idx, "duration", e.target.value)
                      }
                      placeholder="时长"
                      style={{ width: 120 }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={(proposal.planStructure ?? []).length <= 1}
                      onClick={() => removePlanItem(idx)}
                    />
                  </Space>
                ))}
              </Space>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={addPlanItem}
                style={{ marginTop: 8 }}
                block
              >
                添加环节
              </Button>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {/* 价格展示模式 */}
            <div>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: 8, fontSize: "var(--yl-text-body-sm)" }}
              >
                价格展示模式
              </Typography.Text>
              <Select
                value={priceDisplayMode}
                onChange={(v) => setPriceDisplayMode(v as "full" | "range" | "hidden")}
                options={[
                  { value: "full", label: "完整报价" },
                  { value: "range", label: "预算区间" },
                  { value: "hidden", label: "无价格版" },
                ]}
                style={{ width: "100%" }}
              />
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {/* 标准价 */}
            <Input
              addonBefore="标准价"
              type="number"
              value={proposal.price ?? ""}
              onChange={(e) =>
                setProposal((p) => ({
                  ...p,
                  price: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
              prefix="¥"
              placeholder="请输入价格"
            />

            {/* 包含/不包含 */}
            <div style={{ display: "flex", gap: 12 }}>
              <Select
                mode="tags"
                placeholder="包含项目（输入后回车）"
                value={proposal.includes}
                onChange={(v) =>
                  setProposal((p) => ({ ...p, includes: v }))
                }
                style={{ flex: 1 }}
              />
              <Select
                mode="tags"
                placeholder="不包含项目（输入后回车）"
                value={proposal.excludes}
                onChange={(v) =>
                  setProposal((p) => ({ ...p, excludes: v }))
                }
                style={{ flex: 1 }}
              />
            </div>
          </Space>
        </Card>

        {/* 内容团队 Card */}
        <Card
          title="内容团队"
          size="small"
          style={{ borderRadius: 12, marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            {/* 演员 */}
            <div>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: 8, fontSize: "var(--yl-text-body-sm)" }}
              >
                推荐演员
              </Typography.Text>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {(proposal.performers ?? []).map((performer, idx) => (
                  <Space key={idx} size={8} style={{ width: "100%" }}>
                    <Input
                      value={performer.name}
                      onChange={(e) =>
                        handlePerformerChange(idx, "name", e.target.value)
                      }
                      placeholder="演员姓名"
                      style={{ flex: 1 }}
                    />
                    <Input
                      value={performer.role}
                      onChange={(e) =>
                        handlePerformerChange(idx, "role", e.target.value)
                      }
                      placeholder="角色"
                      style={{ width: 130 }}
                    />
                    <Input
                      value={performer.style}
                      onChange={(e) =>
                        handlePerformerChange(idx, "style", e.target.value)
                      }
                      placeholder="风格"
                      style={{ width: 130 }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={(proposal.performers ?? []).length <= 1}
                      onClick={() => removePerformer(idx)}
                    />
                  </Space>
                ))}
              </Space>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={addPerformer}
                style={{ marginTop: 8 }}
                block
              >
                添加演员
              </Button>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            {/* 案例 */}
            <div>
              <Typography.Text
                strong
                style={{ display: "block", marginBottom: 8, fontSize: "var(--yl-text-body-sm)" }}
              >
                案例参考
              </Typography.Text>
              <Select
                mode="multiple"
                placeholder="选择类似案例"
                value={proposal.cases?.map((c) => c.company)}
                onChange={(selected) => {
                  const existingCases = proposal.cases ?? [];
                  const newCases = selected
                    .map((company) => existingCases.find((c) => c.company === company))
                    .filter((c): c is NonNullable<typeof c> => c != null);
                  // 保留新选的案例（mock模式下不创建新案例，仅保留已选）
                  setProposal((p) => ({
                    ...p,
                    cases: newCases.length > 0 ? newCases : [],
                  }));
                }}
                style={{ width: "100%" }}
                options={[
                  { value: "XX保险公司", label: "XX保险公司 - 300人客户答谢会" },
                  { value: "XX科技公司", label: "XX科技公司 - 年会" },
                  { value: "XX银行", label: "XX银行 - VIP答谢" },
                ]}
              />
            </div>
          </Space>
        </Card>

        {/* 服务与顾问 Card */}
        <Card
          title="服务与顾问"
          size="small"
          style={{ borderRadius: 12, marginBottom: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Input.TextArea
              value={proposal.serviceNotes}
              onChange={(e) =>
                setProposal((p) => ({ ...p, serviceNotes: e.target.value }))
              }
              rows={3}
              placeholder="填写服务说明或备注..."
            />
            <div style={{ display: "flex", gap: 12 }}>
              <Input
                placeholder="顾问姓名"
                value={proposal.consultantName}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, consultantName: e.target.value }))
                }
                style={{ flex: 1 }}
              />
              <Input
                placeholder="联系电话"
                value={proposal.consultantPhone}
                onChange={(e) =>
                  setProposal((p) => ({
                    ...p,
                    consultantPhone: e.target.value,
                  }))
                }
                style={{ flex: 1 }}
              />
              <DatePicker
                placeholder="有效期至"
                value={proposal.validUntil ? dayjs(proposal.validUntil) : null}
                onChange={(d) =>
                  setProposal((p) => ({
                    ...p,
                    validUntil: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
                style={{ flex: 1 }}
              />
            </div>
          </Space>
        </Card>
      </div>

      {/* ===== 右栏：预览区 ===== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          backgroundColor: "#F7F8FA",
          borderLeft: "1px solid #E5E7EF",
        }}
      >
        <ProposalPreview proposal={previewData} />
      </div>

      {/* ===== 底部操作栏 ===== */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E5E7EF",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          zIndex: 100,
        }}
      >
        <Button icon={<SaveOutlined />} onClick={handleSave}>
          保存草稿
        </Button>
        <DownloadButton proposalCode={proposal.code} variant="sales" />
        <Button
          type="primary"
          icon={<LinkOutlined />}
          onClick={handleGenerateLink}
          style={{ borderRadius: 8, height: 40 }}
        >
          生成客户链接
        </Button>
      </div>
    </div>
  );
}
