import { followUps, opportunities, quotations } from "../mock/data";
import type { Opportunity, Quotation } from "../types";

export type ReminderSeverity = "紧急" | "重要" | "提醒";

export interface Reminder {
  id: string;
  rule: string;
  severity: ReminderSeverity;
  opportunityId: string;
  customerName: string;
  title: string;
  description: string;
  suggestedAction: string;
  quotationId?: string;
}

const HOUR = 60 * 60 * 1000;

function hoursSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / HOUR;
}

function hoursUntil(iso: string) {
  return (new Date(iso).getTime() - Date.now()) / HOUR;
}

/** PRD §9.2.5 智能跟进提醒规则引擎 */
export function computeReminders(): Reminder[] {
  const out: Reminder[] = [];

  // Rule 1: 报价已发送 24h 未读
  quotations.forEach((q: Quotation) => {
    if (q.status === "已发送" && q.sentAt && !q.readAt && hoursSince(q.sentAt) >= 24) {
      const opp = opportunities.find((o) => o.id === q.opportunityId);
      if (!opp) return;
      out.push({
        id: `r-unread-${q.id}`,
        rule: "报价 24h 未读",
        severity: "重要",
        opportunityId: opp.id,
        customerName: q.customerName,
        title: `${q.customerName} · ${q.code} 已发送 ${Math.round(hoursSince(q.sentAt))}h 未读`,
        description: "客户仍未打开报价，建议换渠道触达。",
        suggestedAction: "微信语音提醒 + 电话备用",
        quotationId: q.id,
      });
    }
  });

  // Rule 2: 报价已读 48h 未回复
  quotations.forEach((q: Quotation) => {
    if (q.readAt && q.customerConfirmStatus !== "已确认" && q.customerConfirmStatus !== "已拒绝" && hoursSince(q.readAt) >= 24) {
      const opp = opportunities.find((o) => o.id === q.opportunityId);
      if (!opp) return;
      out.push({
        id: `r-noreply-${q.id}`,
        rule: "已读 24h+ 未回复",
        severity: "重要",
        opportunityId: opp.id,
        customerName: q.customerName,
        title: `${q.customerName} 已阅 ${Math.round(hoursSince(q.readAt))}h 无回复`,
        description: "客户已阅但迟迟无反馈，可能有价格或配置疑虑。",
        suggestedAction: "推送差异化 v+1 或释放让利空间",
        quotationId: q.id,
      });
    }
  });

  // Rule 3: 报价即将过期（<48h）
  quotations.forEach((q: Quotation) => {
    if (q.validUntil && q.status !== "已成交" && q.status !== "已作废") {
      const remain = hoursUntil(q.validUntil);
      if (remain <= 48 && remain > 0) {
        const opp = opportunities.find((o) => o.id === q.opportunityId);
        if (!opp) return;
        out.push({
          id: `r-expiring-${q.id}`,
          rule: "报价 48h 内到期",
          severity: "紧急",
          opportunityId: opp.id,
          customerName: q.customerName,
          title: `${q.customerName} · ${q.code} 剩 ${Math.round(remain)}h 到期`,
          description: "报价临近有效期，需推动客户尽快确认或延期。",
          suggestedAction: "电话 close + 主动延期一版",
          quotationId: q.id,
        });
      } else if (remain <= 0) {
        const opp = opportunities.find((o) => o.id === q.opportunityId);
        if (!opp) return;
        out.push({
          id: `r-expired-${q.id}`,
          rule: "报价已过期",
          severity: "紧急",
          opportunityId: opp.id,
          customerName: q.customerName,
          title: `${q.customerName} · ${q.code} 已过期 ${Math.round(-remain)}h`,
          description: "报价已过期，需作废或重新出价。",
          suggestedAction: "作废旧版并出 v+1",
          quotationId: q.id,
        });
      }
    }
  });

  // Rule 4: 商机 72h+ 未跟进
  opportunities.forEach((opp: Opportunity) => {
    if (["已成交", "已丢单"].includes(opp.status)) return;
    const last = followUps
      .filter((f) => f.opportunityId === opp.id)
      .sort((a, b) => (a.time < b.time ? 1 : -1))[0];
    const anchor = last?.time ?? opp.createdAt;
    if (hoursSince(anchor) >= 72) {
      out.push({
        id: `r-cold-${opp.id}`,
        rule: "72h+ 未跟进",
        severity: "提醒",
        opportunityId: opp.id,
        customerName: opp.customer.companyName,
        title: `${opp.customer.companyName} 已 ${Math.round(hoursSince(anchor))}h 未跟进`,
        description: "商机长期沉默，AI 建议主动破冰。",
        suggestedAction: "发送节点问候 + 匹配新方案",
      });
    }
  });

  // Rule 5: 活动日期 <30 天但仍在谈判
  opportunities.forEach((opp: Opportunity) => {
    if (!["有效商机", "已报价", "谈判中", "等待客户确认"].includes(opp.status)) return;
    const daysToEvent = (new Date(opp.event.date).getTime() - Date.now()) / (24 * HOUR);
    if (daysToEvent > 0 && daysToEvent <= 30) {
      out.push({
        id: `r-eventclose-${opp.id}`,
        rule: "活动 <30 天未成交",
        severity: "紧急",
        opportunityId: opp.id,
        customerName: opp.customer.companyName,
        title: `${opp.customer.companyName} 活动仅剩 ${Math.round(daysToEvent)} 天`,
        description: "活动日期临近但尚未成交，档期风险升高。",
        suggestedAction: "锁档期 + 强推推荐方案",
      });
    }
  });

  const order: Record<ReminderSeverity, number> = { 紧急: 0, 重要: 1, 提醒: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

export const severityColor: Record<ReminderSeverity, string> = {
  紧急: "red",
  重要: "orange",
  提醒: "blue",
};