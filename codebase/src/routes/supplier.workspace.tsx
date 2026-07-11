import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  Input,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleFilled,
  EditOutlined,
  FileDoneOutlined,
  RobotFilled,
  SendOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OpportunityCard } from "../shared/components/OpportunityCard";
import { computePriority } from "../shared/utils/opportunityPriority";
import { DashboardCard } from "../shared/components/DashboardCard";
import { RequirementExtractPanel } from "../shared/components/RequirementExtractPanel";
import { SolutionCard } from "../shared/components/SolutionCard";
import { FollowUpTimeline } from "../shared/components/FollowUpTimeline";
import { AIFeedbackBar, FEEDBACK_PRESETS } from "../shared/components/AIFeedbackBar";
import { OpportunityStatusFlow } from "../shared/components/OpportunityStatusFlow";
import { dashboardMetrics, followUps, opportunities, solutions } from "../shared/mock/data";
import type { Opportunity, OpportunityStatus, Solution } from "../shared/types";
import { generateOperatorSolutions, rankByFeedback } from "../shared/mock/ai";
import { yuan } from "../shared/components/formatters";
import { BulbOutlined, MoreOutlined } from "@ant-design/icons";

export const Route = createFileRoute("/supplier/workspace")({
  component: SupplierWorkspace,
});

function SortableOpportunity({
  opportunity,
  active,
  pinned,
  onClick,
  onPin,
}: {
  opportunity: Opportunity;
  active: boolean;
  pinned: boolean;
  onClick: () => void;
  onPin: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: opportunity.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <OpportunityCard
        opportunity={opportunity}
        active={active}
        pinned={pinned}
        onClick={onClick}
        onPin={onPin}
        showPriorityScore
        dragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLSpanElement>}
      />
    </div>
  );
}

const STATUS_FILTERS: (OpportunityStatus | "全部")[] = [
  "全部", "新需求", "有效商机", "已报价", "谈判中", "等待客户确认", "已成交", "已丢单",
];

const STATUS_LABELS: Record<string, string> = {
  全部: "全部",
  新需求: "新线索",
  有效商机: "需求确认",
  已报价: "已报价",
  谈判中: "谈判中",
  等待客户确认: "等待确认",
  已成交: "已成交",
  已丢单: "已丢单",
};

function SupplierWorkspace() {
  const nav = useNavigate();
  const [filter, setFilter] = useState<string>("全部");
  const [activeId, setActiveId] = useState<string>(opportunities[0]!.id);
  const [aiSolutions, setAiSolutions] = useState<Solution[]>(solutions.slice(0, 3));
  const [generating, setGenerating] = useState(false);
  const [nextAction, setNextAction] = useState<string>("发送报价 v2 + 微信语音跟进");
  const [order, setOrder] = useState<string[]>(() => opportunities.map((o) => o.id));
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [feedbackSignals, setFeedbackSignals] = useState(0);
  const [sortMode, setSortMode] = useState<"推荐排序" | "最近更新">("推荐排序");
  const [bottomTab, setBottomTab] = useState<string>("跟进");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const list = useMemo(() => {
    const base = filter === "全部" ? opportunities : opportunities.filter((o) => o.status === filter);
    let ordered: typeof base;
    if (sortMode === "推荐排序") {
      ordered = base.slice().sort((a, b) => computePriority(b).score - computePriority(a).score);
    } else {
      const byId = new Map(base.map((o) => [o.id, o]));
      ordered = order.map((id) => byId.get(id)).filter(Boolean) as typeof base;
      for (const o of base) if (!order.includes(o.id)) ordered.push(o);
    }
    ordered.sort((a, b) => Number(pinned.has(b.id)) - Number(pinned.has(a.id)));
    return ordered;
  }, [filter, order, pinned, sortMode]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const visibleIds = list.map((o) => o.id);
    const oldIdx = visibleIds.indexOf(String(a.id));
    const newIdx = visibleIds.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(visibleIds, oldIdx, newIdx);
    const nonVisible = order.filter((id) => !visibleIds.includes(id));
    setOrder([...reordered, ...nonVisible]);
    setSortMode("最近更新");
    message.info("已切换为手动排序，切回「推荐排序」可恢复自动排序");
  };

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const active = opportunities.find((o) => o.id === activeId) ?? opportunities[0]!;
  const oppFollowUps = followUps.filter((f) => f.opportunityId === active.id);

  useEffect(() => {
    let alive = true;
    setGenerating(true);
    generateOperatorSolutions(active.event.type).then((res) => {
      if (alive) {
        const ranked = rankByFeedback(res);
        setAiSolutions(ranked.list);
        setFeedbackSignals(ranked.signals);
        setGenerating(false);
      }
    });
    return () => { alive = false; };
  }, [active.id, active.event.type]);

  return (
    <div style={{ padding: "var(--yl-space-5) var(--yl-space-5) var(--yl-space-10)" }}>
      {/* 顶部数据概览 */}
      <Row gutter={16}>
        {dashboardMetrics.map((m) => {
          const subLabels: Record<string, string> = {
            "今日新增商机": "今日待处理",
            "待跟进商机": "待跟进",
            "本月已报价": "高意向",
            "本月成交额": "本月GMV",
          };
          return (
            <Col key={m.label} xs={12} md={6}>
              <DashboardCard metric={m} subLabel={subLabels[m.label]} />
            </Col>
          );
        })}
      </Row>

      {/* 四栏工作区 */}
      <Row gutter={16} style={{ marginTop: "var(--yl-space-4)" }}>
        {/* 左：商机队列 */}
        <Col xs={24} lg={6}>
          <Card
            style={{ borderRadius: 12, height: "calc(100vh - 260px)", minHeight: 620, display: "flex", flexDirection: "column" }}
            styles={{ body: { padding: 0, display: "flex", flexDirection: "column", height: "100%" } }}
            title={
              <Space style={{ justifyContent: "space-between", width: "100%", display: "flex" }}>
                <Typography.Text strong>商机队列</Typography.Text>
                <Space size={6}>
                  <Segmented
                    size="small"
                    value={sortMode}
                    onChange={(v) => setSortMode(v as "推荐排序" | "最近更新")}
                    options={["推荐排序", "最近更新"]}
                  />
                  <Tag color="purple" style={{ borderRadius: 4 }}>{list.length}</Tag>
                </Space>
              </Space>
            }
          >
            <div style={{ padding: "var(--yl-space-2) var(--yl-space-3)", borderBottom: "1px solid var(--yl-border-subtle)" }}>
              <Select
                value={filter}
                onChange={setFilter}
                style={{ width: "100%" }}
                options={STATUS_FILTERS.map((s) => ({ value: s, label: STATUS_LABELS[s] ?? s }))}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "var(--yl-space-3)", display: "flex", flexDirection: "column", gap: "var(--yl-space-2)" }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={list.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                  {list.map((o) => (
                    <SortableOpportunity
                      key={o.id}
                      opportunity={o}
                      active={o.id === activeId}
                      pinned={pinned.has(o.id)}
                      onClick={() => setActiveId(o.id)}
                      onPin={() => togglePin(o.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </Card>
        </Col>

        {/* 中：客户需求详情 */}
        <Col xs={24} lg={9}>
          <Card
            style={{ borderRadius: 12, minHeight: 620 }}
            styles={{ body: { padding: "var(--yl-space-4)" } }}
            title={
              <Space size={12}>
                <Avatar size={36} style={{ background: active.customer.avatarColor }}>
                  {active.customer.companyName.slice(0, 1)}
                </Avatar>
                <div>
                  <div style={{ fontSize: "var(--yl-font-heading-3)", fontWeight: 700, color: "var(--yl-text-primary)" }}>{active.customer.companyName}</div>
                  <div style={{ fontSize: "var(--yl-font-caption)", color: "var(--yl-text-tertiary)" }}>
                    {active.customer.contactName} · {active.customer.contactTitle} · {active.customer.phone}
                  </div>
                </div>
              </Space>
            }
            extra={<Tag color="purple">{active.code}</Tag>}
          >
            <Alert
              type="info"
              icon={<RobotFilled />}
              showIcon
              message={<span style={{ fontWeight: 600 }}>客户原始需求</span>}
              description={active.rawRequirement}
              style={{ marginBottom: "var(--yl-space-4)", background: "var(--yl-bg-ai)", borderColor: "var(--yl-border-ai)" }}
            />

            <Descriptions column={2} size="small" bordered styles={{ label: { width: 110 } }}>
              <Descriptions.Item label="活动类型">{active.event.type} · {active.event.scene}</Descriptions.Item>
              <Descriptions.Item label="活动日期">{active.event.date}</Descriptions.Item>
              <Descriptions.Item label="场地">{active.event.location}</Descriptions.Item>
              <Descriptions.Item label="人数">{active.event.headcount} 人</Descriptions.Item>
              <Descriptions.Item label="预算">{yuan(active.event.budget)}</Descriptions.Item>
              <Descriptions.Item label="时长">{active.event.durationMinutes} 分钟</Descriptions.Item>
            </Descriptions>

            <Divider />

            <RequirementExtractPanel opportunity={active} />

            <Divider />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--yl-space-2)" }}>
              <Typography.Text strong style={{ fontSize: "var(--yl-font-body-sm)" }}>AI 识别反馈</Typography.Text>
            </div>
            <AIFeedbackBar
              compact
              kind="需求识别"
              opportunityId={active.id}
              dimensions={FEEDBACK_PRESETS["需求识别"].slice()}
            />

            <Divider />
            <OpportunityStatusFlow opportunityId={active.id} current={active.status} />
          </Card>
        </Col>

        {/* 右：AI 方案 A/B/C */}
        <Col xs={24} lg={9}>
          <Card
            style={{ borderRadius: 12, minHeight: 620, display: "flex", flexDirection: "column" }}
            styles={{ body: { padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 260px)" } }}
            title={
              <Space>
                <ThunderboltFilled style={{ color: "var(--yl-primary)" }} />
                <Typography.Text strong>AI 方案生成</Typography.Text>
                {generating && <Tag color="processing">AI 生成中</Tag>}
                {!generating && feedbackSignals > 0 && (
                  <Tag color="gold" icon={<BulbOutlined />}>已按团队 {feedbackSignals} 条反馈调整排序</Tag>
                )}
              </Space>
            }
            extra={
              <Button
                size="small"
                onClick={() => {
                  setGenerating(true);
                  generateOperatorSolutions(active.event.type).then((res) => {
                    const ranked = rankByFeedback(res);
                    setAiSolutions(ranked.list);
                    setFeedbackSignals(ranked.signals);
                    setGenerating(false);
                    message.success("已重新生成 3 套方案");
                  });
                }}
              >
                重新生成
              </Button>
            }
          >
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              {aiSolutions.map((s, i) => (
                <div key={`${s.id}-${i}`} className="yl-animate-card-enter" style={{ animationDelay: `${i * 50}ms` }}>
                  <SolutionCard
                    solution={s}
                    highlight={s.tier === "推荐方案"}
                    showCost
                    onGetQuote={() => {
                      message.success(`已按「${s.tier}」为 ${active.customer.companyName} 生成正式报价`);
                      nav({ to: "/supplier/quotations/$id", params: { id: "q1" } });
                    }}
                    onView={() => message.info(`已展开「${s.name}」详情`)}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Dropdown
                      menu={{
                        items: [
                          { key: "1", label: <AIFeedbackBar compact kind="方案推荐" opportunityId={active.id} dimensions={FEEDBACK_PRESETS["方案推荐"].slice()} /> },
                          { key: "2", label: <AIFeedbackBar compact kind="报价" opportunityId={active.id} dimensions={FEEDBACK_PRESETS["报价"].slice()} /> },
                          { key: "3", label: <AIFeedbackBar compact kind="艺人推荐" opportunityId={active.id} dimensions={FEEDBACK_PRESETS["艺人推荐"].slice()} /> },
                        ],
                      }}
                    >
                      <Button size="small" type="text" icon={<MoreOutlined />}>AI 反馈</Button>
                    </Dropdown>
                  </div>
                </div>
              ))}

              <Card
                size="small"
                title={<Typography.Text strong>快速调整</Typography.Text>}
                style={{ background: "var(--yl-bg-page)" }}
                extra={
                  <Dropdown menu={{ items: [
                    { key: "1", label: "调整艺人" },
                    { key: "2", label: "加时 15 分钟" },
                    { key: "3", label: "降价 10%" },
                    { key: "4", label: `按预算 ${yuan(active.event.budget)} 卡价` },
                  ]}}>
                    <Button size="small" type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                }
              >
                <Typography.Text type="secondary" style={{ fontSize: "var(--yl-font-caption)" }}>
                  点击右侧菜单快速调整方案参数
                </Typography.Text>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 底部：跟进 / AI话术 / 行动（切换式） */}
      <Card
        style={{ borderRadius: 12, marginTop: "var(--yl-space-4)" }}
        styles={{ body: { padding: "var(--yl-space-4)" } }}
        title={
          <Segmented
            value={bottomTab}
            onChange={(v) => setBottomTab(v as string)}
            options={[
              { label: `跟进时间线 (${oppFollowUps.length})`, value: "跟进" },
              { label: "AI 推荐话术", value: "话术" },
              { label: "下一步行动", value: "行动" },
            ]}
          />
        }
      >
        {bottomTab === "跟进" && (
          <FollowUpTimeline items={oppFollowUps} />
        )}
        {bottomTab === "话术" && (
          <div>
            <Segmented
              block
              size="small"
              options={["首次触达", "报价跟进", "谈判压价", "催确认"]}
              defaultValue="报价跟进"
              style={{ marginBottom: "var(--yl-space-3)" }}
            />
            <div
              style={{
                padding: "var(--yl-space-3)",
                background: "var(--yl-bg-ai)",
                border: "1px dashed var(--yl-border-ai)",
                borderRadius: "var(--yl-radius-md)",
                fontSize: "var(--yl-font-body-sm)",
                lineHeight: 1.8,
                color: "var(--yl-text-primary)",
              }}
            >
              {`${active.customer.contactName}好，我是演立方${"张运营"}。上次给您发的推荐方案是笑果双喜专场，${active.event.headcount}人年会档期客户满意度 94%。根据您对松弛感的偏好，我这边调整了 v2 版本：把呼兰替换为刘旸教主，控场稳且更贴合调性，总价从 25.8 万降到 18 万，预算内还留出机动。方案 PDF 我这就发您微信，方便的话今天下午 3 点电话确认？`}
            </div>
            <Space style={{ marginTop: 12 }}>
              <Button type="primary" icon={<SendOutlined />}>一键发送微信</Button>
              <Button>复制话术</Button>
            </Space>
          </div>
        )}
        {bottomTab === "行动" && (
          <div>
            <Alert
              type="warning"
              showIcon
              icon={<CheckCircleFilled style={{ color: "var(--yl-warning)" }} />}
              message="AI 建议下一步"
              description={nextAction}
              style={{ marginBottom: 12 }}
            />
            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              <Input
                placeholder="记录一条跟进/行动..."
                onPressEnter={(e) => {
                  setNextAction((e.target as HTMLInputElement).value || nextAction);
                  message.success("已加入待办");
                  (e.target as HTMLInputElement).value = "";
                }}
              />
              <Button block icon={<FileDoneOutlined />} onClick={() => nav({ to: "/supplier/quotations/$id", params: { id: "q1" } })}>
                查看当前报价
              </Button>
              <Button block>标记为已联系</Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
}