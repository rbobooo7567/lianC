import { motion, useReducedMotion } from "motion/react";
import { EmptyRow, StatusBadge } from "@/components/bits";
import { Panel, PanelHeader } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { useApp } from "@/app-state";
import { categoryMins, dcNotes, heat, overValue, sourceName, statusMeta, STORES } from "@/lib/domain";
import { actorForStore } from "@/lib/actors";
import { money, n0, n1 } from "@/lib/format";

const RULES = [
  "在店可售不足 2 天的，先从富余店调拨。",
  "调出后，对方至少留下 14 天用量。",
  "还缺的部分用总仓现货，按可售天数从短到长分。",
  "总仓不备的商品，开供应商直送，交期算进目标天数。",
  "当天销量突然放大的，先确认原因，不改日均。",
];

export function HomePage() {
  const { plans, openPlan, state } = useApp();
  const reduce = useReducedMotion();
  const risks = plans.filter((p) => p.dos < 2).sort((a, b) => a.dos - b.dos);
  const riskStores = new Set(risks.map((p) => p.store));
  const executable = plans.filter((p) => p.execQty > 0 && p.status !== "hold");
  const transfers = executable.filter((p) => p.source === "transfer");
  const notes = dcNotes(plans);
  const mins = categoryMins();
  const metrics = [
    { value: `${riskStores.size} 家`, label: "可售不足 2 天的门店", hot: true },
    { value: String(executable.length), label: "今天可执行", hot: false },
    { value: String(transfers.length), label: "店间调拨", hot: false },
    { value: money(overValue(60)), label: "滞销库存（可售 ≥ 60 天）", hot: false },
  ];

  const replies = plans.filter(
    (p) => p.source !== "covered" && (p.execQty > 0 || p.status === "confirmed" || p.status === "hold"),
  );
  const ease = [0.32, 0.72, 0, 1] as const;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="bezel"
        >
          <div className="bezel-core h-full px-5 py-5">
            <p className="text-[40px] leading-none font-semibold tracking-[-0.045em] text-bad tabular-nums">
              {riskStores.size}
              <span className="ml-1.5 text-[18px] font-medium tracking-normal">家</span>
            </p>
            <p className="mt-3 text-[12px] leading-5 text-mute">{metrics[0].label}</p>
          </div>
        </motion.div>
        {metrics.slice(1).map((item, i) => (
          <motion.div
            key={item.label}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06 * (i + 1), ease }}
            className="bezel"
          >
            <div className="bezel-core h-full px-5 py-5">
              <p className="text-[28px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{item.value}</p>
              <p className="mt-3 text-[12px] leading-5 text-mute">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {notes.length ? (
        <div className="rounded-[1.25rem] bg-warn-bg px-5 py-4 text-[13px] leading-relaxed text-warn">
          {notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      ) : null}

      <Panel>
        <PanelHeader title="店长回写" aside="已下发到各店企业微信" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] apple-table border-collapse text-[13px]">
            <caption className="sr-only">店长回写</caption>
            <thead>
              <tr className="text-left text-[12px] text-mute">
                <th className="px-4 py-2 font-medium">门店</th>
                <th className="px-3 py-2 font-medium">商品</th>
                <th className="px-3 py-2 font-medium">方式</th>
                <th className="px-4 py-2 font-medium">回写</th>
              </tr>
            </thead>
            <tbody>
              {replies.length === 0 ? (
                <EmptyRow colSpan={4}>今天没有要店长确认的行。</EmptyRow>
              ) : (
                replies.map((p) => {
                  const who = state.decisions[p.id]?.by;
                  const manager = actorForStore(p.store);
                  const reply =
                    p.status === "confirmed"
                      ? `${who || manager.name}已确认`
                      : p.status === "hold"
                        ? `${who || manager.name}已暂缓`
                        : `待${manager.name}确认`;
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-2.5">{STORES[p.store].name}</td>
                      <td className="px-3 py-2.5">
                        <Button type="button" variant="link" onClick={() => openPlan(p.id)}>
                          {p.sku.name}
                        </Button>
                      </td>
                      <td className="px-3 py-2.5">{sourceName(p)}</td>
                      <td className="px-4 py-2.5">{reply}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
        <Panel>
          <PanelHeader title="不足 2 天" aside={`${risks.length} 条`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] apple-table border-collapse text-[13px]">
              <caption className="sr-only">在店可售不足 2 天</caption>
              <thead>
                <tr className="text-left text-[12px] text-mute">
                  <th className="px-4 py-2 font-medium">门店</th>
                  <th className="px-3 py-2 font-medium">商品</th>
                  <th className="px-3 py-2 font-medium">在店可售</th>
                  <th className="px-3 py-2 font-medium">方式</th>
                  <th className="px-3 py-2 text-right font-medium">执行量</th>
                  <th className="px-4 py-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {risks.length === 0 ? (
                  <EmptyRow colSpan={6}>没有不足 2 天的商品。</EmptyRow>
                ) : (
                  risks.map((p) => {
                    const sm = statusMeta(p);
                    return (
                      <tr key={p.id} className="border-t border-line">
                        <td className="px-4 py-2.5">{STORES[p.store].name}</td>
                        <td className="px-3 py-2.5">
                          <Button type="button" variant="link" onClick={() => openPlan(p.id)}>
                            {p.sku.name}
                          </Button>
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge label={`${n1(p.dos)} 天`} tone={heat(p.dos)} />
                        </td>
                        <td className="px-3 py-2.5">{sourceName(p)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {n0(p.execQty)} {p.sku.unit}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge label={sm[0]} tone={sm[1]} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[10px] font-medium tracking-[0.18em] text-mute">顺序</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em]">今天的处理顺序</h2>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-[13px] leading-relaxed">
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="各品类最短可售天数" aside="8 店里的最低值，不含在途" />
        <ul className="grid gap-x-10 px-4 sm:grid-cols-2">
          {mins.map((c) => (
            <li key={c.cat} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
              <span className="text-[13px]">{c.cat}</span>
              <span className="text-right">
                <span className={`block text-[15px] font-medium tabular-nums ${heat(c.dos) === "bad" ? "text-bad" : heat(c.dos) === "warn" ? "text-warn" : heat(c.dos) === "over" ? "text-over" : "text-ink"}`}>
                  {n1(c.dos)} 天
                </span>
                <span className="text-[12px] text-mute">{STORES[c.store].name}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
