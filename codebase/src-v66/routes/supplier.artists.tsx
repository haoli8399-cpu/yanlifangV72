import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { PlusOutlined, SearchOutlined, StarFilled, CalendarOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { artists, opportunities } from "../shared/mock/data";
import { artistProfiles } from "../shared/mock/admin";
import type { Artist } from "../shared/types";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/supplier/artists")({
  head: () => ({ meta: [{ title: "艺人资源库 · 演立方销售端" }] }),
  component: ArtistLibraryPage,
});

type ViewMode = "卡片" | "表格";

const categories = ["全部", "脱口秀", "乐队", "魔术", "主持", "歌手"];

function ArtistLibraryPage() {
  const [kw, setKw] = useState("");
  const [cat, setCat] = useState("全部");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [view, setView] = useState<ViewMode>("卡片");
  const [current, setCurrent] = useState<Artist | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  const enriched = useMemo(
    () =>
      artists.map((a) => {
        const profile = artistProfiles.find((p) => p.id === a.id);
        return {
          ...a,
          agencyName: profile?.agencyName ?? "—",
          status: profile?.status ?? "在售",
          bookings30d: profile?.bookings30d ?? 0,
          bookings90d: profile?.bookings90d ?? 0,
          nextAvailable: profile?.nextAvailable ?? "—",
        };
      }),
    [],
  );

  const filtered = useMemo(
    () =>
      enriched.filter((a) => {
        if (cat !== "全部" && !a.category.includes(cat)) return false;
        if (a.basePrice < priceRange[0] || a.basePrice > priceRange[1]) return false;
        if (availableOnly && a.status !== "在售") return false;
        if (kw && !a.name.includes(kw) && !a.tags.some((t) => t.includes(kw))) return false;
        return true;
      }),
    [enriched, cat, priceRange, availableOnly, kw],
  );

  function toggleCart(id: string) {
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    message.success(cart.includes(id) ? "已从方案中移除" : "已加入方案");
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0, color: "#F5F6FA" }}>艺人资源库</Typography.Title>
        <Typography.Text style={{ color: "#8B92A8" }}>查档期 · 比价 · 一键加入方案</Typography.Text>
      </Space>

      <Card styles={{ body: { padding: 16 } }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索艺人名 / 标签"
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                style={{ width: 240 }}
              />
              <Segmented value={cat} onChange={(v) => setCat(v as string)} options={categories} />
              <Space size={4}>
                <span style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>价格</span>
                <Slider
                  range
                  min={0}
                  max={500000}
                  step={10000}
                  value={priceRange}
                  onChange={(v) => setPriceRange(v as [number, number])}
                  style={{ width: 180 }}
                  tooltip={{ formatter: (v) => `¥${((v ?? 0) / 10000).toFixed(0)}万` }}
                />
              </Space>
              <Button
                size="small"
                type={availableOnly ? "primary" : "default"}
                onClick={() => setAvailableOnly((v) => !v)}
              >
                仅看有档
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Segmented value={view} onChange={(v) => setView(v as ViewMode)} options={["卡片", "表格"]} />
              <Badge count={cart.length} showZero>
                <Button icon={<PlusOutlined />} disabled={cart.length === 0}>已选 {cart.length}</Button>
              </Badge>
            </Space>
          </Col>
        </Row>
      </Card>

      {filtered.length === 0 ? (
        <Card><Empty description="没有匹配的艺人，试试调整筛选" /></Card>
      ) : view === "卡片" ? (
        <Row gutter={[16, 16]}>
          {filtered.map((a) => (
            <Col key={a.id} xs={24} sm={12} lg={8} xxl={6}>
              <ArtistCard
                artist={a}
                inCart={cart.includes(a.id)}
                onOpen={() => setCurrent(a)}
                onToggle={() => toggleCart(a.id)}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            dataSource={filtered}
            pagination={{ pageSize: 10 }}
            onRow={(r) => ({ onClick: () => setCurrent(r), style: { cursor: "pointer" } })}
            columns={[
              {
                title: "艺人",
                dataIndex: "name",
                render: (v: string, r) => (
                  <Space>
                    <Avatar style={{ background: "#6E59F5" }}>{v.slice(0, 1)}</Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v}</div>
                      <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>{r.category}</div>
                    </div>
                  </Space>
                ),
              },
              { title: "所属经纪", dataIndex: "agencyName", width: 160 },
              { title: "指导价", dataIndex: "basePrice", width: 120, align: "right", render: (v: number) => yuan(v) },
              { title: "评分", dataIndex: "rating", width: 80, render: (v: number) => <Tag color="gold">★ {v}</Tag> },
              { title: "30 天档期", dataIndex: "bookings30d", width: 100, align: "right", render: (v) => `${v} 场` },
              { title: "最近可档", dataIndex: "nextAvailable", width: 120 },
              {
                title: "状态",
                dataIndex: "status",
                width: 110,
                render: (v: string) => (
                  <Badge status={v === "在售" ? "success" : v === "档期紧张" ? "warning" : "default"} text={v} />
                ),
              },
              {
                title: "操作",
                width: 120,
                render: (_, r) => (
                  <Button
                    size="small"
                    type={cart.includes(r.id) ? "default" : "primary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCart(r.id);
                    }}
                  >
                    {cart.includes(r.id) ? "已加入" : "加入方案"}
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      <ArtistDrawer
        artist={current}
        onClose={() => setCurrent(null)}
        inCart={current ? cart.includes(current.id) : false}
        onToggle={() => current && toggleCart(current.id)}
      />
    </div>
  );
}

function ArtistCard({
  artist,
  inCart,
  onOpen,
  onToggle,
}: {
  artist: ReturnType<typeof useEnriched>[number];
  inCart: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const statusColor = artist.status === "在售" ? "#22c55e" : artist.status === "档期紧张" ? "#f59e0b" : "#94a3b8";
  return (
    <Card
      hoverable
      onClick={onOpen}
      styles={{ body: { padding: 16 } }}
      style={{ border: "1px solid #1F2338", background: "#141830" }}
    >
      <Space align="start" size={12} style={{ width: "100%" }}>
        <Avatar size={56} style={{ background: "#6E59F5", fontSize: "var(--yl-text-heading-1)" }}>{artist.name.slice(0, 1)}</Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <div style={{ fontSize: "var(--yl-text-heading-3)", fontWeight: 600, color: "#F5F6FA" }}>{artist.name}</div>
            <Tooltip title={`评分 ${artist.rating}`}>
              <span style={{ color: "#F5B301", fontWeight: 600 }}>
                <StarFilled /> {artist.rating}
              </span>
            </Tooltip>
          </Space>
          <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8", marginTop: 2 }}>
            {artist.category} · {artist.agencyName}
          </div>
          <div style={{ marginTop: 8 }}>
            {artist.tags.slice(0, 3).map((t) => (
              <Tag key={t} style={{ marginBottom: 4 }}>{t}</Tag>
            ))}
          </div>
        </div>
      </Space>

      <div style={{ marginTop: 12, padding: "10px 12px", background: "#0F1327", borderRadius: 8 }}>
        <Row gutter={8}>
          <Col span={12}>
            <div style={{ fontSize: "var(--yl-text-caption-xs)", color: "#8B92A8" }}>指导价</div>
            <div style={{ fontSize: "var(--yl-text-body-lg)", fontWeight: 700, color: "#F5F6FA" }}>{yuan(artist.basePrice)}</div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: "var(--yl-text-caption-xs)", color: "#8B92A8" }}>最近可档</div>
            <div style={{ fontSize: "var(--yl-text-body-sm)", color: "#F5F6FA" }}>
              <CalendarOutlined /> {artist.nextAvailable}
            </div>
          </Col>
        </Row>
      </div>

      <Space style={{ width: "100%", justifyContent: "space-between", marginTop: 12 }}>
        <Badge color={statusColor} text={<span style={{ color: "#B5B9C9", fontSize: "var(--yl-text-caption)" }}>{artist.status} · 30天 {artist.bookings30d} 场</span>} />
        <Button
          size="small"
          type={inCart ? "default" : "primary"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {inCart ? "已加入" : "加入方案"}
        </Button>
      </Space>
    </Card>
  );
}

// Type helper — the enriched artist shape used by the card / drawer.
function useEnriched() {
  return artists.map((a) => {
    const profile = artistProfiles.find((p) => p.id === a.id);
    return {
      ...a,
      agencyName: profile?.agencyName ?? "—",
      status: profile?.status ?? "在售",
      bookings30d: profile?.bookings30d ?? 0,
      bookings90d: profile?.bookings90d ?? 0,
      nextAvailable: profile?.nextAvailable ?? "—",
    };
  });
}

function ArtistDrawer({
  artist,
  inCart,
  onClose,
  onToggle,
}: {
  artist: Artist | null;
  inCart: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const profile = artist ? artistProfiles.find((p) => p.id === artist.id) : undefined;
  const relatedOpps = useMemo(
    () => (artist ? opportunities.slice(0, 3) : []),
    [artist],
  );

  // Build a 14-day mock schedule
  const schedule = useMemo(() => {
    if (!artist) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const busy = [1, 3, 6, 9, 12].includes(i);
      return {
        date: d.toISOString().slice(5, 10),
        weekday: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
        busy,
      };
    });
  }, [artist]);

  return (
    <Drawer
      open={!!artist}
      onClose={onClose}
      title={artist?.name}
      width={720}
      extra={
        artist && (
          <Space>
            <Button>联系经纪</Button>
            <Button type={inCart ? "default" : "primary"} icon={<PlusOutlined />} onClick={onToggle}>
              {inCart ? "已加入方案" : "加入方案"}
            </Button>
          </Space>
        )
      }
    >
      {artist && (
        <>
          <Space align="start" size={16} style={{ marginBottom: 20 }}>
            <Avatar size={72} style={{ background: "#6E59F5", fontSize: "var(--yl-text-display-md)" }}>{artist.name.slice(0, 1)}</Avatar>
            <div>
              <div style={{ fontSize: "var(--yl-text-heading-1)", fontWeight: 700 }}>{artist.name}</div>
              <div style={{ color: "#8B92A8", marginTop: 4 }}>
                {artist.category} · {profile?.agencyName ?? "—"}
              </div>
              <div style={{ marginTop: 8 }}>
                {artist.tags.map((t: string) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          </Space>

          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={6}><Metric label="指导价" value={yuan(artist.basePrice)} /></Col>
            <Col span={6}><Metric label="平台评分" value={`★ ${artist.rating}`} /></Col>
            <Col span={6}><Metric label="30 天档期" value={`${profile?.bookings30d ?? 0} 场`} /></Col>
            <Col span={6}><Metric label="90 天档期" value={`${profile?.bookings90d ?? 0} 场`} /></Col>
          </Row>

          <Tabs
            items={[
              {
                key: "bio",
                label: "艺人简介",
                children: (
                  <Typography.Paragraph style={{ color: "#4B5064", lineHeight: 1.8 }}>
                    {artist.bio}
                  </Typography.Paragraph>
                ),
              },
              {
                key: "schedule",
                label: "近 14 天档期",
                children: (
                  <div>
                    <Row gutter={[8, 8]}>
                      {schedule.map((s) => (
                        <Col key={s.date} span={4}>
                          <div
                            style={{
                              padding: "12px 8px",
                              textAlign: "center",
                              border: `1px solid ${s.busy ? "#FED7AA" : "#D1FAE5"}`,
                              background: s.busy ? "#FFF7ED" : "#F0FDF4",
                              borderRadius: 8,
                            }}
                          >
                            <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>周{s.weekday}</div>
                            <div style={{ fontWeight: 600 }}>{s.date}</div>
                            <div style={{ fontSize: "var(--yl-text-caption-xs)", color: s.busy ? "#EA580C" : "#16A34A", marginTop: 4 }}>
                              {s.busy ? "已排" : "有档"}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <Typography.Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: "var(--yl-text-caption)" }}>
                      * 档期为经纪公司维护结果，最终以确认为准。
                    </Typography.Text>
                  </div>
                ),
              },
              {
                key: "history",
                label: "参与商机",
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={relatedOpps}
                    columns={[
                      { title: "商机号", dataIndex: "code", width: 150 },
                      { title: "客户", dataIndex: ["customer", "companyName"] },
                      { title: "类型", dataIndex: ["event", "type"], width: 100 },
                      { title: "档期", dataIndex: ["event", "date"], width: 110 },
                      {
                        title: "预算",
                        dataIndex: ["event", "budget"],
                        width: 110,
                        align: "right",
                        render: (v: number) => yuan(v),
                      },
                    ]}
                  />
                ),
              },
              {
                key: "price",
                label: "报价与佣金",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Metric label="指导价（含税）" value={yuan(artist.basePrice)} />
                    <Metric label="平台服务费" value="8%" />
                    <Metric label="预估到手（经纪公司）" value={yuan(Math.round(artist.basePrice * 0.92))} />
                    <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>
                      * 大型活动可与经纪协商联合折扣，成交后按订单结算。
                    </Typography.Text>
                  </Space>
                ),
              },
            ]}
          />
        </>
      )}
    </Drawer>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: "8px 12px", background: "#F5F6FA", borderRadius: 8 }}>
      <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>{label}</div>
      <div style={{ fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}