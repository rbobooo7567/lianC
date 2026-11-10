import { QtyActions, StatusBadge } from "@/components/bits";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { useApp } from "@/app-state";
import {
  explain,
  heat,
  inFilter,
  sourceName,
  statusMeta,
  STORES,
  verdict,
  type FilterId,
  type Plan,
} from "@/lib/domain";
import { money, n0, n1 } from "@/lib/format";

const FILTERS: [FilterId, string][] = [
  ["todo", "要处理"],
  ["transfer", "调拨"],
  ["dc", "总仓"],
  ["supplier", "直送"],
  ["covered", "不必补"],
];

function matches(p: Plan, filter: FilterId) {
  if (filter === "covered") return p.source === "covered";
  return inFilter(p, filter);
}

export function ReplenishPage() {
  const { plans, state, setFilter } = useApp();
  const rows = plans.filter((p) => matches(p, state.filter));
  const current = plans.find((p) => p.id === state.selected) ?? null;

  return (
    <div className="flex flex-col items-start gap-4 xl:flex-row">
      <div className="min-w-0 w-full flex-1">
        <div className="mb-4">
          <Segmented
            label="补货筛选"
            value={state.filter}
            onChange={setFilter}
            options={FILTERS.map(([id, name]) => ({
              id,
              label: `${name} ${plans.filter((p) => matches(p, id)).length}`,
            }))}
          />
        </div>
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] apple-table border-collapse text-[13px]">
              <caption className="sr-only">补货建议</caption>
              <thead>
                <tr className="text-left text-[12px] text-mute">
                  <th className="px-4 py-2 font-medium">门店</th>
                  <th className="px-3 py-2 font-medium">商品</th>
                  <th className="px-3 py-2 font-medium">在店可售</th>
                  <th className="px-3 py-2 text-right font-medium">建议</th>
                  <th className="px-3 py-2 text-right font-medium">执行</th>
                  <th className="px-3 py-2 font-medium">方式</th>
                  <th className="px-4 py-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-mute">
                      没有要显示的行。
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => <PlanRow key={p.id} plan={p} selected={state.selected === p.id} />)
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {current ? <Detail plan={current} plans={plans} /> : null}
    </div>
  );
}

function PlanRow({ plan, selected }: { plan: Plan; selected: boolean }) {
  const { openPlan } = useApp();
  const sm = statusMeta(plan);
  return (
    <tr className={`border-t border-line ${selected ? "bg-ink/[0.04]" : ""}`}>
      <td className="px-4 py-2.5">{STORES[plan.store].name}</td>
      <td className="px-3 py-2.5">
        <Button type="button" variant="link" onClick={() => openPlan(plan.id)}>
          {plan.sku.name}
        </Button>
      </td>
      <td className="px-3 py-2.5">
        <StatusBadge label={`${n1(plan.dos)} 天`} tone={heat(plan.dos)} />
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{n0(plan.suggest)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {n0(plan.execQty)} {plan.sku.unit}
      </td>
      <td className="px-3 py-2.5">{sourceName(plan)}</td>
      <td className="px-4 py-2.5">
        <StatusBadge label={sm[0]} tone={sm[1]} />
      </td>
    </tr>
  );
}

function Detail({ plan, plans }: { plan: Plan; plans: Plan[] }) {
  const { state } = useApp();
  const sm = statusMeta(plan);
  const lines = explain(plan, plans);
  const who = state.decisions[plan.id]?.by;
  const reply =
    plan.status === "confirmed"
      ? `${who || "店长"}已确认，同一条已进入配货草稿。`
      : plan.status === "hold"
        ? `${who || "店长"}已暂缓，占用的数量已释放。`
        : plan.execQty > 0
          ? `待${STORES[plan.store].name}店长在企业微信里确认。`
          : "";
  return (
    <aside className="bezel w-full shrink-0 xl:sticky xl:top-4 xl:w-[340px]">
      <div className="bezel-core p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-medium tracking-tight">{STORES[plan.store].name}</h2>
        <StatusBadge label={sm[0]} tone={sm[1]} />
      </div>
      <p className="mt-1 text-[13px]">{plan.sku.name}</p>
      <p className="mt-3 text-[14px] font-medium leading-relaxed">{verdict(plan)}</p>
      {reply ? <p className="mt-2 text-[13px] leading-relaxed text-mute">{reply}</p> : null}
      <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink/90">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {plan.source === "covered" ? null : (
        <div className="mt-4">
          <QtyActions plan={plan} />
        </div>
      )}
      <p className="mt-3 text-[12px] text-mute">
        金额 {money(plan.execQty * plan.sku.price)} · 箱规 {plan.sku.case} {plan.sku.unit}
      </p>
      </div>
    </aside>
  );
}
