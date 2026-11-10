import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { StatusBadge } from "@/components/bits";
import { useApp } from "@/app-state";
import {
  ANOM,
  EXP,
  OVER,
  SKUS,
  sourceName,
  STORES,
  STORE_ORDER,
  type AlertTab,
  type Plan,
} from "@/lib/domain";
import { money, n0, n1 } from "@/lib/format";

const TABS: [AlertTab, string][] = [
  ["stockout", "缺货"],
  ["over", "超储"],
  ["anom", "异常销量"],
  ["expiry", "临期"],
  ["count", "未盘点"],
];

export function AlertsPage() {
  const { plans, state, setAlertTab, openPlan } = useApp();

  return (
    <div className="space-y-3">
      <Segmented
        label="预警分类"
        value={state.alertTab}
        onChange={setAlertTab}
        options={TABS.map(([id, name]) => ({ id, label: name }))}
      />
      <Panel>
        <div className="overflow-x-auto">
          {state.alertTab === "stockout" ? <Stockout plans={plans} openPlan={openPlan} /> : null}
          {state.alertTab === "over" ? <Overstock /> : null}
          {state.alertTab === "anom" ? <Anomaly /> : null}
          {state.alertTab === "expiry" ? <Expiry /> : null}
          {state.alertTab === "count" ? <Counts /> : null}
        </div>
      </Panel>
    </div>
  );
}

function Stockout({
  plans,
  openPlan,
}: {
  plans: Plan[];
  openPlan: (id: string) => void;
}) {
  const rows = plans.filter((p) => p.dos < 2).sort((a, b) => a.dos - b.dos);
  return (
      <table className="w-full min-w-[760px] apple-table border-collapse text-[13px]">
        <caption className="sr-only">缺货</caption>
        <thead>
          <tr className="text-left text-[12px] text-mute">
            <th className="px-4 py-2 font-medium">门店</th>
            <th className="px-3 py-2 font-medium">商品</th>
            <th className="px-3 py-2 font-medium">在店可售</th>
            <th className="px-3 py-2 font-medium">今天怎么处理</th>
            <th className="px-3 py-2 text-right font-medium">执行量</th>
            <th className="px-4 py-2 font-medium">
              <span className="sr-only">打开</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-mute">
                没有缺货行。
              </td>
            </tr>
          ) : (
            rows.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-2.5">{STORES[p.store].name}</td>
                <td className="px-3 py-2.5">{p.sku.name}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge label={`${n1(p.dos)} 天`} tone="bad" />
                </td>
                <td className="px-3 py-2.5">{sourceName(p)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {n0(p.execQty)} {p.sku.unit}
                </td>
                <td className="px-4 py-2.5">
                  <Button type="button" variant="link" onClick={() => openPlan(p.id)}>
                    打开建议
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
  );
}

function Overstock() {
  return (
    <table className="w-full min-w-[720px] apple-table border-collapse text-[13px]">
      <caption className="sr-only">超储与滞销</caption>
      <thead>
        <tr className="text-left text-[12px] text-mute">
          <th className="px-4 py-2 font-medium">门店</th>
          <th className="px-3 py-2 font-medium">商品</th>
          <th className="px-3 py-2 font-medium">可售</th>
          <th className="px-3 py-2 text-right font-medium">库存</th>
          <th className="px-3 py-2 text-right font-medium">金额</th>
          <th className="px-4 py-2 font-medium">类型</th>
        </tr>
      </thead>
      <tbody>
        {OVER.map((o) => {
          const sku = SKUS[o.sku];
          const dos = o.onHand / o.daily;
          return (
            <tr key={`${o.store}-${o.sku}`} className="border-t border-line">
              <td className="px-4 py-2.5">{STORES[o.store].name}</td>
              <td className="px-3 py-2.5">{sku.name}</td>
              <td className="px-3 py-2.5">
                <StatusBadge label={`${n1(dos)} 天`} tone="over" />
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {n0(o.onHand)} {sku.unit}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{money(o.onHand * sku.price)}</td>
              <td className="px-4 py-2.5">{dos >= 60 ? "滞销" : "刚过线"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Anomaly() {
  return (
    <table className="w-full min-w-[720px] apple-table border-collapse text-[13px]">
      <caption className="sr-only">异常销量</caption>
      <thead>
        <tr className="text-left text-[12px] text-mute">
          <th className="px-4 py-2 font-medium">门店</th>
          <th className="px-3 py-2 font-medium">商品</th>
          <th className="px-3 py-2 text-right font-medium">今日销量</th>
          <th className="px-3 py-2 text-right font-medium">日均</th>
          <th className="px-4 py-2 font-medium">处理</th>
        </tr>
      </thead>
      <tbody>
        {ANOM.map((a) => {
          const sku = SKUS[a.sku];
          return (
            <tr key={`${a.store}-${a.sku}`} className="border-t border-line">
              <td className="px-4 py-2.5">{STORES[a.store].name}</td>
              <td className="px-3 py-2.5">{sku.name}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{n0(a.today)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{n1(a.daily)}</td>
              <td className="px-4 py-2.5 leading-relaxed">{a.note}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Expiry() {
  return (
    <table className="w-full min-w-[760px] apple-table border-collapse text-[13px]">
      <caption className="sr-only">临期</caption>
      <thead>
        <tr className="text-left text-[12px] text-mute">
          <th className="px-4 py-2 font-medium">门店</th>
          <th className="px-3 py-2 font-medium">商品</th>
          <th className="px-3 py-2 text-right font-medium">临期数量</th>
          <th className="px-3 py-2 text-right font-medium">剩余到期</th>
          <th className="px-4 py-2 font-medium">建议</th>
        </tr>
      </thead>
      <tbody>
        {EXP.map((a) => {
          const sku = SKUS[a.sku];
          return (
            <tr key={`${a.store}-${a.sku}`} className="border-t border-line">
              <td className="px-4 py-2.5">{STORES[a.store].name}</td>
              <td className="px-3 py-2.5">{sku.name}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {a.expiring} {sku.unit}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{a.daysLeft} 天</td>
              <td className="px-4 py-2.5 leading-relaxed">
                日均 {n1(a.daily)}，大约 {n1(a.expiring / a.daily)} 天能卖完。建议堆头，不要补货。
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Counts() {
  const rows = STORE_ORDER.filter((id) => STORES[id].stale >= 21);
  return (
    <table className="w-full min-w-[640px] apple-table border-collapse text-[13px]">
      <caption className="sr-only">超期未盘点</caption>
      <thead>
        <tr className="text-left text-[12px] text-mute">
          <th className="px-4 py-2 font-medium">门店</th>
          <th className="px-3 py-2 text-right font-medium">距上次盘点</th>
          <th className="px-4 py-2 font-medium">影响</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-4 py-10 text-center text-mute">
              没有超期未盘点的门店。
            </td>
          </tr>
        ) : (
          rows.map((id) => (
            <tr key={id} className="border-t border-line">
              <td className="px-4 py-2.5">{STORES[id].name}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{STORES[id].stale} 天</td>
              <td className="px-4 py-2.5 leading-relaxed">
                超储和调出数量以实盘为准。老城店维达抽纸的调拨，出库前先盘点。
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
