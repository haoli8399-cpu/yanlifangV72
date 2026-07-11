import { createFileRoute } from "@tanstack/react-router";
import { Card, Input, Select, Space, Table, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { auditLog, type AuditAction, type AuditEntry } from "../shared/mock/admin";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "操作审计 · 演立方 Admin" }] }),
  component: AuditPage,
});

const actionColor: Record<AuditAction, string> = {
  登录: "default", 创建: "blue", 修改: "geekblue", 删除: "red",
  上架: "green", 下架: "orange", 发送报价: "purple", 权限变更: "magenta", 导出: "cyan",
};

function AuditPage() {
  const [kw, setKw] = useState("");
  const [action, setAction] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const list = useMemo(
    () => auditLog.filter((a) =>
      (!action || a.action === action) &&
      (!type || a.targetType === type) &&
      (!kw || a.operator.includes(kw) || a.target.toLowerCase().includes(kw.toLowerCase()) || a.detail.includes(kw))),
    [kw, action, type],
  );

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>操作审计</Typography.Title>
        <Typography.Text type="secondary">
          所有敏感操作（登录 / 上下架 / 报价 / 权限 / 导出 / 字典）不可篡改，可按人 / 对象 / 时间检索。
        </Typography.Text>
      </Space>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input allowClear prefix={<SearchOutlined />} placeholder="搜索操作人 / 对象 / 详情" value={kw} onChange={(e) => setKw(e.target.value)} style={{ width: 300 }} />
          <Select allowClear placeholder="操作类型" style={{ width: 140 }} value={action} onChange={setAction}
            options={["登录","创建","修改","删除","上架","下架","发送报价","权限变更","导出"].map(v => ({ label: v, value: v }))}
          />
          <Select allowClear placeholder="对象类型" style={{ width: 140 }} value={type} onChange={setType}
            options={["SKU","艺人","客户","订单","报价","账号","Prompt","字典"].map(v => ({ label: v, value: v }))}
          />
        </Space>

        <Table<AuditEntry>
          rowKey="id"
          dataSource={list}
          pagination={{ pageSize: 15 }}
          columns={[
            { title: "时间", dataIndex: "time", width: 160 },
            { title: "操作人", dataIndex: "operator", width: 100 },
            { title: "角色", dataIndex: "role", width: 110 },
            { title: "操作", dataIndex: "action", width: 110, render: (v: AuditAction) => <Tag color={actionColor[v]}>{v}</Tag> },
            { title: "对象类型", dataIndex: "targetType", width: 100 },
            { title: "对象", dataIndex: "target", width: 180, render: (v) => <code>{v}</code> },
            { title: "详情", dataIndex: "detail" },
            { title: "IP", dataIndex: "ip", width: 130, render: (v) => <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-caption)" }}>{v}</Typography.Text> },
          ]}
        />
      </Card>
    </div>
  );
}