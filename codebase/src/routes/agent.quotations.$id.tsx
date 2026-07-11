import { createFileRoute, useParams } from "@tanstack/react-router";
import { Alert, Button, Card, Col, Descriptions, Divider, Input, List, Modal, Row, Segmented, Space, Statistic, Table, Tag, Typography, message } from "antd";
import { CheckOutlined, CloseOutlined, ClockCircleOutlined, DownloadOutlined, FileDoneOutlined, MessageOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { opportunities, quotations } from "../shared/mock/data";
import { yuan } from "../shared/components/formatters";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/agent/quotations/$id")({
  component: QuotationDetail,
});

function QuotationDetail() {
  const { id } = useParams({ from: "/agent/quotations/$id" });
  const quotation = quotations.find((q) => q.id === id) ?? quotations[0]!;
  const opp = opportunities.find((o) => o.id === quotation.opportunityId);

  const [mode, setMode] = useState<string | number>("查看最新版");
  const [compareA, setCompareA] = useState(quotation.versions[0].version);
  const [compareB, setCompareB] = useState(quotation.versions[quotation.versions.length - 1].version);
  const [confirmStatus, setConfirmStatus] = useState<"未回复" | "已阅" | "已确认" | "已拒绝">(
    quotation.customerConfirmStatus ?? "已阅",
  );
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const current = quotation.versions.find((v) => v.version === quotation.currentVersion) ?? quotation.versions[quotation.versions.length - 1]!;

  const vA = useMemo(() => quotation.versions.find((v) => v.version === compareA)!, [compareA, quotation]);
  const vB = useMemo(() => quotation.versions.find((v) => v.version === compareB)!, [compareB, quotation]);

  const validUntil = quotation.validUntil ? new Date(quotation.validUntil).getTime() : null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remainMs = validUntil ? Math.max(0, validUntil - now) : 0;
  const remainH = Math.floor(remainMs / 3_600_000);
  const remainM = Math.floor((remainMs % 3_600_000) / 60_000);
  const remainS = Math.floor((remainMs % 60_000) / 1000);
  const urgent = validUntil ? remainMs < 24 * 3_600_000 : false;

  const settled = confirmStatus === "已确认" || confirmStatus === "已拒绝";

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Space style={{ marginBottom: "var(--yl-space-3)" }}>
        <Tag color="purple" style={{ borderRadius: "var(--yl-radius-sm)" }}>{quotation.code}</Tag>
        <StatusTag status={quotation.status} />
        {confirmStatus === "已确认" && <Tag color="green">你已确认</Tag>}
        {confirmStatus === "已拒绝" && <Tag color="red">你已拒绝</Tag>}
      </Space>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {quotation.customerName} · {quotation.eventType}
      </Typography.Title>
      <Typography.Text type="secondary">当前版本 {quotation.currentVersion} · 共 {quotation.versions.length} 版</Typography.Text>

      {validUntil && (
        <Card
          style={{
            marginTop: "var(--yl-space-4)",
            borderRadius: "var(--yl-radius-lg)",
            background: urgent ? "linear-gradient(135deg,#FFF1F0,#FFE7E7)" : "linear-gradient(135deg,var(--yl-bg-ai),var(--yl-primary-subtle))",
            border: `1px solid ${urgent ? "#FFCCC7" : "var(--yl-border-ai)"}`,
          }}
          styles={{ body: { padding: "var(--yl-space-4)" } }}
        >
          <Space size="var(--yl-space-4)" align="center" style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Space size="var(--yl-space-3)">
              <ClockCircleOutlined style={{ fontSize: 26, color: urgent ? "#F5222D" : "var(--yl-primary)" }} />
              <div>
                <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>报价有效期倒计时</div>
                <div style={{ font: "var(--yl-text-numeric-md)", fontWeight: 700, color: urgent ? "#F5222D" : "var(--yl-primary)", fontVariantNumeric: "tabular-nums" }}>
                  {remainMs === 0
                    ? "已过期"
                    : `${String(remainH).padStart(2, "0")} 时 ${String(remainM).padStart(2, "0")} 分 ${String(remainS).padStart(2, "0")} 秒`}
                </div>
              </div>
            </Space>
            <Space>
              <Button
                size="large"
                danger
                icon={<CloseOutlined />}
                disabled={settled || remainMs === 0}
                onClick={() => setRejectOpen(true)}
              >
                方案不合适
              </Button>
              <Button
                size="large"
                type="primary"
                icon={<CheckOutlined />}
                disabled={settled || remainMs === 0}
                onClick={() => {
                  setConfirmStatus("已确认");
                  message.success("已确认报价，运营会在 2 小时内与你联系确认合同");
                }}
              >
                确认接受
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      <Row gutter="var(--yl-space-4)" style={{ marginTop: "var(--yl-space-4)" }}>
        <Col xs={24} lg={17}>
          <Card
            style={{ borderRadius: "var(--yl-radius-lg)" }}
            title={
              <Segmented
                options={["查看最新版", "版本对比"]}
                value={mode}
                onChange={setMode}
              />
            }
            extra={
              <Space>
                <Button icon={<DownloadOutlined />}>下载方案报价</Button>
              </Space>
            }
          >
            {mode === "查看最新版" ? (
              <VersionView v={current} />
            ) : (
              <div>
                <Space size="var(--yl-space-3)" style={{ marginBottom: "var(--yl-space-3)" }}>
                  <Typography.Text>版本对比：</Typography.Text>
                  <Segmented options={quotation.versions.map((v) => v.version)} value={compareA} onChange={(v) => setCompareA(v as string)} />
                  <Typography.Text>vs</Typography.Text>
                  <Segmented options={quotation.versions.map((v) => v.version)} value={compareB} onChange={(v) => setCompareB(v as string)} />
                </Space>
                <Row gutter="var(--yl-space-4)">
                  <Col span={12}><VersionView v={vA} compact /></Col>
                  <Col span={12}><VersionView v={vB} compact highlight /></Col>
                </Row>
                <Divider />
                <Alert
                  type="info"
                  showIcon
                  message="变更点"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {vB.changes.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  }
                />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={7}>
          <Space orientation="vertical" size="var(--yl-space-4)" style={{ width: "100%" }}>
            <Card styles={{ body: { padding: "var(--yl-space-4)" } }}>
              <Statistic
                title="报价总额"
                value={current.finalPrice}
                precision={0}
                prefix="¥"
                styles={{ content: { color: "var(--yl-primary)", fontWeight: 700 } }}
              />
              <div style={{ marginTop: 6, font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                原价 {yuan(current.totalPrice)} · 让利 {yuan(current.discount)}
              </div>
            </Card>
            {opp && (
              <Card title="关联需求" styles={{ body: { padding: "var(--yl-space-4)" } }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="需求编号">{opp.code}</Descriptions.Item>
                  <Descriptions.Item label="活动类型">{opp.event.type} · {opp.event.scene}</Descriptions.Item>
                  <Descriptions.Item label="日期">{opp.event.date}</Descriptions.Item>
                  <Descriptions.Item label="人数">{opp.event.headcount} 人</Descriptions.Item>
                  <Descriptions.Item label="预算">{yuan(opp.event.budget)}</Descriptions.Item>
                  <Descriptions.Item label="联系人">{opp.customer.contactName} · {opp.customer.contactTitle}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
            <Card title="版本历史" styles={{ body: { padding: "var(--yl-space-4)" } }}>
              <List
                dataSource={quotation.versions.slice().reverse()}
                renderItem={(v) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileDoneOutlined style={{ fontSize: 20, color: v.version === quotation.currentVersion ? "#6E59F5" : "#8B92A8" }} />}
                      title={
                        <Space>
                          <Typography.Text strong>版本 {v.version}</Typography.Text>
                          {v.version === quotation.currentVersion && <Tag color="purple">当前</Tag>}
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ font: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{v.editor} · {new Date(v.createdAt).toLocaleString("zh-CN")}</div>
                          <div style={{ font: "var(--yl-text-caption)", marginTop: 4 }}>{v.changeNote}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
            <Card styles={{ body: { padding: "var(--yl-space-4)" } }}>
              <Space orientation="vertical" style={{ width: "100%" }}>
                <Button icon={<MessageOutlined />} block>联系运营</Button>
                <Button block>申请修改方案</Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        title="请告知拒绝原因"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        okText="提交拒绝"
        okButtonProps={{ danger: true }}
        onOk={() => {
          if (!rejectReason.trim()) {
            message.warning("请填写拒绝原因，帮助运营优化方案");
            return;
          }
          setConfirmStatus("已拒绝");
          setRejectOpen(false);
          message.success("已提交拒绝原因，运营会在 4 小时内重新出方案");
        }}
      >
        <Space orientation="vertical" style={{ width: "100%" }} size="var(--yl-space-3)">
          <Space wrap>
            {["预算超出", "档期冲突", "艺人不合适", "方案偏离需求", "已选择其他供应商"].map((r) => (
              <Tag.CheckableTag
                key={r}
                checked={rejectReason.includes(r)}
                onChange={() => setRejectReason((prev) => (prev ? `${prev}；${r}` : r))}
              >
                {r}
              </Tag.CheckableTag>
            ))}
          </Space>
          <Input.TextArea
            rows={4}
            placeholder="补充更多细节（可选）"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  );
}

function VersionView({ v, compact, highlight }: { v: import("../shared/types").QuotationVersion; compact?: boolean; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? "var(--yl-bg-ai)" : undefined, padding: highlight ? "var(--yl-space-3)" : 0, borderRadius: "var(--yl-radius-md)", border: highlight ? "1px solid var(--yl-border-ai)" : "none" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Typography.Text strong>版本 {v.version} · {v.solutionName}</Typography.Text>
          <Typography.Text type="secondary" style={{ font: "var(--yl-text-caption)" }}>{v.editor} · {new Date(v.createdAt).toLocaleDateString("zh-CN")}</Typography.Text>
        </Space>
      <Table
        style={{ marginTop: "var(--yl-space-3)" }}
        size="small"
        pagination={false}
        rowKey="artistId"
        dataSource={v.items}
        columns={[
          { title: "演员/内容团队", dataIndex: "artistName" },
          { title: "类型", dataIndex: "category" },
          { title: "时长", dataIndex: "duration", render: (d: number) => `${d} 分钟` },
          { title: "单价", dataIndex: "price", render: (p: number) => yuan(p) },
        ]}
      />
      <div style={{ marginTop: "var(--yl-space-3)", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "var(--yl-text-tertiary)", font: "var(--yl-text-caption)" }}>报价小计</div>
          <div style={{ fontVariantNumeric: "tabular-nums", font: "var(--yl-text-body-md)" }}>{yuan(v.totalPrice)}</div>
        </div>
        <div>
          <div style={{ color: "var(--yl-text-tertiary)", font: "var(--yl-text-caption)" }}>让利</div>
          <div style={{ fontVariantNumeric: "tabular-nums", font: "var(--yl-text-body-md)" }}>- {yuan(v.discount)}</div>
        </div>
        <div>
          <div style={{ color: "var(--yl-text-tertiary)", font: "var(--yl-text-caption)" }}>最终报价</div>
          <div style={{ font: "var(--yl-text-numeric-md)", fontWeight: 700, color: "var(--yl-primary)", fontVariantNumeric: "tabular-nums" }}>{yuan(v.finalPrice)}</div>
        </div>
      </div>
      {!compact && v.changeNote && (
        <Alert type="info" showIcon style={{ marginTop: "var(--yl-space-3)" }} message={`变更说明：${v.changeNote}`} />
      )}
    </div>
  );
}