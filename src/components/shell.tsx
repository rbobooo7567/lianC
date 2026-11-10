import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowsLeftRight,
  ClipboardText,
  DeviceMobile,
  GridFour,
  ListBullets,
  Moon,
  SlidersHorizontal,
  SquaresFour,
  Sun,
  Warning,
  type Icon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/app-state";
import { ACTORS, findActor } from "@/lib/actors";
import { STORES, type Screen } from "@/lib/domain";

const NAV: { label: string; items: { id: Screen; name: string; icon: Icon }[] }[] = [
  {
    label: "工作",
    items: [
      { id: "home", name: "总览", icon: SquaresFour },
      { id: "replenish", name: "补货建议", icon: ClipboardText },
      { id: "transfer", name: "店间调拨", icon: ArrowsLeftRight },
      { id: "matrix", name: "门店可售", icon: GridFour },
      { id: "alerts", name: "预警中心", icon: Warning },
    ],
  },
  {
    label: "现场",
    items: [{ id: "store", name: "店长端", icon: DeviceMobile }],
  },
  {
    label: "范围",
    items: [
      { id: "params", name: "参数", icon: SlidersHorizontal },
      { id: "list", name: "功能清单", icon: ListBullets },
    ],
  },
];

const COPY: Record<Screen, { title: string; text?: string; meta?: string[] }> = {
  home: {
    title: "今日总览",
    meta: ["鲜邻生活", "8 家店", "2026-10-09 周五", "日配截单 14:00", "演示时点 11:40"],
  },
  replenish: {
    title: "补货建议",
    text: "执行量已按箱规、总仓现货和调出店 14 天保底算过。确认后进入配货草稿。",
  },
  transfer: {
    title: "店间调拨",
    text: "富余店补缺口店。调出后仍留下至少 14 天用量。",
  },
  matrix: {
    title: "门店可售",
    text: "数字是品类内最短在店可售天数。低于 2 天先处理，在途不进这个格子。",
  },
  alerts: {
    title: "预警中心",
    text: "缺货、超储、异常销量、临期、未盘点分五类处理。",
  },
  store: {
    title: "店长端",
    text: "右侧是店长手机。总部在这里看下发了哪些消息。换成店长身份后，只能处理本店。",
  },
  params: {
    title: "参数",
    text: "改安全天数或配送周期后重算。箱规来自商品主数据。",
  },
  list: {
    title: "功能清单",
    text: "一期可以写进合同。二期留作增购。点「打开」进对应界面。",
  },
};

export function Shell({ children }: { children: ReactNode }) {
  const { state, plans, theme, toggleTheme, go, setModal, setActor } = useApp();
  const reduce = useReducedMotion();
  const actor = findActor(state.actorId);
  const manager = Boolean(actor.store);
  const nav = manager
    ? [{ label: "本店", items: [{ id: "store" as Screen, name: "今日要处理", icon: DeviceMobile }] }]
    : NAV;
  const pending = plans.filter((p) => p.status === "pending" && p.execQty > 0).length;
  const page = manager
    ? {
        title: "今日要处理",
        text: `${actor.name} · ${STORES[actor.store].name}店长。企业微信消息打开的就是这一页，确认后总部看到同一条。`,
      }
    : COPY[state.screen];
  const showExport = !manager && (state.screen === "home" || state.screen === "replenish");

  return (
    <div className="relative min-h-[100dvh] md:flex">
      <a className="skip-link" href="#content">
        跳到内容
      </a>
      <aside className="sticky top-3 z-20 mx-3 mt-3 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-y-auto rounded-[1.5rem] bg-surface shadow-[0_0_0_0.5px_var(--line),inset_0_1px_0_color-mix(in_srgb,white_70%,transparent),0_28px_56px_-36px_color-mix(in_srgb,var(--ink)_42%,transparent)] md:mx-0 md:ml-3 md:h-[calc(100dvh-1.5rem)] md:w-[232px] md:max-h-none md:shrink-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-1 md:px-3 md:pt-5">
          <div className="min-w-0 px-1">
            <p className="text-[15px] font-semibold tracking-[-0.03em]">链存</p>
            <p className="text-[12px] text-mute">连锁补货预警</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换到浅色" : "切换到深色"}
            className="flex size-8 items-center justify-center rounded-lg text-mute transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.06] hover:text-ink active:scale-[0.98]"
          >
            {theme === "dark" ? <Sun size={16} weight="light" /> : <Moon size={16} weight="light" />}
          </button>
        </div>
        <nav className="flex flex-wrap gap-x-1 px-2 py-2 md:block md:flex-1 md:overflow-y-auto md:px-2">
          {nav.map((group) => (
            <div key={group.label} className="contents md:mt-3 md:block">
              <p className="hidden px-2.5 pt-2 pb-1 text-[11px] tracking-[0.14em] text-mute md:block">{group.label}</p>
              {group.items.map((item) => {
                const on = state.screen === item.id;
                const Icon = item.icon;
                const badge = item.id === "replenish" && pending > 0 ? pending : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className="relative flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] text-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] md:w-full"
                  >
                    {on && !reduce ? (
                      <motion.span
                        layoutId="nav-current"
                        className="absolute inset-0 rounded-lg bg-ink/[0.07]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    {on && reduce ? <span className="absolute inset-0 rounded-lg bg-ink/[0.07]" /> : null}
                    <Icon size={16} weight="light" className={`relative ${on ? "text-ink" : "text-mute"}`} />
                    <span className="relative">{item.name}</span>
                    {badge ? (
                      <span className="relative ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md bg-bad-bg px-1 text-[11px] font-medium text-bad">
                        {badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <label className="grid gap-1 px-3 pt-3 pb-4 text-[12px] text-mute">
          演示身份
          <select
            className="h-9 rounded-lg border border-line bg-surface px-2 text-[13px] text-ink"
            value={actor.id}
            onChange={(e) => setActor(e.target.value)}
          >
            {ACTORS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.store ? STORES[item.store].name : "总部"}
              </option>
            ))}
          </select>
        </label>
      </aside>
      <div className="relative z-10 min-w-0 flex-1">
        <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 md:px-8 md:pt-10">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="inline-flex rounded-full bg-ink/[0.05] px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-mute">
                鲜邻生活
              </p>
              <h1 className="mt-3 text-[34px] leading-[1.02] font-semibold tracking-[-0.04em] text-balance md:text-[44px]">
                {page.title}
              </h1>
            </div>
            {showExport ? (
              <Button
                type="button"
                className="mb-1 h-11 shrink-0 rounded-full pr-1.5 pl-5"
                onClick={() => setModal(true)}
              >
                配货草稿
                <span className="flex size-8 items-center justify-center rounded-full bg-canvas/16 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <ArrowUpRight size={15} weight="light" />
                </span>
              </Button>
            ) : null}
          </div>
          {page.meta ? (
            <div className="mt-4 flex max-w-[68ch] flex-wrap gap-x-3 gap-y-1 text-[13px] leading-relaxed text-mute">
              {page.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : (
            <p className="mt-4 max-w-[65ch] text-[15px] leading-relaxed text-pretty text-mute">{page.text}</p>
          )}
          <div id="content" className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
