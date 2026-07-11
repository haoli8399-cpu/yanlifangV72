import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Card, Col, Row, Space, Table, Tag, Typography } from "antd";
import { adminUsers, rolePermissions, type AdminUser } from "../shared/mock/admin";
import { StatusTag } from "../shared/components/StatusTag";

export const Route = createFileRoute("/admin/rbac")({
  head: () => ({ meta: [{ title: "团队与权限 · 演立方 Admin" }] }),
  component: RbacPage,
});

const roleColor: Record<string, string> = {
  超级管理员: "purple",
  运营主管: "geekblue",
  销售运营: "blue",
  财务: "gold",
  只读: "default",
};

function RbacPage() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Space orientation="vertical" size={2}>
        <Typography.Title level={3} style={{ margin: 0 }}>团队与权限</Typography.Title>
        <Typography.Text type="secondary">运营账号、团队分组、角色与数据权限矩阵</Typography.Text>
      </Space>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="运营账号">
            <Table<AdminUser>
              rowKey="id"
              pagination={false}
              dataSource={adminUsers}
              columns={[
                {
                  title: "成员",
                  dataIndex: "name",
                  render: (v: string, r) => (
                    <Space>
                      <Avatar style={{ background: r.status === "启用" ? "#6E59F5" : "#8B92A8" }}>{v.slice(0, 1)}</Avatar>
                      <div>
                        <div style={{ fontWeight: 600 }}>{v}</div>
                        <div style={{ fontSize: "var(--yl-text-caption)", color: "#8B92A8" }}>{r.email}</div>
                      </div>
                    </Space>
                  ),
                },
                { title: "团队", dataIndex: "team", width: 130 },
                { title: "角色", dataIndex: "role", width: 130, render: (v: string) => <StatusTag status={v} /> },
                { title: "最近登录", dataIndex: "lastLogin", width: 160 },
                { title: "状态", dataIndex: "status", width: 100, render: (v) => <Badge status={v === "启用" ? "success" : "default"} text={v} /> },
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="角色权限矩阵">
            <Space orientation="vertical" size={14} style={{ width: "100%" }}>
              {Object.entries(rolePermissions).map(([role, perms]) => (
                <div key={role}>
                  <StatusTag status={role} />
                  <div>
                    {perms.map((p) => (
                      <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="操作审计（近 24 小时）" size="small">
        <Typography.Text type="secondary" style={{ fontSize: "var(--yl-text-body-sm)" }}>
          Demo 数据：所有敏感操作（SKU 上下架、报价发送、权限变更、艺人下架）都会写入审计日志，可按人、按对象、按时间检索。P1 交付完整视图。
        </Typography.Text>
      </Card>
    </div>
  );
}