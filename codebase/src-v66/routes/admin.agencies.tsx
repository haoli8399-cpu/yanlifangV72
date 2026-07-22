import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Button, Card, Col, Drawer, Input, Row, Segmented, Select, Space, Statistic, Table, Tabs, Tag, Typography, message } from "antd";
import { SearchOutlined, CheckOutlined, StopOutlined, EditOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { agencies as agencyData, artistProfiles, orders, type Agency } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/admin/agencies")({
  head: () => ({ meta: [{ title: "经纪公司管理 · 演立方 Admin" }] }),
  component: AgenciesPage,
});

type StatusFilter = "全部" | Agency["status"];

function AgenciesPage() {
  const [list, setList] = useState<Agency[]>(agencyData);
  const [kw, setKw] = useState("");
  const [status, setStatus] = useState<StatusFilter>("全部");
  const [city, setCity] = useState<string>("全部");
  const [current, setCurrent] = useState<Agency | null>(null);

  const cities = useMemo(() => ["全部", ...Array.from(new Set(agencyData.map((a) => a.city)))], []);

  const filtered = useMemo(
    () =>
      list.filter(
        (a) =>
          (status === "全部" || a.status === status) &&
          (city === "全部" || a.city === city) &&
          (!kw || a.name.includes(kw) || a.contact.includes(kw)),
      ),
    [list, kw, status, city],
  );

  const kpi = useMemo(() => {
    const active = list.filter((a) => a.status === "已入驻").length;
    const pending = list.filter((a) => a.status === "审核中").length;
    const disabled = list.filter((a) => a.status === "已停用").length;
    const gmv = list.reduce((s, a) => s + a.gmv, 0);
    return { active, pending, disabled, gmv, total: list.length };
  }, [list]);

  function updateStatus(id: string, next: Agency["status"]) {
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    setCurrent((c) => (c && c.id === id ? { ...c, status: next } : c));
    message.success(`已更新为「${next}」`);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>经纪公司管理</Typography.Title>
        <Typography.Text type="secondary">供应商入驻审核、结算账户、旗下艺人与合作 GMV 追踪</Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="已入驻" value={kpi.active} suffix={`/ ${kpi.total}`} styles={{ content: { color: "#22c55e" } }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待审核" value={kpi.pending} styles={{ content: { color: "#f59e0b" } }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已停用" value={kpi.disabled} styles={{ content: { color: "#94a3b8" } }} /></Card></Col>
        <Col span={6}><Card><Statistic title="累计 GMV" value={kpi.gmv} formatter={(v) => yuan(Number(v))} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
          <Space wrap>
            <Segmented
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={["全部", "已入驻", "审核中", "已停用"]}
            />
            <Select value={city} onChange={setCity} style={{ width: 140 }} options={cities.map((c) => ({ label: c, value: c }))} />
          </Space>
          <Space>
            <Input allowClear prefix={<SearchOutlined />} placeholder="名称 / 联系人" value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 240 }} />
            <Button type="primary">新增经纪公司</Button>
          </Space>
        </Space>

        <Table<Agency>
          rowKey="id"
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          onRow={(r) => ({ onClick: () => setCurrent(r), style: { cursor: "pointer" } })}
          columns={[
            {
              title: "经纪公司",
              dataIndex: "name",
              render: (v: string, r) => (
                <Space>
                  <Avatar style={{ background: "#4B34D1" }}>{v.slice(0, 1)}</Avatar>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                    <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>{r.city} · {r.artistCount} 位艺人</div>
                  </div>
                </Space>
              ),
            },
            { title: "联系人", dataIndex: "contact", width: 110 },
            { title: "电话", dataIndex: "phone", width: 140 },
            { title: "累计 GMV", dataIndex: "gmv", width: 140, align: "right", render: (v: number) => yuan(v) },
            { title: "评分", dataIndex: "rating", width: 90, render: (v: number) => (v ? <Tag color="gold">★ {v}</Tag> : "—") },
            { title: "结算账户", dataIndex: "settleAccount", width: 200 },
            {
              title: "状态",
              dataIndex: "status",
              width: 110,
              render: (v: Agency["status"]) => (
                <Badge status={v === "已入驻" ? "success" : v === "审核中" ? "processing" : "default"} text={v} />
              ),
            },
            {
              title: "操作",
              width: 160,
              render: (_, r) => (
                <Space size={4} onClick={(e) => e.stopPropagation()}>
                  {r.status === "审核中" && (
                    <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => updateStatus(r.id, "已入驻")}>通过</Button>
                  )}
                  {r.status === "已入驻" && (
                    <Button size="small" danger icon={<StopOutlined />} onClick={() => updateStatus(r.id, "已停用")}>停用</Button>
                  )}
                  {r.status === "已停用" && (
                    <Button size="small" onClick={() => updateStatus(r.id, "已入驻")}>恢复</Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <AgencyDrawer
        agency={current}
        onClose={() => setCurrent(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}

function AgencyDrawer({ agency, onClose, onUpdateStatus }: { agency: Agency | null; onClose: () => void; onUpdateStatus: (id: string, s: Agency["status"]) => void }) {
  const myArtists = useMemo(() => (agency ? artistProfiles.filter((a) => a.agencyName === agency.name) : []), [agency]);
  const myOrders = useMemo(() => {
    if (!agency) return [];
    const names = new Set(myArtists.map((a) => a.name));
    // orders don't carry agency; approximate via customer + eventType (mock) — show any order for demo
    return orders.filter((o) => names.size >= 0).slice(0, 4);
  }, [agency, myArtists]);

  return (
    <Drawer
      open={!!agency}
      onClose={onClose}
      title={agency?.name}
      width={720}
      extra={agency && (
        <Space>
          <Button icon={<EditOutlined />}>编辑资料</Button>
          {agency.status === "审核中" && <Button type="primary" onClick={() => onUpdateStatus(agency.id, "已入驻")}>通过入驻</Button>}
        </Space>
      )}
    >
      {agency && (
        <Tabs
          items={[
            {
              key: "info",
              label: "基础信息",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}><Field label="联系人" value={agency.contact} /></Col>
                  <Col span={12}><Field label="电话" value={agency.phone} /></Col>
                  <Col span={12}><Field label="所在城市" value={agency.city} /></Col>
                  <Col span={12}><Field label="状态" value={agency.status} /></Col>
                  <Col span={12}><Field label="在册艺人" value={`${agency.artistCount} 位`} /></Col>
                  <Col span={12}><Field label="平台评分" value={agency.rating ? `★ ${agency.rating}` : "—"} /></Col>
                  <Col span={24}><Field label="结算账户" value={agency.settleAccount} /></Col>
                  <Col span={24}><Field label="累计 GMV" value={yuan(agency.gmv)} /></Col>
                </Row>
              ),
            },
            {
              key: "artists",
              label: `旗下艺人 (${myArtists.length})`,
              children: (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={myArtists}
                  columns={[
                    { title: "艺人", dataIndex: "name" },
                    { title: "品类", dataIndex: "category", width: 100 },
                    { title: "指导价", dataIndex: "basePrice", width: 110, align: "right", render: (v: number) => yuan(v) },
                    { title: "评分", dataIndex: "rating", width: 70, render: (v: number) => <Tag color="gold">★ {v}</Tag> },
                    { title: "30 天档期", dataIndex: "bookings30d", width: 100, align: "right", render: (v) => `${v} 场` },
                    { title: "状态", dataIndex: "status", width: 100, render: (v) => <Badge status={v === "在售" ? "success" : v === "档期紧张" ? "warning" : "default"} text={v} /> },
                  ]}
                />
              ),
            },
            {
              key: "orders",
              label: "合作订单",
              children: (
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={myOrders}
                  columns={[
                    { title: "订单号", dataIndex: "code", width: 150 },
                    { title: "客户", dataIndex: "customerName" },
                    { title: "类型", dataIndex: "eventType" },
                    { title: "应付供应商", dataIndex: "supplierPayable", width: 120, align: "right", render: (v: number) => yuan(v) },
                    { title: "已付", dataIndex: "supplierPaid", width: 100, align: "right", render: (v: number) => yuan(v) },
                    { title: "状态", dataIndex: "status", width: 90, render: (v) => <Tag>{v}</Tag> },
                  ]}
                />
              ),
            },
            {
              key: "audit",
              label: "入驻审核",
              children: (
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Field label="营业执照" value="已上传 · 京 A**** (2024-03-12 到期 2044-03-11)" />
                  <Field label="法人身份证" value="已上传 · 王** (脱敏)" />
                  <Field label="演出经纪许可证" value={agency.status === "审核中" ? "待人工复核" : "已核验"} />
                  <Field label="签约主体" value={`${agency.name}（有限公司）`} />
                  <Field label="佣金比例" value="平台服务费 8% · 快结手续费 0.6%" />
                  {agency.status === "审核中" && (
                    <Space style={{ marginTop: 12 }}>
                      <Button type="primary" icon={<CheckOutlined />} onClick={() => onUpdateStatus(agency.id, "已入驻")}>审核通过</Button>
                      <Button danger onClick={() => onUpdateStatus(agency.id, "已停用")}>驳回</Button>
                    </Space>
                  )}
                </Space>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}