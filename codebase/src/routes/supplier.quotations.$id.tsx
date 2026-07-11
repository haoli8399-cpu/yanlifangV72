import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DiffOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import { artists, opportunities, quotations } from "../shared/mock/data";
import type { QuotationVersion, SolutionItem } from "../shared/types";
import { yuan } from "../shared/components/formatters";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/supplier/quotations/$id")({
  component: SupplierQuotation,
});

function SupplierQuotation() {
  const { id } = useParams({ from: "/supplier/quotations/$id" });
  const nav = useNavigate();
  const baseQ = quotations.find((qq) => qq.id === id) ?? quotations[0]!;
  const [q, setQ] = useState(baseQ);
  const opp = opportunities.find((o) => o.id === q.opportunityId)!;
  const [mode, setMode] = useState<"版本详情" | "版本对比">("版本详情");
  const [compareA, setCompareA] = useState<string>(q.versions[0]!.version);
  const [compareB, setCompareB] = useState<string>(q.currentVersion);
  const [editorOpen, setEditorOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState<string>("客户放弃");
  const [voidNote, setVoidNote] = useState<string>("");

  const currentVersion = q.versions.find((v) => v.version === q.currentVersion) ?? q.versions[0]!;
  const versionA = q.versions.find((v) => v.version === compareA) ?? q.versions[0]!;
  const versionB = q.versions.find((v) => v.version === compareB) ?? q.versions[q.versions.length - 1]!;

  // Draft state for creating new version
  const [draftItems, setDraftItems] = useState<SolutionItem[]>(currentVersion.items);
  const [draftDiscount, setDraftDiscount] = useState<number>(currentVersion.discount);
  const [draftNote, setDraftNote] = useState("");

  const openEditor = () => {
    setDraftItems(currentVersion.items.map((i) => ({ ...i })));
    setDraftDiscount(currentVersion.discount);
    setDraftNote("");
    setEditorOpen(true);
  };

  const draftTotalPrice = useMemo(() => draftItems.reduce((s, i) => s + i.price, 0), [draftItems]);
  const draftTotalCost = useMemo(() => draftItems.reduce((s, i) => s + i.cost, 0), [draftItems]);
  const draftFinal = draftTotalPrice - draftDiscount;

  const saveNewVersion = () => {
    const nextNum = q.versions.length + 1;
    const newVer: QuotationVersion = {
      version: `v${nextNum}`,
      createdAt: new Date().toISOString(),
      editor: "张运营",
      solutionId: currentVersion.solutionId,
      solutionName: currentVersion.solutionName + `（v${nextNum}）`,
      items: draftItems,
      totalPrice: draftTotalPrice,
      totalCost: draftTotalCost,
      discount: draftDiscount,
      finalPrice: draftFinal,
      changeNote: draftNote || "基于上一版本创建，价格与配置已调整。",
      changes: diffChanges(currentVersion, {
        items: draftItems,
        totalPrice: draftTotalPrice,
        totalCost: draftTotalCost,
        discount: draftDiscount,
        finalPrice: draftFinal,
      }),
    };
    setQ({ ...q, versions: [...q.versions, newVer], currentVersion: newVer.version });
    setEditorOpen(false);
    setCompareA(currentVersion.version);
    setCompareB(newVer.version);
    message.success(`新版本 ${newVer.version} 已创建`);
  };

  const remainH = q.validUntil ? (new Date(q.validUntil).getTime() - Date.now()) / 3600000 : null;
  const expiryBadge = (() => {
    if (remainH == null) return null;
    if (remainH <= 0) return <Tag color="red" icon={<ClockCircleOutlined />}>已过期 {Math.round(-remainH)}h</Tag>;
    if (remainH <= 48) return <Tag color="orange" icon={<ClockCircleOutlined />}>剩 {Math.round(remainH)}h 到期</Tag>;
    return <Tag color="green" icon={<ClockCircleOutlined />}>{Math.round(remainH / 24)} 天有效</Tag>;
  })();
  const receiptBadge = (() => {
    if (q.customerConfirmStatus === "已确认") return <Tag color="green" icon={<CheckCircleFilled />}>客户已确认</Tag>;
    if (q.customerConfirmStatus === "已拒绝") return <Tag color="red">客户已拒</Tag>;
    if (q.readAt) return <Tag color="blue" icon={<EyeOutlined />}>已阅 · {new Date(q.readAt).toLocaleString("zh-CN")}</Tag>;
    if (q.sentAt) return <Tag>已发送 · 未读</Tag>;
    return null;
  })();

  const VOID_REASONS = ["客户放弃", "价格分歧", "档期冲突", "方案不符", "竞品成交", "内部作废"];
  const confirmVoid = () => {
    setQ({ ...q, status: "已作废", voidReason: `${voidReason}${voidNote ? " · " + voidNote : ""}` });
    setVoidOpen(false);
    message.warning(`报价已作废：${voidReason}`);
  };

  return (
    <div style={{ padding: "var(--yl-space-5)", background: "var(--yl-bg-page)", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Space style={{ marginBottom: "var(--yl-space-2)" }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav({ to: "/supplier/quotations" })}>
            返回报价管理
          </Button>
        </Space>
        <Space>
          <Tag color="purple">{q.code}</Tag>
          <StatusTag status={q.status} />
          <Tag color="geekblue">{q.versions.length} 版 · 当前 {q.currentVersion}</Tag>
          {expiryBadge}
          {receiptBadge}
        </Space>
        <Typography.Title level={3} style={{ margin: "8px 0 0" }}>
          {q.customerName} · {q.eventType}
        </Typography.Title>
        {q.status === "已作废" && q.voidReason && (
          <Alert
            style={{ marginTop: "var(--yl-space-3)" }}
            type="error"
            showIcon
            message="该报价已作废"
            description={`作废原因：${q.voidReason}`}
          />
        )}

        <Row style={{ marginTop: "var(--yl-space-3)" }}>
          <Segmented
            options={["版本详情", "版本对比"]}
            value={mode}
            onChange={(v) => setMode(v as "版本详情" | "版本对比")}
          />
        </Row>

        <Row gutter={16} style={{ marginTop: "var(--yl-space-4)" }}>
          <Col xs={24} lg={16}>
            {mode === "版本详情" ? (
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              {q.versions.map((v) => (
                <Card
                  key={v.version}
                  title={
                    <Space>
                      <Typography.Text strong>版本 {v.version}</Typography.Text>
                      {v.version === q.currentVersion && <Tag color="purple">当前</Tag>}
                    </Space>
                  }
                  extra={<Typography.Text type="secondary">{v.editor} · {new Date(v.createdAt).toLocaleString("zh-CN")}</Typography.Text>}
                >
                  <Descriptions column={3} size="small">
                    <Descriptions.Item label="方案">{v.solutionName}</Descriptions.Item>
                    <Descriptions.Item label="小计">{yuan(v.totalPrice)}</Descriptions.Item>
                    <Descriptions.Item label="成本">{yuan(v.totalCost)}</Descriptions.Item>
                    <Descriptions.Item label="让利">- {yuan(v.discount)}</Descriptions.Item>
                    <Descriptions.Item label="最终报价">
                      <span style={{ fontSize: "var(--yl-text-heading-3)", fontWeight: 700, color: "var(--yl-primary)" }}>{yuan(v.finalPrice)}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="毛利">
                      <span style={{ color: "var(--yl-success)" }}>{yuan(v.finalPrice - v.totalCost)}</span>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: "12px 0" }} />
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="artistId"
                    dataSource={v.items}
                    columns={[
                      { title: "艺人", dataIndex: "artistName" },
                      { title: "类型", dataIndex: "category" },
                      { title: "时长", dataIndex: "duration", render: (d: number) => `${d} 分钟` },
                      { title: "报价", dataIndex: "price", render: (p: number) => yuan(p) },
                      { title: "成本", dataIndex: "cost", render: (c: number) => <span style={{ color: "var(--yl-text-tertiary)" }}>{yuan(c)}</span> },
                    ]}
                  />
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginTop: "var(--yl-space-3)" }}
                    message={v.changeNote}
                    description={
                      v.changes.length > 0 && (
                        <Space wrap size={4} style={{ marginTop: 4 }}>
                          {v.changes.map((c, i) => (
                            <Tag key={i} color="gold" style={{ borderRadius: "var(--yl-radius-sm)" }}>{c}</Tag>
                          ))}
                        </Space>
                      )
                    }
                  />
                </Card>
              ))}

              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={openEditor}>
                  基于当前版本创建 v{q.versions.length + 1}
                </Button>
                <Button icon={<SendOutlined />} onClick={() => message.success(`报价 ${q.currentVersion} 已发送至 ${q.customerName}`)}>
                  发送给客户
                </Button>
                <Button icon={<CheckCircleFilled />} onClick={() => { setQ({ ...q, status: "已成交" }); message.success("已标记为已成交"); }}>
                  标记为已成交
                </Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => setVoidOpen(true)}>
                  作废报价
                </Button>
              </Space>
              </Space>
            ) : (
              <VersionDiffView
                versions={q.versions}
                a={compareA}
                b={compareB}
                onA={setCompareA}
                onB={setCompareB}
                versionA={versionA}
                versionB={versionB}
              />
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card title="关联商机" styles={{ body: { padding: "var(--yl-space-4)" } }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="商机编号">{opp.code}</Descriptions.Item>
                <Descriptions.Item label="客户">{opp.customer.companyName}</Descriptions.Item>
                <Descriptions.Item label="联系人">{opp.customer.contactName} · {opp.customer.contactTitle}</Descriptions.Item>
                <Descriptions.Item label="电话">{opp.customer.phone}</Descriptions.Item>
                <Descriptions.Item label="活动">{opp.event.type} · {opp.event.date}</Descriptions.Item>
                <Descriptions.Item label="人数">{opp.event.headcount} 人</Descriptions.Item>
                <Descriptions.Item label="预算">{yuan(opp.event.budget)}</Descriptions.Item>
                <Descriptions.Item label="负责运营">{opp.ownerName}</Descriptions.Item>
              </Descriptions>
              <Button
                block
                style={{ marginTop: "var(--yl-space-3)" }}
                onClick={() => nav({ to: "/supplier/opportunities/$id", params: { id: opp.id } })}
              >
                查看商机详情
              </Button>
            </Card>

            <Card
              title={<Space><EditOutlined /><span>版本时间线</span></Space>}
              style={{ marginTop: "var(--yl-space-4)" }}
              styles={{ body: { padding: "var(--yl-space-3)" } }}
            >
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {q.versions.map((v) => (
                  <div
                    key={v.version}
                    style={{
                      padding: 10,
                      borderRadius: "var(--yl-radius-md)",
                      background: v.version === q.currentVersion ? "var(--yl-primary-subtle)" : "var(--yl-bg-page)",
                      border: `1px solid ${v.version === q.currentVersion ? "var(--yl-border-ai)" : "var(--yl-border-subtle)"}`,
                    }}
                  >
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space>
                        <Tag color={v.version === q.currentVersion ? "purple" : "default"}>{v.version}</Tag>
                        <Typography.Text style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>
                          {v.editor} · {new Date(v.createdAt).toLocaleDateString("zh-CN")}
                        </Typography.Text>
                      </Space>
                      <span style={{ fontWeight: 700, color: "var(--yl-primary)" }}>{yuan(v.finalPrice)}</span>
                    </Space>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={`创建新版本 v${q.versions.length + 1}`}
        open={editorOpen}
        onCancel={() => setEditorOpen(false)}
        onOk={saveNewVersion}
        okText="保存新版本"
        cancelText="取消"
        width={860}
      >
        <Table<SolutionItem>
          size="small"
          pagination={false}
          rowKey="artistId"
          dataSource={draftItems}
          columns={[
            {
              title: "艺人",
              dataIndex: "artistName",
              render: (_, row, idx) => (
                <Select
                  value={row.artistId}
                  style={{ width: 160 }}
                  options={artists.map((a) => ({ value: a.id, label: a.name }))}
                  onChange={(v) => {
                    const a = artists.find((x) => x.id === v)!;
                    setDraftItems(draftItems.map((it, i) =>
                      i === idx ? { ...it, artistId: a.id, artistName: a.name, category: a.category, price: a.basePrice, cost: Math.round(a.basePrice * 0.65) } : it,
                    ));
                  }}
                />
              ),
            },
            { title: "类型", dataIndex: "category", width: 120 },
            {
              title: "时长(分钟)",
              dataIndex: "duration",
              width: 110,
              render: (_, row, idx) => (
                <InputNumber
                  min={5}
                  max={180}
                  value={row.duration}
                  onChange={(v) => setDraftItems(draftItems.map((it, i) => (i === idx ? { ...it, duration: Number(v) || 0 } : it)))}
                />
              ),
            },
            {
              title: "报价",
              dataIndex: "price",
              width: 140,
              render: (_, row, idx) => (
                <InputNumber
                  min={0}
                  step={1000}
                  style={{ width: 130 }}
                  formatter={(v) => `¥ ${Number(v).toLocaleString("zh-CN")}`}
                  parser={(v) => Number((v ?? "").toString().replace(/[^\d]/g, "")) as 0}
                  value={row.price}
                  onChange={(v) => setDraftItems(draftItems.map((it, i) => (i === idx ? { ...it, price: Number(v) || 0 } : it)))}
                />
              ),
            },
            {
              title: "成本",
              dataIndex: "cost",
              width: 140,
              render: (_, row, idx) => (
                <InputNumber
                  min={0}
                  step={1000}
                  style={{ width: 130 }}
                  formatter={(v) => `¥ ${Number(v).toLocaleString("zh-CN")}`}
                  parser={(v) => Number((v ?? "").toString().replace(/[^\d]/g, "")) as 0}
                  value={row.cost}
                  onChange={(v) => setDraftItems(draftItems.map((it, i) => (i === idx ? { ...it, cost: Number(v) || 0 } : it)))}
                />
              ),
            },
            {
              title: "",
              width: 60,
              render: (_, _row, idx) => (
                <Button size="small" type="text" danger onClick={() => setDraftItems(draftItems.filter((_, i) => i !== idx))}>
                  移除
                </Button>
              ),
            },
          ]}
        />
        <Space style={{ marginTop: "var(--yl-space-3)" }}>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              const a = artists[0]!;
              setDraftItems([...draftItems, { artistId: a.id, artistName: a.name, category: a.category, duration: 20, price: a.basePrice, cost: Math.round(a.basePrice * 0.65) }]);
            }}
          >
            添加艺人
          </Button>
        </Space>

        <Divider />
        <Row gutter="var(--yl-space-3)">
          <Col span={6}>
            <Typography.Text type="secondary">小计</Typography.Text>
            <div style={{ fontSize: "var(--yl-text-heading-3)", fontWeight: 600 }}>{yuan(draftTotalPrice)}</div>
          </Col>
          <Col span={6}>
            <Typography.Text type="secondary">成本</Typography.Text>
            <div style={{ fontSize: "var(--yl-text-heading-3)", fontWeight: 600, color: "var(--yl-text-tertiary)" }}>{yuan(draftTotalCost)}</div>
          </Col>
          <Col span={6}>
            <Typography.Text type="secondary">让利</Typography.Text>
            <InputNumber
              min={0}
              step={1000}
              style={{ width: "100%" }}
              value={draftDiscount}
              onChange={(v) => setDraftDiscount(Number(v) || 0)}
              formatter={(v) => `¥ ${Number(v).toLocaleString("zh-CN")}`}
              parser={(v) => Number((v ?? "").toString().replace(/[^\d]/g, "")) as 0}
            />
          </Col>
          <Col span={6}>
            <Typography.Text type="secondary">最终报价</Typography.Text>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--yl-primary)" }}>{yuan(draftFinal)}</div>
            <Typography.Text style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-success)" }}>
              毛利 {yuan(draftFinal - draftTotalCost)}
            </Typography.Text>
          </Col>
        </Row>

        <Divider />
        <Typography.Text type="secondary">变更说明</Typography.Text>
        <input
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="例如：客户希望更松弛的组合..."
          style={{
            width: "100%",
            padding: "var(--yl-space-2) var(--yl-space-3)",
            borderRadius: "var(--yl-radius-sm)",
            border: "1px solid var(--yl-border-default)",
            marginTop: 6,
          }}
        />
      </Modal>

      <Modal
        title="作废报价"
        open={voidOpen}
        onCancel={() => setVoidOpen(false)}
        onOk={confirmVoid}
        okText="确认作废"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: "var(--yl-text-body-sm)" }}>
          作废后该报价将不可再发送，请选择作废原因（必填）：
        </Typography.Paragraph>
        <Select
          value={voidReason}
          onChange={setVoidReason}
          style={{ width: "100%" }}
          options={VOID_REASONS.map((r) => ({ value: r, label: r }))}
        />
        <input
          value={voidNote}
          onChange={(e) => setVoidNote(e.target.value)}
          placeholder="补充说明（可选）"
          style={{
            width: "100%",
            marginTop: "var(--yl-space-3)",
            padding: "var(--yl-space-2) var(--yl-space-3)",
            borderRadius: "var(--yl-radius-sm)",
            border: "1px solid var(--yl-border-default)",
          }}
        />
      </Modal>
    </div>
  );
}

function diffChanges(
  prev: QuotationVersion,
  next: { items: SolutionItem[]; totalPrice: number; totalCost: number; discount: number; finalPrice: number },
): string[] {
  const out: string[] = [];
  const prevIds = prev.items.map((i) => i.artistId).join(",");
  const nextIds = next.items.map((i) => i.artistId).join(",");
  if (prevIds !== nextIds) {
    const removed = prev.items.filter((p) => !next.items.find((n) => n.artistId === p.artistId));
    const added = next.items.filter((n) => !prev.items.find((p) => p.artistId === n.artistId));
    if (removed.length) out.push(`移除：${removed.map((r) => r.artistName).join("、")}`);
    if (added.length) out.push(`新增：${added.map((r) => r.artistName).join("、")}`);
  }
  if (prev.finalPrice !== next.finalPrice) {
    out.push(`最终报价：${yuan(prev.finalPrice)} → ${yuan(next.finalPrice)}`);
  }
  if (prev.discount !== next.discount) {
    out.push(`让利：${yuan(prev.discount)} → ${yuan(next.discount)}`);
  }
  if (out.length === 0) out.push("无实质变更");
  return out;
}

function VersionDiffView({
  versions,
  a,
  b,
  onA,
  onB,
  versionA,
  versionB,
}: {
  versions: QuotationVersion[];
  a: string;
  b: string;
  onA: (v: string) => void;
  onB: (v: string) => void;
  versionA: QuotationVersion;
  versionB: QuotationVersion;
}) {
  const opts = versions.map((v) => ({ value: v.version, label: `版本 ${v.version}` }));

  const rows = [
    { key: "方案", a: versionA.solutionName, b: versionB.solutionName },
    { key: "艺人配置", a: versionA.items.map((i) => `${i.artistName}(${i.duration}分)`).join("、"), b: versionB.items.map((i) => `${i.artistName}(${i.duration}分)`).join("、") },
    { key: "小计", a: yuan(versionA.totalPrice), b: yuan(versionB.totalPrice) },
    { key: "让利", a: yuan(versionA.discount), b: yuan(versionB.discount) },
    { key: "最终报价", a: yuan(versionA.finalPrice), b: yuan(versionB.finalPrice) },
    { key: "毛利", a: yuan(versionA.finalPrice - versionA.totalCost), b: yuan(versionB.finalPrice - versionB.totalCost) },
  ];

  return (
    <Card
      title={
        <Space>
          <DiffOutlined style={{ color: "var(--yl-primary)" }} />
          <Typography.Text strong>版本对比</Typography.Text>
        </Space>
      }
      extra={
        <Space>
          <Select size="small" value={a} onChange={onA} options={opts} style={{ width: 110 }} />
          <span style={{ color: "var(--yl-text-tertiary)" }}>vs</span>
          <Select size="small" value={b} onChange={onB} options={opts} style={{ width: 110 }} />
        </Space>
      }
    >
      <Table
        size="small"
        pagination={false}
        rowKey="key"
        dataSource={rows}
        columns={[
          { title: "字段", dataIndex: "key", width: 120 },
          {
            title: `版本 ${versionA.version}`,
            dataIndex: "a",
            render: (val: string, row) => (
              <span style={{ color: row.a !== row.b ? "#F5222D" : "var(--yl-text-primary)" }}>{val}</span>
            ),
          },
          {
            title: `版本 ${versionB.version}`,
            dataIndex: "b",
            render: (val: string, row) => (
              <span
                style={{
                  background: row.a !== row.b ? "#FFF7E6" : "transparent",
                  padding: row.a !== row.b ? "2px 6px" : 0,
                  borderRadius: "var(--yl-radius-sm)",
                  color: row.a !== row.b ? "#D46B08" : "var(--yl-text-primary)",
                  fontWeight: row.a !== row.b ? 600 : 400,
                }}
              >
                {val}
              </span>
            ),
          },
        ]}
      />
      {versionB.changes.length > 0 && (
        <Alert
          type="warning"
          style={{ marginTop: "var(--yl-space-3)" }}
          message={`版本 ${versionB.version} 相对上一版的变更`}
          description={
            <Space wrap size={4}>
              {versionB.changes.map((c, i) => (
                <Tag key={i} color="orange">{c}</Tag>
              ))}
            </Space>
          }
        />
      )}
    </Card>
  );
}