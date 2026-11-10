import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { useApp } from "@/app-state";
import { FEATURES, type Screen } from "@/lib/domain";

const PHASES = ["一期", "二期"];

export function ListPage() {
  const { go, setModal } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => go("matrix")}>
            看可售天数
          </Button>
          <span className="text-mute" aria-hidden>
            →
          </span>
          <Button type="button" variant="outline" onClick={() => go("transfer")}>
            先调拨
          </Button>
          <span className="text-mute" aria-hidden>
            →
          </span>
          <Button type="button" variant="outline" onClick={() => go("replenish")}>
            再分总仓
          </Button>
          <span className="text-mute" aria-hidden>
            →
          </span>
          <Button type="button" variant="outline" onClick={() => go("store")}>
            店长确认
          </Button>
          <span className="text-mute" aria-hidden>
            →
          </span>
          <Button type="button" variant="outline" onClick={() => setModal(true)}>
            导出草稿
          </Button>
        </div>
        <p className="mt-3 max-w-[72ch] text-[13px] leading-relaxed text-mute">
          口径：在店可售天数 =（账面 − 占用）÷ 日均，不含在途。建议量会再减去在途。日均不含未结束的当天，也剔除异常日。演示日是 2026-10-09，连锁 8 家店。
        </p>
      </div>

      {PHASES.map((phase) => {
        const items = FEATURES.filter((f) => f[0] === phase);
        const modules: string[] = [];
        items.forEach((f) => {
          if (!modules.includes(f[1])) modules.push(f[1]);
        });
        return (
          <section key={phase} className="space-y-4">
            <h2 className="text-[15px] font-medium tracking-tight">
              {phase} · {items.length} 项
            </h2>
            {modules.map((mod) => (
              <div key={mod}>
                <h3 className="mb-2 text-[13px] font-medium">{mod}</h3>
                <Panel>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] apple-table border-collapse text-[13px]">
                      <caption className="sr-only">
                        {phase} {mod}
                      </caption>
                      <thead>
                        <tr className="text-left text-[12px] text-mute">
                          <th className="px-4 py-2 font-medium">功能</th>
                          <th className="px-3 py-2 font-medium">谁用</th>
                          <th className="px-3 py-2 font-medium">说明</th>
                          <th className="px-4 py-2 font-medium">
                            <span className="sr-only">打开</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items
                          .filter((f) => f[1] === mod)
                          .map((f) => (
                            <tr key={f[2]} className="border-t border-line">
                              <td className="px-4 py-2.5 whitespace-nowrap">{f[2]}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap">{f[3]}</td>
                              <td className="px-3 py-2.5 leading-relaxed">{f[5]}</td>
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                {f[4] ? (
                                  <Button type="button" variant="link" onClick={() => go(f[4] as Screen)}>
                                    打开
                                  </Button>
                                ) : phase === "一期" ? (
                                  "实施项"
                                ) : (
                                  "二期"
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
