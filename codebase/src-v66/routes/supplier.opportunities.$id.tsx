import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  FileDoneOutlined,
  PhoneOutlined,
  RobotFilled,
  SendOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { followUps, opportunities, quotations, solutions } from "../shared/mock/data";
import { RequirementExtractPanel } from "../shared/components/RequirementExtractPanel";
import { SolutionCard } from "../shared/components/SolutionCard";
import { FollowUpTimeline } from "../shared/components/FollowUpTimeline";
import { StatusTag } from "../shared/components/StatusTag";
import { AIFeedbackBar, FEEDBACK_PRESETS } from "../shared/components/AIFeedbackBar";
import { OpportunityStatusFlow } from "../shared/components/OpportunityStatusFlow";
import { yuan } from "../shared/components/formatters";
import { generateOperatorSolutions } from "../shared/mock/ai";
import type { Solution } from "../shared/types";

export const Route = createFileRoute("/supplier/opportunities/$id")({
  component: OpportunityDetail,
  notFoundComponent: () => (
    <div style={{ padding: 48, textAlign: "center", color: "#fff" }}>商机不存在</div>
  ),
});

function OpportunityDetail() {
  const { id } = useParams({ from: "/supplier/opportunities/$id" });
  const nav = useNavigate();
  const opp = opportunities.find((o) => o.id === id) ?? opportunities[0]!;
  const oppFollowUps = followUps.filter((f) => f.opportunityId === opp.id);
  const relatedQuotes = quotations.filter((q) => q.opportunityId === opp.id);

  const [aiSolutions, setAiSolutions] = useState<Solution[]>(solutions.slice(0, 3));
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let alive = true;
    setGenerating(true);
    generateOperatorSolutions(opp.event.type).then((res) => {
      if (alive) {
        setAiSolutions(res);
        setGenerating(false);
      }
    });
    return () => { alive = false; };
  }, [opp.id, opp.event.type]);

  return (
    <div style={{ padding: "var(--yl-space-5)", background: "var(--yl-bg-page)", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <Space style={{ marginBottom: 12 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => nav({ to: "/supplier/opportunities" })}
          >
            返回商机中心
          </Button>
          <Tag color="purple">{opp.code}</Tag>
          <StatusTag status={opp.status} />
        </Space>

        <Row gutter={16}>
          <Col xs={24} lg={15}>
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={
                <Space size={12}>
                  <Avatar size={40} style={{ background: opp.customer.avatarColor }}>
                    {opp.customer.companyName.slice(0, 1)}
                  </Avatar>
                  <div>
                    <div style={{ fontSize: "var(--yl-text-heading-3)", fontWeight: 700 }}>{opp.customer.companyName}</div>
                    <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                      {opp.customer.contactName} · {opp.customer.contactTitle} · {opp.customer.phone}
                    </div>
                  </div>
                </Space>
              }
              extra={
                <Space>
                  <Button icon={<PhoneOutlined />} onClick={() => message.success("正在呼叫...")}>电话</Button>
                  <Button type="primary" icon={<SendOutlined />} onClick={() => message.success("已发送微信")}>发送微信</Button>
                </Space>
              }
            >
              <Alert
                type="info"
                icon={<RobotFilled />}
                showIcon
                message={<span style={{ fontWeight: 600 }}>客户原始需求</span>}
                description={opp.rawRequirement}
                style={{ marginBottom: "var(--yl-space-4)", background: "var(--yl-bg-ai)", borderColor: "var(--yl-border-ai)" }}
              />

              <Descriptions column={2} size="small" bordered styles={{ label: { width: 110 } }}>
                <Descriptions.Item label="活动类型">{opp.event.type} · {opp.event.scene}</Descriptions.Item>
                <Descriptions.Item label="活动日期">{opp.event.date}</Descriptions.Item>
                <Descriptions.Item label="场地">{opp.event.location}</Descriptions.Item>
                <Descriptions.Item label="人数">{opp.event.headcount} 人</Descriptions.Item>
                <Descriptions.Item label="预算">{yuan(opp.event.budget)}</Descriptions.Item>
                <Descriptions.Item label="时长">{opp.event.durationMinutes} 分钟</Descriptions.Item>
                <Descriptions.Item label="行业">{opp.customer.industry}</Descriptions.Item>
                <Descriptions.Item label="负责运营">{opp.ownerName}</Descriptions.Item>
              </Descriptions>

              <Divider />
              <RequirementExtractPanel opportunity={opp} />

              <Divider />
              <AIFeedbackBar
                kind="需求识别"
                opportunityId={opp.id}
                dimensions={FEEDBACK_PRESETS["需求识别"].slice()}
              />

              <Divider />
              <OpportunityStatusFlow opportunityId={opp.id} current={opp.status} />
            </Card>

            <Card
              style={{ marginTop: "var(--yl-space-4)", borderRadius: "var(--yl-radius-lg)" }}
              styles={{ body: { padding: "var(--yl-space-5)" } }}
              title={<Typography.Text strong>跟进时间线</Typography.Text>}
              extra={<Tag color="purple">{oppFollowUps.length} 条</Tag>}
            >
              <FollowUpTimeline items={oppFollowUps} />
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card
              style={{ borderRadius: "var(--yl-radius-lg)" }}
              styles={{ body: { padding: "var(--yl-space-4)" } }}
              title={
                <Space>
                  <ThunderboltFilled style={{ color: "var(--yl-primary)" }} />
                  <Typography.Text strong>AI 方案 A / B / C</Typography.Text>
                  {generating && <Tag color="processing">生成中</Tag>}
                </Space>
              }
            >
              <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                {aiSolutions.map((s, i) => (
                  <div key={`${s.id}-${i}`}>
                    <SolutionCard
                      solution={s}
                      highlight={s.tier === "推荐方案"}
                      showCost
                      onGetQuote={() => {
                        message.success(`已按「${s.tier}」生成正式报价`);
                        nav({ to: "/supplier/quotations/$id", params: { id: "q1" } });
                      }}
                      onView={() => message.info(`已展开「${s.name}」详情`)}
                    />
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: "var(--yl-space-sm)" }}>
                      <AIFeedbackBar compact kind="方案推荐" opportunityId={opp.id} dimensions={FEEDBACK_PRESETS["方案推荐"].slice()} />
                      <AIFeedbackBar compact kind="报价" opportunityId={opp.id} dimensions={FEEDBACK_PRESETS["报价"].slice()} />
                      <AIFeedbackBar compact kind="艺人推荐" opportunityId={opp.id} dimensions={FEEDBACK_PRESETS["艺人推荐"].slice()} />
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            <Card
              style={{ marginTop: "var(--yl-space-4)", borderRadius: "var(--yl-radius-lg)" }}
              styles={{ body: { padding: "var(--yl-space-4)" } }}
              title={<Typography.Text strong>相关报价</Typography.Text>}
            >
              {relatedQuotes.length === 0 ? (
                <Typography.Text type="secondary">暂无报价，选择方案后自动生成</Typography.Text>
              ) : (
                <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                  {relatedQuotes.map((q) => {
                    const cur = q.versions.find((v) => v.version === q.currentVersion) ?? q.versions[0]!;
                    return (
                      <Link
                        key={q.id}
                        to="/supplier/quotations/$id"
                        params={{ id: q.id }}
                        style={{ display: "block" }}
                      >
                        <Card size="small" hoverable styles={{ body: { padding: "var(--yl-space-3)" } }}>
                          <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{q.code} · {cur.solutionName}</div>
                              <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{q.versions.length} 版 · 当前 {q.currentVersion}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ color: "var(--yl-primary)", fontWeight: 700 }}>{yuan(cur.finalPrice)}</div>
                              <StatusTag status={q.status} />
                            </div>
                          </Space>
                        </Card>
                      </Link>
                    );
                  })}
                </Space>
              )}
              <Button
                block
                icon={<FileDoneOutlined />}
                style={{ marginTop: 12 }}
                onClick={() => nav({ to: "/supplier/quotations/$id", params: { id: "q1" } })}
              >
                进入报价编辑
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}