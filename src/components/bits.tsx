import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/app-state";
import type { Plan, Tone } from "@/lib/domain";
import { shownQty } from "@/lib/domain";

export function toneName(tone: Tone) {
  if (tone === "bad") return "bad" as const;
  if (tone === "warn") return "warn" as const;
  if (tone === "over") return "over" as const;
  if (tone === "ok") return "ok" as const;
  return "neutral" as const;
}

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return <Badge tone={toneName(tone)}>{label}</Badge>;
}

export function QtyActions({ plan }: { plan: Plan }) {
  const { state, setQtyDraft, confirm, hold, reset } = useApp();
  const draft = state.qtyDrafts[plan.id];
  const value = draft ?? String(shownQty(plan));
  const inputDisabled = plan.stepMax === 0 && plan.status !== "hold";
  const canEdit = plan.stepMax > 0;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1 text-[12px] text-mute">
        执行
        <Input
          className="w-[88px]"
          type="number"
          min={0}
          max={plan.stepMax}
          step={plan.sku.case}
          value={value}
          disabled={inputDisabled}
          aria-label={`${plan.sku.name} 执行数量`}
          onChange={(e) => setQtyDraft(plan.id, e.target.value)}
        />
      </label>
      <Button type="button" size="sm" disabled={!canEdit} onClick={() => confirm(plan.id)}>
        确认
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => hold(plan.id)}>
        暂缓
      </Button>
      {state.decisions[plan.id] ? (
        <Button type="button" size="sm" variant="outline" onClick={() => reset(plan.id)}>
          恢复建议
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-[13px] text-mute">
        {children}
      </td>
    </tr>
  );
}
