import { Alert, Button, Card, DatePicker, Form, InputNumber, Select, Space, Typography } from "antd";
import { RobotFilled } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

export interface MinimalRequirementValue {
  eventType: string;
  headcount: number;
  budget: number;
  date: Dayjs;
}

interface Props {
  onSubmit: (v: MinimalRequirementValue) => void;
}

export function MinimalRequirementForm({ onSubmit }: Props) {
  const [form] = Form.useForm<MinimalRequirementValue>();

  return (
    <Card
      style={{ borderRadius: 12, borderColor: "#DED4FF", background: "#FAF9FF" }}
      styles={{ body: { padding: 20 } }}
    >
      <Alert
        type="info"
        icon={<RobotFilled />}
        showIcon
        message={<Typography.Text strong>换个方式告诉我 👇</Typography.Text>}
        description="填这 4 项，AI 立刻给你 3 套方案"
        style={{ background: "#fff", borderColor: "#C9BEFC", marginBottom: 16 }}
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={{ eventType: "年会", headcount: 300, budget: 25, date: dayjs().add(45, "day") }}
        onFinish={onSubmit}
      >
        <Space size={12} wrap style={{ width: "100%" }}>
          <Form.Item label="活动类型" name="eventType" rules={[{ required: true }]} style={{ minWidth: 160 }}>
            <Select
              options={["年会", "团建", "发布会", "商场活动", "客户答谢", "婚礼"].map((v) => ({ value: v, label: v }))}
            />
          </Form.Item>
          <Form.Item label="活动日期" name="date" rules={[{ required: true }]} style={{ minWidth: 180 }}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="人数" name="headcount" rules={[{ required: true }]} style={{ minWidth: 140 }}>
            <InputNumber min={20} max={5000} step={50} style={{ width: "100%" }} addonAfter="人" />
          </Form.Item>
          <Form.Item label="预算" name="budget" rules={[{ required: true }]} style={{ minWidth: 140 }}>
            <InputNumber min={1} max={500} step={1} style={{ width: "100%" }} addonAfter="万" />
          </Form.Item>
        </Space>
        <Button type="primary" htmlType="submit" size="large" block>
          让 AI 立刻推荐方案
        </Button>
      </Form>
    </Card>
  );
}