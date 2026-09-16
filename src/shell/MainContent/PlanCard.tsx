import { CreditCard, Globe, Phone } from "lucide-react";
import type { PlanCard as PlanCardData } from "@/mock/data";

const STATUS_STYLES: Record<PlanCardData["status"], { card: string; bar: string; badge: string }> = {
  active: { card: "border-shell-border bg-white", bar: "bg-status-active", badge: "bg-status-active-bg text-status-active" },
  expiring: { card: "border-shell-border bg-status-warn-bg/40", bar: "bg-status-warn", badge: "bg-status-warn-bg text-status-warn" },
  expired: { card: "border-status-expired/30 bg-status-expired-bg", bar: "bg-status-expired", badge: "bg-status-expired-bg text-status-expired" },
};

const ICONS = { billing: CreditCard, data: Globe, roaming: Globe, call: Phone };

export function PlanCard({ plan }: { plan: PlanCardData }) {
  const styles = STATUS_STYLES[plan.status];
  const Icon = ICONS[plan.icon];
  const badgeText =
    plan.status === "active" ? "Active" : plan.status === "expired" ? "Expired" : `Expires in ${plan.expiresInDays}d`;

  return (
    <div className={`rounded-xl border p-4 ${styles.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Icon size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{plan.title}</p>
            <p className="text-xs text-slate-400">{plan.category}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles.badge}`}>
          {badgeText}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-600">{plan.usageLabel}</span>
        <span className="text-slate-400">{plan.usagePct.toFixed(1)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${Math.max(plan.usagePct, 2)}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Start {plan.start}</span>
        <span>{plan.endLabel}</span>
      </div>
    </div>
  );
}
