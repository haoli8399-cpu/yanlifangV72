import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Card, Input, Segmented, Space, Table, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { agencies, artistProfiles, type ArtistProfile } from "../shared/mock/admin";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/admin/artists")({
  head: () => ({ meta: [{ title: "艺人库 · 演立方 Admin" }] }),
  component: ArtistsPage,
});

function ArtistsPage() {
  const [view, setView] = useState<"艺人" | "经纪公司">("艺人");
  const [kw, setKw] = useState("");

  const artistList = useMemo(
    () => artistProfiles.filter((a) => !kw || a.name.includes(kw) || a.category.includes(kw) || a.agencyName.includes(kw)),
    [kw],
  );
  const agencyList = useMemo(
    () => agencies.filter((a) => !kw || a.name.includes(kw) || a.city.includes(kw)),
    [kw],
  );

  return (
    <div style={{ padding: "var(--yl-space-6)", display: "flex", flexDirection: "column", gap: "var(--yl-space-4)" }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>供给侧治理</Typography.Title>
        <Typography.Text type="secondary">艺人档案、经纪公司入驻审核与档期健康度</Typography.Text>
      </Space>

      <Card>
        <Space style={{ marginBottom: "var(--yl-space-4)", width: "100%", justifyContent: "space-between" }}>
          <Segmented value={view} onChange={(v) => setView(v as typeof view)} options={["艺人", "经纪公司"]} />
          <Input allowClear prefix={<SearchOutlined />} placeholder="搜索名称 / 品类 / 城市" value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 280 }} />
        </Space>

        {view === "艺人" ? (
          <Table<ArtistProfile>
            rowKey="id"
            dataSource={artistList}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: "艺人",
                dataIndex: "name",
                render: (v, r) => (
                  <Space>
                    <Avatar style={{ background: "var(--yl-primary)" }}>{v.slice(0, 1)}</Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v}</div>
                      <div style={{ fontSize: "var(--yl-text-caption)", color: "var(--yl-text-tertiary)" }}>{r.category}</div>
                    </div>
                  </Space>
                ),
              },
              { title: "所属经纪", dataIndex: "agencyName", width: 180 },
              { title: "指导价", dataIndex: "basePrice", width: 130, align: "right", render: (v: number) => yuan(v) },
              { title: "评分", dataIndex: "rating", width: 80, render: (v: number) => <Tag color="gold">★ {v}</Tag> },
              { title: "30 天档期", dataIndex: "bookings30d", width: 100, align: "right", render: (v) => `${v} 场` },
              { title: "最近可档", dataIndex: "nextAvailable", width: 120 },
              { title: "标签", dataIndex: "tags", render: (tags: string[]) => tags.map((t) => <Tag key={t}>{t}</Tag>) },
              { title: "状态", dataIndex: "status", width: 110, render: (v) => <Badge status={v === "在售" ? "success" : v === "档期紧张" ? "warning" : "default"} text={v} /> },
            ]}
          />
        ) : (
          <Table
            rowKey="id"
            dataSource={agencyList}
            pagination={false}
            columns={[
              { title: "经纪公司", dataIndex: "name", render: (v, r: (typeof agencies)[number]) => <Space><Avatar style={{ background: "var(--yl-primary-active)" }}>{v.slice(0, 1)}</Avatar><span style={{ fontWeight: 600 }}>{v}</span><Tag>{r.city}</Tag></Space> },
              { title: "联系人", dataIndex: "contact", width: 120 },
              { title: "电话", dataIndex: "phone", width: 140 },
              { title: "在册艺人", dataIndex: "artistCount", width: 100, align: "right" },
              { title: "累计 GMV", dataIndex: "gmv", width: 140, align: "right", render: (v: number) => yuan(v) },
              { title: "评分", dataIndex: "rating", width: 90, render: (v: number) => (v ? <Tag color="gold">★ {v}</Tag> : "—") },
              { title: "结算账户", dataIndex: "settleAccount", width: 200 },
              { title: "状态", dataIndex: "status", width: 100, render: (v) => <Badge status={v === "已入驻" ? "success" : v === "审核中" ? "processing" : "default"} text={v} /> },
            ]}
          />
        )}
      </Card>
    </div>
  );
}