import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { useApp } from "@/app-state";
import { CATS, cellDetail, heat, MATRIX, STORES, STORE_ORDER, type Cat } from "@/lib/domain";
import { n1 } from "@/lib/format";

const LEGEND = [
  { label: "不足 2 天", tone: "bg-bad-bg text-bad" },
  { label: "2-4 天", tone: "bg-warn-bg text-warn" },
  { label: "21 天及以上", tone: "bg-over-bg text-over" },
];

export function MatrixPage() {
  const { plans, state, setCell, go } = useApp();
  const key = state.cell || "dxc|饮料";
  const [store, cat] = key.split("|") as [string, Cat];
  const lines = cellDetail(store, cat, plans);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-mute">
        {LEGEND.map((item) => (
          <span key={item.label} className={`inline-flex h-[22px] items-center rounded-full px-2 font-medium ${item.tone}`}>
            {item.label}
          </span>
        ))}
        <span>4-21 天不着色</span>
        <Button type="button" variant="link" onClick={() => go("alerts", "expiry")}>
          临期不改变格子颜色，去预警看滨江酸奶
        </Button>
      </div>
      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <Panel className="min-w-0 w-full flex-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] apple-table border-collapse text-[13px]">
              <caption className="sr-only">门店品类可售天数</caption>
              <thead>
                <tr className="text-[12px] text-mute">
                  <th className="px-4 py-2 text-left font-medium">门店</th>
                  {CATS.map((c) => (
                    <th key={c} className="px-1 py-2 text-center font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STORE_ORDER.map((id) => (
                  <tr key={id} className="border-t border-line">
                    <td className="px-4 py-1.5">
                      <div>{STORES[id].name}</div>
                      <div className="text-[12px] text-mute">{STORES[id].region}</div>
                    </td>
                    {CATS.map((c) => {
                      const dos = MATRIX[id][c];
                      const cellKey = `${id}|${c}`;
                      const tone = heat(dos);
                      const on = state.cell === cellKey;
                      const bg =
                        tone === "bad"
                          ? "bg-bad-bg text-bad"
                          : tone === "warn"
                            ? "bg-warn-bg text-warn"
                            : tone === "over"
                              ? "bg-over-bg text-over"
                              : "text-ink";
                      return (
                        <td key={c} className={`heat-cell ${bg} ${on ? "is-selected" : ""}`}>
                          <button
                            type="button"
                            onClick={() => setCell(cellKey)}
                            aria-pressed={on}
                            className="font-medium tabular-nums"
                          >
                            {n1(dos)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <aside className="bezel w-full shrink-0 xl:sticky xl:top-4 xl:w-[340px]">
          <div className="bezel-core p-5">
          <h2 className="text-[20px] font-semibold tracking-[-0.03em]">
            {STORES[store].name} · {cat}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-mute">
            格子上的 {n1(MATRIX[store][cat])} 天，是这个品类今早的最短在店可售，不含在途。
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-[13px] leading-relaxed">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
