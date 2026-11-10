import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AppProvider, useApp } from "@/app-state";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { exportLines, sourceName, STORES } from "@/lib/domain";
import { money, n0 } from "@/lib/format";
import { AlertsPage } from "@/pages/alerts";
import { HomePage } from "@/pages/home";
import { ListPage } from "@/pages/list";
import { MatrixPage } from "@/pages/matrix";
import { ParamsPage } from "@/pages/params";
import { ReplenishPage } from "@/pages/replenish";
import { StorePage } from "@/pages/store";
import { TransferPage } from "@/pages/transfer";

const PAGES = {
  home: HomePage,
  replenish: ReplenishPage,
  transfer: TransferPage,
  matrix: MatrixPage,
  alerts: AlertsPage,
  store: StorePage,
  params: ParamsPage,
  list: ListPage,
};

export function App() {
  return (
    <AppProvider>
      <Frame />
    </AppProvider>
  );
}

function Frame() {
  const { state, plans, setModal } = useApp();
  const reduce = useReducedMotion();
  const Page = PAGES[state.screen];
  const pack = exportLines(plans);
  const total = pack.lines.reduce((sum, p) => sum + p.execQty * p.sku.price, 0);

  return (
    <>
      <Shell>
        <motion.div
          key={state.screen}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        >
          <Page />
        </motion.div>
      </Shell>
      <Dialog open={state.modal} onOpenChange={setModal}>
        <DialogContent aria-describedby={undefined}>
          <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
            <div>
              <DialogTitle>10 月 9 日配货草稿</DialogTitle>
              <p className="mt-1 text-[13px] text-mute">{pack.title}</p>
            </div>
            <DialogClose asChild>
              <Button type="button" size="sm" variant="outline">
                关闭
              </Button>
            </DialogClose>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] apple-table border-collapse text-[13px]">
              <caption className="sr-only">配货草稿</caption>
              <thead>
                <tr className="text-left text-[12px] text-mute">
                  <th className="px-4 py-2 font-medium">方式</th>
                  <th className="px-3 py-2 font-medium">门店</th>
                  <th className="px-3 py-2 font-medium">商品</th>
                  <th className="px-3 py-2 text-right font-medium">数量</th>
                  <th className="px-3 py-2 font-medium">来源</th>
                  <th className="px-4 py-2 text-right font-medium">金额</th>
                </tr>
              </thead>
              <tbody>
                {pack.lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-mute">
                      今天没有可执行的行。
                    </td>
                  </tr>
                ) : (
                  pack.lines.map((p) => {
                    const who = p.source === "transfer" ? STORES[p.from].name : p.source === "dc" ? "总仓" : "供应商";
                    return (
                      <tr key={p.id} className="border-t border-line">
                        <td className="px-4 py-2.5">{sourceName(p)}</td>
                        <td className="px-3 py-2.5">{STORES[p.store].name}</td>
                        <td className="px-3 py-2.5">{p.sku.name}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {n0(p.execQty)} {p.sku.unit}
                        </td>
                        <td className="px-3 py-2.5">{who}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{money(p.execQty * p.sku.price)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-4 py-3 text-[13px]">
            合计 {pack.lines.length} 行 · {money(total)}
          </div>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {state.toast ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
            <motion.p
              role="status"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="pointer-events-auto rounded-md bg-ink px-3.5 py-2.5 text-[13px] text-canvas"
            >
              {state.toast}
            </motion.p>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
