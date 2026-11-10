import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyDecision,
  build,
  DEFAULT_CONFIG,
  type AlertTab,
  type Cat,
  type CatConfig,
  type Decision,
  type DecisionStatus,
  type FilterId,
  type Plan,
  type Screen,
} from "@/lib/domain";
import { findActor } from "@/lib/actors";

const SCREENS = new Set<Screen>([
  "home",
  "replenish",
  "transfer",
  "matrix",
  "alerts",
  "store",
  "params",
  "list",
]);
const TABS = new Set<AlertTab>(["stockout", "over", "anom", "expiry", "count"]);

type AppState = {
  screen: Screen;
  filter: FilterId;
  selected: string | null;
  cell: string | null;
  alertTab: AlertTab;
  managerStore: string;
  actorId: string;
  modal: boolean;
  toast: string;
  decisions: Record<string, Decision>;
  config: Record<Cat, CatConfig>;
  qtyDrafts: Record<string, string>;
};

function readInitial(): AppState {
  const params = new URLSearchParams(location.search);
  const screenParam = params.get("screen");
  const tabParam = params.get("tab");
  const actor = findActor(params.get("as"));
  const screen = actor.store
    ? "store"
    : screenParam && SCREENS.has(screenParam as Screen)
      ? (screenParam as Screen)
      : "home";
  const alertTab = tabParam && TABS.has(tabParam as AlertTab) ? (tabParam as AlertTab) : "stockout";
  return {
    screen,
    filter: "todo",
    selected: screen === "replenish" ? "t1" : null,
    cell: screen === "matrix" ? "dxc|饮料" : null,
    alertTab,
    managerStore: actor.store || "dxc",
    actorId: actor.id,
    modal: false,
    toast: "",
    decisions: {},
    config: structuredClone(DEFAULT_CONFIG),
    qtyDrafts: {},
  };
}

type AppContextValue = {
  state: AppState;
  plans: Plan[];
  theme: "light" | "dark";
  toggleTheme: () => void;
  go: (screen: Screen, tab?: AlertTab) => void;
  openPlan: (id: string) => void;
  setFilter: (filter: FilterId) => void;
  setCell: (cell: string) => void;
  setAlertTab: (tab: AlertTab) => void;
  setManagerStore: (id: string) => void;
  setActor: (id: string) => void;
  setQtyDraft: (id: string, value: string) => void;
  confirm: (id: string) => void;
  hold: (id: string) => void;
  reset: (id: string) => void;
  saveConfig: (next: Record<Cat, CatConfig>) => void;
  setModal: (open: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function readTheme(): "light" | "dark" {
  const saved = localStorage.getItem("ls-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(readInitial);
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);

  const plans = useMemo(
    () => build(state.config, state.decisions),
    [state.config, state.decisions],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ls-theme", theme);
  }, [theme]);

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("screen", state.screen);
    if (state.screen === "alerts") url.searchParams.set("tab", state.alertTab);
    else url.searchParams.delete("tab");
    url.searchParams.set("as", state.actorId);
    history.replaceState(null, "", url);
    document.title = "链存";
  }, [state.screen, state.alertTab, state.actorId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setState((s) => (s.modal ? { ...s, modal: false } : s));
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setState((s) => {
      if (s.screen === "replenish" && s.selected == null) return { ...s, selected: "t1" };
      if (s.screen === "matrix" && s.cell == null) return { ...s, cell: "dxc|饮料" };
      return s;
    });
  }, [state.screen, state.selected, state.cell]);

  function clearDraft(id: string, prev: Record<string, string>) {
    if (!(id in prev)) return prev;
    const next = { ...prev };
    delete next[id];
    return next;
  }

  function act(id: string, status: DecisionStatus) {
    setState((s) => {
      const current = build(s.config, s.decisions);
      const raw = s.qtyDrafts[id];
      const parsed = raw == null || raw === "" ? null : Number(raw);
      const result = applyDecision(current, id, status, parsed, findActor(s.actorId).name);
      if (!result) return { ...s, toast: "" };
      if (!result.decision) return { ...s, toast: result.toast };
      return {
        ...s,
        decisions: { ...s.decisions, [id]: result.decision },
        qtyDrafts: clearDraft(id, s.qtyDrafts),
        toast: result.toast,
      };
    });
  }

  const value: AppContextValue = {
    state,
    plans,
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    go: (screen, tab) =>
      setState((s) => {
        if (findActor(s.actorId).store) return { ...s, screen: "store", toast: "" };
        return {
          ...s,
          screen,
          toast: "",
          alertTab: tab ?? s.alertTab,
          selected: screen === "replenish" ? s.selected : null,
        };
      }),
    openPlan: (id) =>
      setState((s) => ({
        ...s,
        screen: "replenish",
        selected: id,
        filter: "todo",
        toast: "",
      })),
    setFilter: (filter) => setState((s) => ({ ...s, filter, toast: "" })),
    setCell: (cell) => setState((s) => ({ ...s, cell, toast: "" })),
    setAlertTab: (alertTab) => setState((s) => ({ ...s, alertTab, toast: "" })),
    setManagerStore: (managerStore) => setState((s) => ({ ...s, managerStore })),
    setActor: (actorId) =>
      setState((s) => {
        const actor = findActor(actorId);
        if (!actor.store) return { ...s, actorId: actor.id, screen: "home", toast: "" };
        return { ...s, actorId: actor.id, managerStore: actor.store, screen: "store", toast: "" };
      }),
    setQtyDraft: (id, qty) =>
      setState((s) => ({ ...s, qtyDrafts: { ...s.qtyDrafts, [id]: qty } })),
    confirm: (id) => act(id, "confirmed"),
    hold: (id) => act(id, "hold"),
    reset: (id) =>
      setState((s) => {
        const decisions = { ...s.decisions };
        delete decisions[id];
        return {
          ...s,
          decisions,
          qtyDrafts: clearDraft(id, s.qtyDrafts),
          toast: "已恢复系统建议",
        };
      }),
    saveConfig: (next) =>
      setState((s) => ({
        ...s,
        config: next,
        toast: "已按新的配送周期和安全天数重算今日建议",
      })),
    setModal: (modal) => setState((s) => ({ ...s, modal, toast: modal ? s.toast : "" })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
