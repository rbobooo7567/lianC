import { useEffect, useState } from "react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/app-state";
import { CATS, SKUS, type Cat, type CatConfig } from "@/lib/domain";

export function ParamsPage() {
  const { state, saveConfig } = useApp();
  const [draft, setDraft] = useState<Record<Cat, CatConfig>>(state.config);

  useEffect(() => {
    setDraft(state.config);
  }, [state.config]);

  function setField(cat: Cat, key: keyof CatConfig, raw: string) {
    if (raw !== "" && !/^\d{1,2}$/.test(raw)) return;
    const v = raw === "" ? 0 : Number(raw);
    if (v > 30) return;
    setDraft((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [key]: v },
    }));
  }

  function save() {
    const next = {} as Record<Cat, CatConfig>;
    CATS.forEach((cat) => {
      next[cat] = {
        lead: clamp(draft[cat].lead),
        safety: clamp(draft[cat].safety),
      };
    });
    saveConfig(next);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <p className="max-w-[68ch] text-[13px] leading-relaxed text-mute">
        目标天数 = 配送周期 + 安全天数。保存后，今日建议量、调拨量和总仓分配会重算。超储线 21 天、滞销线 60 天、调出保底 14 天，演示里先固定。
      </p>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] apple-table border-collapse text-[13px]">
            <caption className="sr-only">品类配送参数</caption>
            <thead>
              <tr className="text-left text-[12px] text-mute">
                <th className="px-4 py-2 font-medium">品类</th>
                <th className="px-3 py-2 font-medium">配送周期（天）</th>
                <th className="px-3 py-2 font-medium">安全天数</th>
                <th className="px-4 py-2 text-right font-medium">目标覆盖</th>
              </tr>
            </thead>
            <tbody>
              {CATS.map((cat) => (
                <tr key={cat} className="border-t border-line">
                  <td className="px-4 py-2.5">{cat}</td>
                  <td className="px-3 py-2.5">
                    <label className="sr-only" htmlFor={`${cat}-lead`}>
                      {cat} 配送周期
                    </label>
                    <Input
                      id={`${cat}-lead`}
                      className="w-24"
                      type="number"
                      min={0}
                      max={30}
                      value={draft[cat].lead}
                      onChange={(e) => setField(cat, "lead", e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <label className="sr-only" htmlFor={`${cat}-safety`}>
                      {cat} 安全天数
                    </label>
                    <Input
                      id={`${cat}-safety`}
                      className="w-24"
                      type="number"
                      min={0}
                      max={30}
                      value={draft[cat].safety}
                      onChange={(e) => setField(cat, "safety", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {clamp(draft[cat].lead) + clamp(draft[cat].safety)} 天
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3">
          <Button type="button" onClick={save}>
            保存并重算今日建议
          </Button>
        </div>
      </Panel>

      <section>
        <h2 className="text-[15px] font-medium tracking-tight">箱规</h2>
        <Panel className="mt-3">
          <table className="w-full apple-table border-collapse text-[13px]">
            <caption className="sr-only">箱规</caption>
            <thead>
              <tr className="text-left text-[12px] text-mute">
                <th className="px-4 py-2 font-medium">商品</th>
                <th className="px-3 py-2 font-medium">品类</th>
                <th className="px-4 py-2 text-right font-medium">箱规</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SKUS).map((sku) => (
                <tr key={sku.id} className="border-t border-line">
                  <td className="px-4 py-2.5">{sku.name}</td>
                  <td className="px-3 py-2.5">{sku.cat}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {sku.case} {sku.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      <section>
        <h2 className="text-[15px] font-medium tracking-tight">二期再打开</h2>
        <Panel className="mt-3">
          <div className="space-y-2 px-4 py-4 text-[13px] leading-relaxed">
            <p>档期系数：周末、促销按品类乘到日均上。一期日均不含这层系数。</p>
            <p>新品前 14 天不判滞销。活动锁库存不参与总仓分配。</p>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function clamp(v: number) {
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > 30) return 30;
  return v;
}
