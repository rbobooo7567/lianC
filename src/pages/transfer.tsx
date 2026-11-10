import { StatusBadge } from "@/components/bits";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { useApp } from "@/app-state";
import { heat, statusMeta, STORES } from "@/lib/domain";
import { n0, n1 } from "@/lib/format";

export function TransferPage() {
  const { plans, openPlan } = useApp();
  const rows = plans.filter((p) => p.source === "transfer");

  return (
    <div className="space-y-3">
      <p className="max-w-[72ch] text-[13px] leading-relaxed text-mute">
        调出后至少保留 14 天用量，并按箱规取整。同一调出店按表中顺序扣减。老城店纸品调出后仍然滞销，清库存要另做促销，不在这条调拨里一次出清。
      </p>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] apple-table border-collapse text-[13px]">
            <caption className="sr-only">店间调拨</caption>
            <thead>
              <tr className="text-left text-[12px] text-mute">
                <th className="px-4 py-2 font-medium">商品</th>
                <th className="px-3 py-2 font-medium">调出</th>
                <th className="px-3 py-2 text-right font-medium">调出前 → 后</th>
                <th className="px-3 py-2 text-right font-medium">数量</th>
                <th className="px-3 py-2 font-medium">调入</th>
                <th className="px-3 py-2 font-medium">调入可售</th>
                <th className="px-3 py-2 font-medium">盘点</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-4 py-2 font-medium">
                  <span className="sr-only">计算</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const sm = statusMeta(p);
                const stale = STORES[p.from].stale >= 21;
                return (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-4 py-2.5">{p.sku.name}</td>
                    <td className="px-3 py-2.5">{STORES[p.from].name}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {n1(p.fromDosBefore)} → {n1(p.fromDosAfter)} 天
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {n0(p.execQty)} {p.sku.unit}
                    </td>
                    <td className="px-3 py-2.5">{STORES[p.store].name}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge label={`${n1(p.dos)} 天`} tone={heat(p.dos)} />
                    </td>
                    <td className="px-3 py-2.5">
                      {stale ? (
                        <StatusBadge label={`${STORES[p.from].stale} 天未盘点`} tone="warn" />
                      ) : (
                        "已盘点"
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge label={sm[0]} tone={sm[1]} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Button type="button" size="sm" variant="outline" onClick={() => openPlan(p.id)}>
                        计算
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
