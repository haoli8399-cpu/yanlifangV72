import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  RobotFilled,
  SendOutlined,
  SearchOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  RightOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import { followUps, opportunities } from "../shared/mock/data";
import type { FollowUp } from "../shared/types";
import { StatusTag } from "../shared/components/StatusTag";
import { FollowUpTimeline } from "../shared/components/FollowUpTimeline";
import { relativeTime, wan } from "../shared/components/formatters";
import { computeReminders, severityColor } from "../shared/utils/followupRules";

export const Route = createFileRoute("/supplier/followups")({
  component: FollowUpCenter,
});

type ActorFilter = "全部" | FollowUp["actor"];
const ACTORS: ActorFilter[] = ["全部", "客户", "运营", "AI"];

function FollowUpCenter() {
  const nav = useNavigate();
  const [actor, setActor] = useState<ActorFilter>("全部");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<string>(opportunities[0]!.id);
  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>([]);
  const reminders = useMemo(() => computeReminders(), []);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visibleReminders = reminders.filter((r) => !dismissed.includes(r.id));

  // Group by opportunity, sort by latest follow-up
  const groups = useMemo(() => {
    return opportunities
      .map((o) => {
        const items = followUps
          .filter((f) => f.opportunityId === o.id)
          .filter((f) => actor === "全部" || f.actor === actor)
          .filter((f) => !keyword || `${o.customer.companyName}${f.content}`.includes(keyword))
          .sort((a, b) => (a.time < b.time ? 1 : -1));
        return { opp: o, items };
      })
      .filter((g) => g.items.length > 0)
      .sort((a, b) => (a.items[0]!.time < b.items[0]!.time ? 1 : -1));
  }, [actor, keyword]);

  const activeGroup = groups.find((g) => g.opp.id === selected) ?? groups[0];
  const stats = useMemo(() => {
    const all = followUps;
    return {
      total: all.length,
      pending: opportunities.filter((o) => ["新需求", "有效商机", "已报价", "谈判中"].includes(o.status)).length,
      today: all.filter((f) => Date.now() - new Date(f.time).getTime() < 86400000 * 1.2).length,
      ai: all.filter((f) => f.actor === "AI").length,
    };
  }, []);

  const toggleAll = (allIds: string[], checked: boolean) => {
    setSelectedFollowUps(checked ? Array.from(new Set([...selectedFollowUps, ...allIds])) : selectedFollowUps.filter((id) => !allIds.includes(id)));
  };

  return (
    <div style={{ padding: "var(--yl-space-5)" }}>
      {/* Smart reminders (PRD §9.2.5) */}
      {visibleReminders.length > 0 && (
        <Card
          style={{ borderRadius: "var(--yl-radius-lg)", marginBottom: "var(--yl-space-4)", borderLeft: "3px solid var(--yl-primary)" }}
          styles={{ body: { padding: "var(--yl-space-4)" } }}
          title={
            <Space>
              <ThunderboltFilled style={{ color: "var(--yl-primary)" }} />
              <Typography.Text strong>智能跟进提醒</Typography.Text>
              <Tag color="purple">{visibleReminders.length} 条待处理</Tag>
              <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>
                规则引擎基于报价读回执、客户回复时长、活动日期自动生成
              </Typography.Text>
            </Space>
          }
        >
          <Row gutter={[12, 12]}>
            {visibleReminders.slice(0, 6).map((r) => (
              <Col xs={24} md={12} xl={8} key={r.id}>
                <div
                  style={{
                    border: "1px solid var(--yl-border-subtle)",
                    borderRadius: "var(--yl-radius-md)",
                    padding: "var(--yl-space-3)",
                    background: r.severity === "紧急" ? "#FFF5F5" : r.severity === "重要" ? "#FFF9F0" : "#F5F8FF",
                    height: "100%",
                  }}
                >
                  <Space style={{ marginBottom: 6 }}>
                    <Tag color={severityColor[r.severity]}>{r.severity}</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>{r.rule}</Typography.Text>
                  </Space>
                  <div style={{ fontWeight: 600, fontSize: "var(--yl-text-body-sm)", marginBottom: 4 }}>{r.title}</div>
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)", display: "block", marginBottom: "var(--yl-space-2)" }}>
                    {r.description}
                  </Typography.Text>
                  <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-primary)", marginBottom: 10 }}>
                    <RobotFilled style={{ marginRight: 4 }} />
                    建议：{r.suggestedAction}
                  </div>
                  <Space size={6}>
                    <Button
                      size="small"
                      type="primary"
                      icon={<RightOutlined />}
                      onClick={() => {
                        setSelected(r.opportunityId);
                        if (r.quotationId) nav({ to: "/supplier/quotations/$id", params: { id: r.quotationId } });
                      }}
                    >
                      去处理
                    </Button>
                    <Button size="small" onClick={() => message.success("已发送提醒话术")}>发提醒</Button>
                    <Button size="small" type="text" onClick={() => setDismissed([...dismissed, r.id])}>忽略</Button>
                  </Space>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Top stats */}
      <Row gutter={16} style={{ marginBottom: "var(--yl-space-4)" }}>
        {[
          { label: "累计跟进条数", value: stats.total, tone: "var(--yl-primary)" },
          { label: "待跟进商机", value: stats.pending, tone: "var(--yl-warning)" },
          { label: "近24h跟进", value: stats.today, tone: "var(--yl-info)" },
          { label: "AI 自动跟进", value: stats.ai, tone: "var(--yl-success)" },
        ].map((m) => (
          <Col xs={12} md={6} key={m.label}>
            <Card styles={{ body: { padding: "var(--yl-space-4)" } }} style={{ borderRadius: "var(--yl-radius-lg)" }}>
              <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-body-sm)" }}>{m.label}</Typography.Text>
              <div style={{ fontSize: "var(--yl-text-display-md)", fontWeight: 700, color: m.tone, marginTop: 4 }}>{m.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        {/* Left: opportunity groups */}
        <Col xs={24} lg={9}>
          <Card
            style={{ borderRadius: "var(--yl-radius-lg)" }}
            styles={{ body: { padding: 0 } }}
            title={
              <Space style={{ width: "100%", justifyContent: "space-between", display: "flex" }}>
                <Typography.Text strong>跟进列表</Typography.Text>
                <Tag color="purple">{groups.length}</Tag>
              </Space>
            }
          >
            <div style={{ padding: "var(--yl-space-3)", borderBottom: "1px solid var(--yl-border-subtle)" }}>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="搜索客户 / 内容"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <Segmented block size="small" options={ACTORS} value={actor} onChange={(v) => setActor(v as ActorFilter)} />
              </Space>
            </div>
            <div style={{ maxHeight: 640, overflowY: "auto" }}>
              {groups.map((g) => {
                const last = g.items[0]!;
                const active = g.opp.id === activeGroup?.opp.id;
                return (
                  <div
                    key={g.opp.id}
                    onClick={() => setSelected(g.opp.id)}
                    style={{
                      padding: 14,
                      borderBottom: "1px solid var(--yl-border-subtle)",
                      cursor: "pointer",
                      background: active ? "var(--yl-primary-subtle)" : "#fff",
                      borderLeft: active ? "3px solid var(--yl-primary)" : "3px solid transparent",
                    }}
                  >
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space size={10}>
                        <Avatar size={30} style={{ background: g.opp.customer.avatarColor, fontSize: "var(--yl-text-caption)" }}>
                          {g.opp.customer.companyName.slice(0, 1)}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{g.opp.customer.companyName}</div>
                          <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                            {g.opp.event.type} · {wan(g.opp.event.budget)}
                          </div>
                        </div>
                      </Space>
                      <StatusTag status={g.opp.status} />
                    </Space>
                    <div
                      style={{
                        marginTop: 8,
                        padding: 10,
                        background: "var(--yl-bg-page)",
                        borderRadius: "var(--yl-radius-sm)",
                        fontSize: "var(--yl-text-caption)",
                        color: "var(--yl-text-secondary)",
                      }}
                    >
                      <Tag color={last.actor === "AI" ? "gold" : last.actor === "运营" ? "purple" : "blue"} style={{ marginRight: 6 }}>
                        {last.actor}
                      </Tag>
                      {last.content}
                      <div style={{ marginTop: 4, color: "var(--yl-text-tertiary)" }}>{last.channel} · {relativeTime(last.time)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Right: detail + batch actions + AI suggestion */}
        <Col xs={24} lg={15}>
          {activeGroup && (
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={
                <Space>
                  <Typography.Text strong>{activeGroup.opp.customer.companyName}</Typography.Text>
                  <StatusTag status={activeGroup.opp.status} />
                  <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>{activeGroup.opp.code}</Typography.Text>
                </Space>
              }
              extra={
                <Space>
                  <Button size="small" onClick={() => nav({ to: "/supplier/opportunities/$id", params: { id: activeGroup.opp.id } })}>
                    查看商机
                  </Button>
                  <Button size="small" type="primary" onClick={() => nav({ to: "/supplier/workspace" })}>
                    去作战台
                  </Button>
                </Space>
              }
            >
              {/* Batch actions bar */}
              <div
                style={{
                  padding: "var(--yl-space-2) var(--yl-space-3)",
                  background: "var(--yl-bg-ai)",
                  border: "1px solid var(--yl-border-ai)",
                  borderRadius: "var(--yl-radius-md)",
                  marginBottom: "var(--yl-space-4)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <input
                    type="checkbox"
                    checked={activeGroup.items.every((i) => selectedFollowUps.includes(i.id)) && activeGroup.items.length > 0}
                    onChange={(e) => toggleAll(activeGroup.items.map((i) => i.id), e.target.checked)}
                  />
                  <Typography.Text style={{ fontSize: "var(--yl-text-body-sm)" }}>
                    已选 <strong style={{ color: "var(--yl-primary)" }}>{activeGroup.items.filter((i) => selectedFollowUps.includes(i.id)).length}</strong> / {activeGroup.items.length} 条
                  </Typography.Text>
                </Space>
                <Space>
                  <Button size="small" icon={<BellOutlined />} onClick={() => message.success("已批量提醒相关运营")}>批量提醒</Button>
                  <Button size="small" icon={<CheckCircleFilled />} onClick={() => message.success("已批量标记为已处理")}>标记已处理</Button>
                  <Button size="small" onClick={() => message.success("已批量归档")}>归档</Button>
                </Space>
              </div>

              <FollowUpTimeline items={activeGroup.items} />

              <div
                style={{
                  marginTop: "var(--yl-space-5)",
                  padding: "var(--yl-space-4)",
                  border: "1px dashed var(--yl-border-ai)",
                  borderRadius: "var(--yl-radius-md)",
                  background: "var(--yl-bg-ai)",
                }}
              >
                <Space style={{ marginBottom: "var(--yl-space-2)" }}>
                  <RobotFilled style={{ color: "var(--yl-primary)" }} />
                  <Typography.Text strong>AI 推荐下一步跟进话术</Typography.Text>
                  <Tag color="purple">置信度 高</Tag>
                </Space>
                <Typography.Paragraph style={{ marginBottom: "var(--yl-space-3)", fontSize: "var(--yl-text-body-sm)", color: "var(--yl-text-primary)" }}>
                  {`${activeGroup.opp.customer.contactName}好，关于${activeGroup.opp.event.type}的方案，我这边根据您之前提到的调性偏好做了微调，把总价压到预算内。方便今天下午 15:00 微信语音同步一下细节吗？`}
                </Typography.Paragraph>
                <Space>
                  <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => message.success("已发送微信")}>一键发送</Button>
                  <Button size="small" onClick={() => message.info("已复制")}>复制</Button>
                  <Button size="small" type="text">再生成</Button>
                </Space>
              </div>

              <Input.Search
                enterButton="记录跟进"
                placeholder="输入本次跟进内容..."
                style={{ marginTop: 16 }}
                onSearch={(v) => v && message.success("已加入跟进记录")}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}