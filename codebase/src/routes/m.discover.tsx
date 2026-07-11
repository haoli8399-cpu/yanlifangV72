import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, Input, Segmented, Space, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { solutions } from "../shared/mock/data";
import { yuan } from "../shared/components/formatters";

export const Route = createFileRoute("/m/discover")({
  component: MDiscover,
});

const TIERS = ["全部", "经济方案", "推荐方案", "升级方案"] as const;
type Tier = (typeof TIERS)[number];

function MDiscover() {
  const nav = useNavigate();
  const [tier, setTier] = useState<Tier>("全部");
  const [kw, setKw] = useState("");

  const list = useMemo(
    () =>
      solutions.filter(
        (s) =>
          (tier === "全部" || s.tier === tier) &&
          (!kw || s.name.includes(kw) || s.applicableScenes.some((sc) => sc.includes(kw))),
      ),
    [tier, kw],
  );

  return (
    <div>
      <div
        style={{
          padding: "var(--yl-space-5) var(--yl-space-5) var(--yl-space-3)",
          background: "#fff",
          borderBottom: "1px solid var(--yl-border-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>找方案</Typography.Title>
        <Input
          prefix={<SearchOutlined style={{ color: "var(--yl-text-tertiary)" }} />}
          placeholder="搜索方案 / 场景"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          style={{ marginTop: "var(--yl-space-3)", borderRadius: 10, background: "var(--yl-bg-page)" }}
          variant="filled"
        />
        <div style={{ marginTop: "var(--yl-space-2)" }}>
          <Segmented
            block
            size="small"
            value={tier}
            onChange={(v) => setTier(v as Tier)}
            options={TIERS.slice()}
          />
        </div>
      </div>

      <div style={{ padding: "var(--yl-space-4)", display: "flex", flexDirection: "column", gap: "var(--yl-space-3)" }}>
        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "var(--yl-space-10)", color: "var(--yl-text-tertiary)" }}>暂无匹配方案</div>
        )}
        {list.map((s) => (
          <Card
            key={s.id}
            hoverable
            styles={{ body: { padding: "var(--yl-space-3)" } }}
            style={{ borderRadius: "var(--yl-radius-lg)" }}
            onClick={() => nav({ to: "/m/submit", search: { q: `我想办一场${s.applicableScenes[0] ?? "年会"}` } } as never)}
          >
            <Space wrap size={6}>
              <Tag color="purple" style={{ borderRadius: "var(--yl-radius-sm)" }}>{s.tier}</Tag>
              <Tag style={{ borderRadius: "var(--yl-radius-sm)" }}>SKU {s.sku}</Tag>
            </Space>
            <div style={{ font: "var(--yl-text-heading-4)", fontWeight: 700, marginTop: "var(--yl-space-2)" }}>{s.name}</div>
            <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)", marginTop: 4 }}>
              {s.durationMinutes} 分钟 · 适合 {s.headcountRange[0]}-{s.headcountRange[1]} 人 · {s.applicableScenes.join("/")}
            </div>
            <div style={{ marginTop: "var(--yl-space-2)", font: "var(--yl-text-body-sm)", color: "var(--yl-text-secondary)", lineHeight: 1.6 }}>
              {s.items.slice(0, 3).map((i) => i.artistName).join(" · ")}
            </div>
            <div style={{ marginTop: "var(--yl-space-2)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ font: "var(--yl-text-caption-xs)", color: "var(--yl-text-tertiary)" }}>方案价</div>
                <div style={{ font: "var(--yl-text-numeric-md)", fontWeight: 800, color: "var(--yl-primary)" }}>{yuan(s.price)}</div>
              </div>
              <Tag color="warning" style={{ borderRadius: "var(--yl-radius-sm)" }}>推荐 {s.recommendScore}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}