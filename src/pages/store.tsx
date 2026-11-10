import { QtyActions, StatusBadge } from "@/components/bits";
import { useApp } from "@/app-state";
import { findActor } from "@/lib/actors";
import {
  ANOM,
  EXP,
  OVER,
  SKUS,
  sourceName,
  statusMeta,
  STORES,
  STORE_ORDER,
  type Plan,
} from "@/lib/domain";
import { money, n0, n1 } from "@/lib/format";

type Task = {
  key: string;
  title: string;
  tag: string;
  tone: "" | "bad" | "warn" | "over" | "ok";
  text: string;
  plan: Plan | null;
};

export function StorePage() {
  const { plans, state, setManagerStore } = useApp();
  const actor = findActor(state.actorId);
  const locked = Boolean(actor.store);
  const id = locked ? actor.store : state.managerStore;
  const sections = storeSections(id, plans);
  const pending = sections.reduce(
    (sum, sec) => sum + sec.rows.filter((row) => row.plan && row.plan.status === "pending" && row.plan.execQty > 0).length,
    0,
  );
  const storeName = STORES[id].name;

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      <div className="bezel w-full max-w-sm">
        <div className="bezel-core p-5">
          <p className="text-[10px] font-medium tracking-[0.18em] text-mute">企业微信</p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em]">链存</h2>
          <p className="mt-1 text-[12px] text-mute">11:40 · 日配截单 14:00</p>
          <p className="mt-4 text-[14px] leading-relaxed">
            {pending > 0
              ? `${storeName}还有 ${pending} 条待确认，请在 14:00 前处理。`
              : `${storeName}今日待确认已处理完。`}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-mute">
            {locked
              ? `${actor.name}打开这条消息，只能看到${storeName}。确认或暂缓后，总部同一条会显示${actor.name}已回写。`
              : "这是下发给店长的消息。点一家店预览手机。要替店长确认，把左下角身份换成该店店长。"}
          </p>
          {locked ? null : (
            <div className="mt-4 grid gap-2">
              {STORE_ORDER.map((sid) => {
                const count = plans.filter(
                  (p) =>
                    (p.store === sid || (p.source === "transfer" && p.from === sid)) &&
                    p.status === "pending" &&
                    p.execQty > 0,
                ).length;
                const on = sid === id;
                return (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => setManagerStore(sid)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] ${on ? "bg-ink/[0.06]" : "hover:bg-ink/[0.04]"}`}
                  >
                    <span>{STORES[sid].name}</span>
                    <span className="text-mute">{count > 0 ? `${count} 条待确认` : "已处理"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="w-[372px] max-w-full rounded-[42px] bg-[#1c1b19] p-2.5 shadow-[0_32px_64px_-36px_color-mix(in_srgb,#1c1b19_55%,transparent)] dark:bg-[#3a3a3c]">
        <div className="flex h-[700px] flex-col overflow-hidden rounded-[32px] bg-surface">
        <div className="flex h-12 items-end justify-between px-6 pb-1">
          <span className="text-[15px] font-semibold tracking-[-0.02em] tabular-nums">11:40</span>
          <span className="text-[12px] text-mute">
            {STORES[id].name} {STORES[id].region}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-5 pt-2 pb-4">
          <p className="text-[17px] font-semibold tracking-[-0.02em]">今日要处理</p>
          <p className="mt-1 text-[12px] text-mute">
            {locked ? `${actor.name} · ${storeName}` : `${storeName}预览`} · 截单 14:00
          </p>
          <div className="mt-4 rounded-xl bg-ink/[0.04] px-3 py-3">
            <p className="text-[12px] font-medium">链存</p>
            <p className="mt-1 text-[13px] leading-relaxed">
              {pending > 0 ? `还有 ${pending} 条待确认，请在 14:00 前处理。` : "今日待确认已处理完。"}
            </p>
          </div>
          {sections.length === 0 ? (
            <p className="mt-8 text-[13px] text-mute">本店今天没有要处理的行。</p>
          ) : (
            sections.map((sec) => (
              <section key={sec.title} className="mt-5">
                <h2 className="text-[12px] font-medium text-mute">{sec.title}</h2>
                {sec.rows.map((row) => (
                  <article key={row.key} className="border-b border-line py-3">
                    {row.title ? (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-medium">{row.title}</p>
                        {row.tag ? <StatusBadge label={row.tag} tone={row.tone} /> : null}
                      </div>
                    ) : null}
                    <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{row.text}</p>
                    {row.plan ? (
                      <div className="mt-2">
                        <QtyActions plan={row.plan} />
                        {state.decisions[row.plan.id]?.by ? (
                          <p className="mt-2 text-[12px] text-mute">{state.decisions[row.plan.id].by}已回写，总部可见同一条。</p>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </section>
            ))
          )}
        </div>
        <div className="flex justify-center pt-1 pb-2">
          <div className="h-[5px] w-[120px] rounded-full bg-ink/20" aria-hidden />
        </div>
        </div>
      </div>
    </div>
  );
}

function storeSections(storeId: string, plans: Plan[]) {
  const sections: { title: string; rows: Task[] }[] = [];
  const outbound = plans.filter((p) => p.source === "transfer" && p.from === storeId);
  const inbound = plans.filter((p) => p.store === storeId && p.source === "transfer");
  const orders = plans.filter((p) => p.store === storeId && (p.source === "dc" || p.source === "supplier"));
  const covered = plans.filter((p) => p.store === storeId && p.source === "covered");

  if (outbound.length) {
    sections.push({
      title: "待确认调出",
      rows: outbound.map((p) => {
        const sm = statusMeta(p);
        return {
          key: p.id,
          title: p.sku.name,
          tag: sm[0],
          tone: sm[1],
          text: `调给${STORES[p.store].name} ${n0(p.execQty)}${p.sku.unit}。调出前可售 ${n1(p.fromDosBefore)} 天，调出后 ${n1(p.fromDosAfter)} 天。`,
          plan: p,
        };
      }),
    });
  }
  if (inbound.length) {
    sections.push({
      title: "今日调入",
      rows: inbound.map((p) => ({
        key: p.id,
        title: p.sku.name,
        tag: "从" + STORES[p.from].name,
        tone: "" as const,
        text: `你店可售 ${n1(p.dos)} 天。调入 ${n0(p.execQty)}${p.sku.unit}。${p.status === "confirmed" ? "总部状态：已确认。" : "确认本店收得下。"}`,
        plan: p,
      })),
    });
  }
  if (orders.length) {
    sections.push({
      title: "总仓 / 直送",
      rows: orders.map((p) => ({
        key: p.id,
        title: p.sku.name,
        tag: p.blocked ? "总仓不足" : sourceName(p),
        tone: p.blocked ? ("bad" as const) : ("warn" as const),
        text: p.blocked
          ? `需求取整 ${n0(p.suggest)}${p.sku.unit}，总仓分完后本店是 0。先用现货顶 ${n1(p.dos)} 天。`
          : `建议执行 ${n0(p.execQty)}${p.sku.unit}。在店可售 ${n1(p.dos)} 天。`,
        plan: p.blocked ? null : p,
      })),
    });
  }
  if (covered.length) {
    sections.push({
      title: "今天不必补",
      rows: covered.map((p) => ({
        key: p.id,
        title: p.sku.name,
        tag: "在途已覆盖",
        tone: "ok" as const,
        text: `在店 ${n0(p.sellable)}，在途 ${n0(p.transit)}，含在途可售 ${n1(p.dosAll)} 天，已高于目标 ${n1(p.targetQty)}${p.sku.unit}。`,
        plan: null,
      })),
    });
  }

  const alerts: string[] = [];
  OVER.filter((o) => o.store === storeId).forEach((o) => {
    const sku = SKUS[o.sku];
    const dos = o.onHand / o.daily;
    if (outbound.some((p) => p.sku.id === o.sku)) return;
    alerts.push(`${sku.name} 可售 ${n1(dos)} 天，金额 ${money(o.onHand * sku.price)}。${dos >= 60 ? "滞销，先清后进。" : "刚过超储线。"}`);
  });
  ANOM.filter((a) => a.store === storeId).forEach((a) => {
    const sku = SKUS[a.sku];
    alerts.push(`${sku.name} 今日卖了 ${a.today}${sku.unit}，日均 ${n1(a.daily)}。${a.note}`);
  });
  EXP.filter((a) => a.store === storeId).forEach((a) => {
    const sku = SKUS[a.sku];
    alerts.push(`${sku.name} 有 ${a.expiring}${sku.unit} 将在 ${a.daysLeft} 天内到期。大约 ${n1(a.expiring / a.daily)} 天能卖完，建议堆头，不要补货。`);
  });
  if (STORES[storeId].stale >= 21) {
    alerts.push(`本店已 ${STORES[storeId].stale} 天没有盘点。调出数量以实盘为准。`);
  }
  if (alerts.length) {
    sections.push({
      title: "本店预警",
      rows: alerts.map((text, i) => ({
        key: `alert-${i}`,
        title: "",
        tag: "",
        tone: "" as const,
        text,
        plan: null,
      })),
    });
  }
  return sections;
}
