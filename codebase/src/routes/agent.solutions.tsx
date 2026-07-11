import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, Col, Empty, Input, Row, Select, Skeleton, Slider, Space, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { solutions } from "../shared/mock/data";
import { SolutionCard } from "../shared/components/SolutionCard";

export const Route = createFileRoute("/agent/solutions")({
  component: SolutionsPage,
});

function SolutionsPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [scene, setScene] = useState<string | undefined>();
  const [head, setHead] = useState<number | undefined>();
  const [budget, setBudget] = useState<[number, number]>([0, 100]);
  const [duration, setDuration] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    return solutions.filter((s) => {
      if (q && !s.name.includes(q) && !s.sku.includes(q)) return false;
      if (scene && !s.applicableScenes.includes(scene)) return false;
      if (category && !s.items.some((i) => i.category.includes(category))) return false;
      if (head && !(head >= s.headcountRange[0] && head <= s.headcountRange[1])) return false;
      if (s.price / 10000 < budget[0] || s.price / 10000 > budget[1]) return false;
      if (duration === "≤ 30分钟" && s.durationMinutes > 30) return false;
      if (duration === "30-60分钟" && (s.durationMinutes <= 30 || s.durationMinutes > 60)) return false;
      if (duration === "≥ 60分钟" && s.durationMinutes < 60) return false;
      return true;
    });
  }, [q, category, scene, head, budget, duration]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        方案发现
      </Typography.Title>
      <Typography.Text type="secondary">按场景、类型、人数、预算和时长筛选，找到最合适的企业活动方案。</Typography.Text>

      <Card style={{ marginTop: "var(--yl-space-4)", borderRadius: "var(--yl-radius-lg)" }} styles={{ body: { padding: "var(--yl-space-5)" } }}>
        <Row gutter="var(--yl-space-4)" align="middle">
          <Col xs={24} md={7}>
            <Input
              size="large"
              placeholder="搜索方案名称"
              prefix={<SearchOutlined />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              size="large"
              placeholder="活动类型"
              value={category}
              onChange={setCategory}
              allowClear
              style={{ width: "100%" }}
              options={[{ value: "脱口秀" }, { value: "乐队" }, { value: "魔术" }, { value: "主持" }]}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              size="large"
              placeholder="活动场景"
              value={scene}
              onChange={setScene}
              allowClear
              style={{ width: "100%" }}
              options={[{ value: "年会" }, { value: "团建" }, { value: "发布会" }, { value: "商场活动" }, { value: "客户答谢" }]}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              size="large"
              placeholder="人数规模"
              value={head}
              onChange={setHead}
              allowClear
              style={{ width: "100%" }}
              options={[
                { value: 100, label: "100 人以内" },
                { value: 300, label: "100-300 人" },
                { value: 500, label: "300-500 人" },
                { value: 1000, label: "500 人以上" },
              ]}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              size="large"
              placeholder="活动时长"
              value={duration}
              onChange={setDuration}
              allowClear
              style={{ width: "100%" }}
              options={[{ value: "≤ 30分钟" }, { value: "30-60分钟" }, { value: "≥ 60分钟" }]}
            />
          </Col>
          <Col xs={24}>
            <Space size={16} style={{ width: "100%" }}>
              <Typography.Text type="secondary" style={{ minWidth: 100 }}>
                预算 (万元)
              </Typography.Text>
              <div style={{ flex: 1 }}>
                <Slider
                  range
                  value={budget}
                  onChange={(v) => setBudget(v as [number, number])}
                  min={0}
                  max={100}
                  marks={{ 0: "0", 20: "20", 50: "50", 100: "100+" }}
                />
              </div>
              <Typography.Text strong style={{ minWidth: 120, textAlign: "right" }}>
                ¥ {budget[0]}万 – ¥ {budget[1]}万
              </Typography.Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ margin: "var(--yl-space-5) 0 var(--yl-space-3)" }}>
        <Typography.Text type="secondary">共匹配 {list.length} 个方案</Typography.Text>
      </div>

      {loading ? (
        <Row gutter="var(--yl-space-4)">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Col key={i} xs={24} md={12} lg={8}>
              <Card style={{ borderRadius: "var(--yl-radius-lg)" }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : list.length === 0 ? (
        <Card><Empty description="暂无匹配方案，试试放宽筛选条件" /></Card>
      ) : (
        <Row gutter="var(--yl-space-4)">
          {list.map((s) => (
            <Col key={s.id} xs={24} md={12} lg={8}>
              <SolutionCard
                solution={s}
                onGetQuote={() => nav({ to: "/agent/quotations/$id", params: { id: "q1" } })}
                onView={() => nav({ to: "/agent/assistant" })}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}