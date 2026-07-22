import { toast } from "sonner";

/**
 * demoToast — 统一的"演示环境反馈"。
 * 用于所有依赖后端才能真正落地(导出、销毁、发通知、发起支付等)
 * 或本轮尚未接入实际状态变更的按钮,给用户一个明确的可视反馈,
 * 而不是静默无反应。
 */
export function demoToast(label?: string) {
  toast(label ?? "已记录你的操作", {
    description: "演示环境:该动作已被前端记录,尚未连接后端。",
    duration: 2600,
  });
}
