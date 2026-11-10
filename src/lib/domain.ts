import { money, n0, n1 } from "@/lib/format";

export const CATS = ["饮料", "乳品", "方便食品", "纸品", "粮油", "低温"] as const;
export type Cat = (typeof CATS)[number];

export const STORE_ORDER = ["dxc", "gtz", "wanda", "rml", "bj", "kjy", "zsl", "lc"] as const;

export const STORES: Record<string, { name: string; region: string; stale: number }> = {
  dxc: { name: "大学城店", region: "城西", stale: 2 },
  gtz: { name: "高铁站店", region: "城北", stale: 1 },
  wanda: { name: "万达店", region: "城东", stale: 3 },
  rml: { name: "人民路店", region: "城中", stale: 4 },
  bj: { name: "滨江店", region: "城南", stale: 2 },
  kjy: { name: "科技园店", region: "城西", stale: 1 },
  zsl: { name: "中山路店", region: "城中", stale: 5 },
  lc: { name: "老城店", region: "城南", stale: 23 },
};

type SkuBase = {
  name: string;
  unit: string;
  case: number;
  cat: Cat;
  price: number;
};

const SKU_BASE: Record<string, SkuBase> = {
  water: { name: "农夫山泉 550ml", unit: "瓶", case: 24, cat: "饮料", price: 2 },
  coke: { name: "可口可乐 330ml", unit: "听", case: 24, cat: "饮料", price: 2.8 },
  milk: { name: "伊利纯牛奶 250ml", unit: "盒", case: 16, cat: "乳品", price: 3.2 },
  noodle: { name: "康师傅红烧牛肉面", unit: "桶", case: 12, cat: "方便食品", price: 4.5 },
  vida: { name: "维达抽纸 3层130抽", unit: "提", case: 8, cat: "纸品", price: 12.9 },
  oil: { name: "金龙鱼玉米油 5L", unit: "桶", case: 4, cat: "粮油", price: 69.9 },
  yogurt: { name: "蒙牛风味酸奶 100g", unit: "杯", case: 24, cat: "低温", price: 2.5 },
  cookie: { name: "奥利奥原味 97g", unit: "盒", case: 12, cat: "方便食品", price: 9.9 },
};

export type Sku = SkuBase & { id: string };

export const SKUS: Record<string, Sku> = Object.fromEntries(
  Object.entries(SKU_BASE).map(([id, sku]) => [id, { id, ...sku }]),
);

const SAMPLE: Record<Cat, string> = {
  饮料: "饮料",
  乳品: "常温奶",
  方便食品: "方便面",
  纸品: "抽纸",
  粮油: "食用油",
  低温: "酸奶",
};

const FROM: Record<string, { onHand: number; daily: number }> = {
  "rml|water": { onHand: 220, daily: 10 },
  "rml|noodle": { onHand: 80, daily: 4 },
  "lc|vida": { onHand: 240, daily: 0.8 },
};

export type Source = "transfer" | "dc" | "supplier" | "covered";

type RawRow = {
  id: string;
  store: string;
  sku: string;
  onHand: number;
  reserved: number;
  transit: number;
  daily: number;
  source: Source;
  from: string;
  dcOnHand: number;
};

const ROWS: RawRow[] = [
  { id: "t1", store: "dxc", sku: "water", onHand: 24, reserved: 0, transit: 0, daily: 18, source: "transfer", from: "rml", dcOnHand: 860 },
  { id: "t2", store: "gtz", sku: "water", onHand: 30, reserved: 0, transit: 0, daily: 16, source: "transfer", from: "rml", dcOnHand: 860 },
  { id: "t3", store: "dxc", sku: "noodle", onHand: 6, reserved: 0, transit: 0, daily: 5.5, source: "transfer", from: "rml", dcOnHand: 8 },
  { id: "t4", store: "zsl", sku: "vida", onHand: 4, reserved: 0, transit: 0, daily: 3.2, source: "transfer", from: "lc", dcOnHand: 120 },
  { id: "t5", store: "wanda", sku: "milk", onHand: 20, reserved: 0, transit: 16, daily: 7, source: "covered", from: "", dcOnHand: 0 },
  { id: "t6", store: "kjy", sku: "oil", onHand: 2, reserved: 0, transit: 0, daily: 0.4, source: "supplier", from: "", dcOnHand: 0 },
  { id: "t7", store: "dxc", sku: "coke", onHand: 10, reserved: 0, transit: 0, daily: 9, source: "dc", from: "", dcOnHand: 24 },
  { id: "t8", store: "gtz", sku: "coke", onHand: 12, reserved: 0, transit: 0, daily: 8, source: "dc", from: "", dcOnHand: 24 },
];

export const OVER = [
  { store: "lc", sku: "vida", onHand: 240, daily: 0.8 },
  { store: "rml", sku: "oil", onHand: 80, daily: 0.25 },
  { store: "lc", sku: "cookie", onHand: 360, daily: 1.2 },
  { store: "rml", sku: "water", onHand: 220, daily: 10 },
];

export const ANOM = [
  { store: "wanda", sku: "cookie", today: 48, daily: 6, note: "先确认是不是团购或录错单。今天不改日均，也不追加建议量。" },
];

export const EXP = [
  { store: "bj", sku: "yogurt", onHand: 36, expiring: 18, daysLeft: 6, daily: 4 },
];

const SHORT: Record<string, { name: string; onHand: number; daily: number; note: string }> = {
  "lc|方便食品": { name: "康师傅红烧牛肉面", onHand: 60, daily: 4, note: "格子用这个最短天数。奥利奥超储在预警里。" },
  "rml|粮油": { name: "鲁花花生油 5L", onHand: 36, daily: 3, note: "格子用这个最短天数。金龙鱼滞销在预警里。" },
};

export const MATRIX: Record<string, Record<Cat, number>> = {
  dxc: { 饮料: 10 / 9, 乳品: 4.6, 方便食品: 6 / 5.5, 纸品: 6, 粮油: 9, 低温: 5 },
  gtz: { 饮料: 12 / 8, 乳品: 3.6, 方便食品: 4.3, 纸品: 5.2, 粮油: 8, 低温: 4.2 },
  wanda: { 饮料: 6.2, 乳品: 20 / 7, 方便食品: 7, 纸品: 8, 粮油: 11, 低温: 6 },
  rml: { 饮料: 22, 乳品: 12, 方便食品: 20, 纸品: 11, 粮油: 12, 低温: 9 },
  bj: { 饮料: 5, 乳品: 4.4, 方便食品: 6, 纸品: 7.5, 粮油: 10, 低温: 9 },
  kjy: { 饮料: 4.2, 乳品: 5, 方便食品: 6.4, 纸品: 8, 粮油: 5, 低温: 7 },
  zsl: { 饮料: 4.8, 乳品: 4, 方便食品: 3.5, 纸品: 4 / 3.2, 粮油: 11, 低温: 6 },
  lc: { 饮料: 8, 乳品: 9, 方便食品: 15, 纸品: 300, 粮油: 18, 低温: 12 },
};

export type CatConfig = { lead: number; safety: number };

export const DEFAULT_CONFIG: Record<Cat, CatConfig> = {
  饮料: { lead: 1, safety: 2 },
  乳品: { lead: 1, safety: 3 },
  方便食品: { lead: 1, safety: 2 },
  纸品: { lead: 1, safety: 2 },
  粮油: { lead: 7, safety: 3 },
  低温: { lead: 1, safety: 2 },
};

export const FEATURES: [string, string, string, string, string, string][] = [
  ["一期", "今日总览", "开班作战台", "总部运营", "home", "断货门店数、可执行条数、调拨条数、滞销金额，并标明日配截单时间。"],
  ["一期", "今日总览", "不足 2 天清单", "总部运营", "home", "在店可售不足 2 天的门店和商品，点名称进入建议单。"],
  ["一期", "今日总览", "处理顺序", "总部运营", "home", "先店间调拨，再把总仓现货按最短可售分配；异常销量不进建议。"],
  ["一期", "门店可售", "门店×品类矩阵", "总部运营", "matrix", "格子是该店该品类的在店最短可售天数，不含在途。"],
  ["一期", "门店可售", "格子下钻", "总部运营", "matrix", "看到具体商品、在途覆盖和今天补不补。临期不改变格子颜色。"],
  ["一期", "补货建议", "建议量", "总部采购", "replenish", "目标天数 × 日均 − 在店可售 − 在途，再按箱规向上取整。"],
  ["一期", "补货建议", "计算过程", "总部采购", "replenish", "每一行展开日均、目标、缺口、箱规、总仓或调出店约束。"],
  ["一期", "补货建议", "总仓分配", "总部采购", "replenish", "同一商品多家要货时，现货先给在店可售更短的店。"],
  ["一期", "补货建议", "确认、改量、暂缓", "总部、店长", "replenish", "暂缓会释放已占的总仓或可调数量。确认后进入配货草稿。"],
  ["一期", "补货建议", "配货草稿", "总部采购", "replenish", "草稿分调拨、总仓配送、供应商直送，交给现有进销存执行。"],
  ["一期", "店间调拨", "富余店补缺口店", "总部运营", "transfer", "只补缺口，调出后仍留下至少 14 天用量。"],
  ["一期", "店间调拨", "连续调出扣减", "总部运营", "transfer", "同一家店同一商品按清单顺序扣减，并显示调出前后可售天数。"],
  ["一期", "店间调拨", "未盘点提示", "总部运营", "transfer", "调出店超过 21 天未盘点时，出库前先复盘。"],
  ["一期", "预警", "缺货", "总部、店长", "alerts", "在店可售不足 2 天。"],
  ["一期", "预警", "超储与滞销", "总部运营", "alerts", "可售达到 21 天为超储，达到 60 天为滞销，并给出库存金额。"],
  ["一期", "预警", "异常销量", "总部、店长", "alerts", "当日销量达到日均数倍时，不改日均，不自动加补。"],
  ["一期", "预警", "临期", "店长", "alerts", "到期前按日均卖不完的数量单独列出，建议堆头而不是补货。"],
  ["一期", "预警", "超期未盘点", "总部、店长", "alerts", "超过 21 天未盘点的门店。"],
  ["一期", "店长端", "只看本店", "店长", "store", "调出、调入、总仓配送、直送和本店预警。看不到其他店的库存明细。"],
  ["一期", "店长端", "改数量回写", "店长", "store", "店长确认或暂缓的结果，写回总部同一条建议。"],
  ["一期", "参数", "配送周期和安全天数", "总部运营", "params", "按品类配置。保存后按新目标天数重算今日建议。"],
  ["一期", "参数", "箱规", "总部运营", "params", "取整使用商品主数据里的箱规。"],
  ["一期", "数据", "库存与销售接入", "实施", "", "对接 POS 或进销存的日终库存、销售和在途。演示数据相当于已经接好的 10 月 9 日。"],
  ["二期", "参数", "档期系数", "总部运营", "", "促销和周末按品类乘到日均上。一期的日均不含档期系数。"],
  ["二期", "复盘", "建议准确率", "总部运营", "", "对比建议量、实发量，以及之后 3 天有没有断货。"],
  ["二期", "权限", "区域经理", "区域", "", "只看本区门店。"],
  ["二期", "消息", "企业微信送达", "店长", "", "把店长端清单推到企业微信，确认动作与手机页相同。"],
  ["二期", "规则", "新品观察期", "总部运营", "", "新品前 14 天不判滞销。"],
  ["二期", "规则", "总部锁库存", "总部运营", "", "活动预留库存不参与分配。"],
];

export type Screen = "home" | "replenish" | "transfer" | "matrix" | "alerts" | "store" | "params" | "list";
export type FilterId = "todo" | "transfer" | "dc" | "supplier" | "covered";
export type AlertTab = "stockout" | "over" | "anom" | "expiry" | "count";
export type DecisionStatus = "confirmed" | "hold";
export type Decision = { status: DecisionStatus; qty: number; by: string };
export type Tone = "" | "bad" | "warn" | "over" | "ok";

export type Plan = {
  id: string;
  store: string;
  onHand: number;
  reserved: number;
  transit: number;
  daily: number;
  source: Source;
  from: string;
  dcOnHand: number;
  sku: Sku;
  cfg: CatConfig;
  sellable: number;
  cover: number;
  targetDays: number;
  targetQty: number;
  gap: number;
  suggest: number;
  dos: number;
  dosAll: number;
  stored: number;
  request: number;
  status: "pending" | "confirmed" | "hold" | "covered";
  execQty: number;
  stepMax: number;
  blocked: boolean;
  fromBefore: number;
  fromAfter: number;
  fromDaily: number;
  fromDosBefore: number;
  fromDosAfter: number;
};

export function heat(dos: number): Tone {
  if (dos < 2) return "bad";
  if (dos < 4) return "warn";
  if (dos >= 21) return "over";
  return "";
}

export function sourceName(p: Plan) {
  if (p.source === "transfer") return "店间调拨";
  if (p.source === "dc") return "总仓配送";
  if (p.source === "supplier") return "供应商直送";
  return "在途已覆盖";
}

export function statusMeta(p: Plan): [string, Tone] {
  if (p.status === "confirmed") return ["已确认", "ok"];
  if (p.status === "hold") return ["已暂缓", ""];
  if (p.blocked) return ["总仓不足", "bad"];
  if (p.execQty === 0 && p.suggest === 0) return ["不必补", ""];
  if (p.execQty === 0) return ["未分配", "bad"];
  return ["待确认", "warn"];
}

export function inFilter(p: Plan, f: FilterId) {
  if (f === "transfer") return p.source === "transfer";
  if (f === "dc") return p.source === "dc";
  if (f === "supplier") return p.source === "supplier";
  return p.source !== "covered";
}

export function build(
  config: Record<Cat, CatConfig>,
  decisions: Record<string, Decision>,
): Plan[] {
  const plans: Plan[] = ROWS.map((raw) => {
    const sku = SKUS[raw.sku];
    const cfg = config[sku.cat];
    const sellable = raw.onHand - raw.reserved;
    const cover = sellable + raw.transit;
    const targetDays = cfg.lead + cfg.safety;
    const targetQty = targetDays * raw.daily;
    const gap = Math.max(0, targetQty - cover);
    const suggest = gap === 0 ? 0 : Math.ceil((gap - 1e-9) / sku.case) * sku.case;
    const d = decisions[raw.id];
    const stored = d && d.qty != null ? Number(d.qty) : suggest;
    const request = d && d.status === "hold" ? 0 : stored;
    return {
      id: raw.id,
      store: raw.store,
      onHand: raw.onHand,
      reserved: raw.reserved,
      transit: raw.transit,
      daily: raw.daily,
      source: raw.source,
      from: raw.from,
      dcOnHand: raw.dcOnHand,
      sku,
      cfg,
      sellable,
      cover,
      targetDays,
      targetQty,
      gap,
      suggest,
      dos: raw.daily ? sellable / raw.daily : 0,
      dosAll: raw.daily ? cover / raw.daily : 0,
      stored,
      request,
      status: raw.source === "covered" ? "covered" : d ? d.status : "pending",
      execQty: 0,
      stepMax: 0,
      blocked: false,
      fromBefore: 0,
      fromAfter: 0,
      fromDaily: 0,
      fromDosBefore: 0,
      fromDosAfter: 0,
    };
  });

  const dcGroups: Record<string, Plan[]> = {};
  plans.forEach((p) => {
    if (p.source === "dc") (dcGroups[p.sku.id] || (dcGroups[p.sku.id] = [])).push(p);
  });
  Object.keys(dcGroups).forEach((id) => {
    const list = dcGroups[id].slice().sort((a, b) => a.dos - b.dos || a.id.localeCompare(b.id));
    let left = list[0].dcOnHand;
    list.forEach((p) => {
      const caseSize = p.sku.case;
      p.stepMax = Math.floor(left / caseSize) * caseSize;
      const give = Math.min(Math.max(0, p.request), p.stepMax);
      p.execQty = Math.floor(give / caseSize) * caseSize;
      left -= p.execQty;
      p.blocked = p.suggest > 0 && p.execQty === 0 && p.status !== "hold";
    });
  });

  const pool: Record<string, number> = {};
  plans.forEach((p) => {
    if (p.source !== "transfer") return;
    const key = p.from + "|" + p.sku.id;
    const base = FROM[key];
    if (pool[key] == null) pool[key] = base.onHand;
    const caseSize = p.sku.case;
    const maxGive = Math.max(0, Math.floor((pool[key] - 14 * base.daily) / caseSize) * caseSize);
    p.stepMax = maxGive;
    const give = Math.min(Math.max(0, p.request), maxGive);
    p.execQty = Math.floor(give / caseSize) * caseSize;
    p.fromBefore = pool[key];
    pool[key] -= p.execQty;
    p.fromAfter = pool[key];
    p.fromDaily = base.daily;
    p.fromDosBefore = p.fromBefore / base.daily;
    p.fromDosAfter = p.fromAfter / base.daily;
  });

  plans.forEach((p) => {
    if (p.source === "supplier") {
      p.stepMax = p.suggest;
      const give = Math.min(Math.max(0, p.request), p.stepMax);
      p.execQty = Math.floor(give / p.sku.case) * p.sku.case;
    }
    if (p.source === "covered") {
      p.stepMax = 0;
      p.execQty = 0;
    }
  });

  return plans;
}

export function shownQty(p: Plan) {
  if (p.status === "hold") return p.stored;
  return p.execQty;
}

export function verdict(p: Plan) {
  const u = p.sku.unit;
  if (p.source === "covered") return "在途已经盖住目标库存，今天不补。";
  if (p.status === "hold") return "这条已暂缓，不占用可调数量，也不进配货草稿。";
  if (p.blocked) return "总仓现货已经分给可售更短的门店，本店今天分配到 0。";
  if (p.source === "transfer") {
    return "从" + STORES[p.from].name + "调入 " + n0(p.execQty) + " " + u + "。调出后对方还有 " + n1(p.fromDosAfter) + " 天。";
  }
  if (p.source === "dc") return "总仓配送 " + n0(p.execQty) + " " + u + "。";
  return "供应商直送 " + n0(p.execQty) + " " + u + "。交期 " + p.cfg.lead + " 天已经算进目标天数。";
}

export function explain(p: Plan, plans: Plan[]) {
  const u = p.sku.unit;
  const lines = [
    "在店可售 " + n0(p.sellable) + " " + u + "（账面 " + n0(p.onHand) + " − 占用 " + n0(p.reserved) + "）",
    "在途 " + n0(p.transit) + " " + u + "，含在途可售 " + n1(p.dosAll) + " 天",
    "日均 " + n1(p.daily) + " " + u + "。近 7 天占 50%，14 天占 30%，28 天占 20%，异常日已剔除",
    "在店可售 " + n1(p.dos) + " 天",
    "目标天数 = 配送 " + p.cfg.lead + " 天 + 安全 " + p.cfg.safety + " 天 = " + p.targetDays + " 天",
    "目标量 " + n1(p.targetQty) + " " + u + "，缺口 " + n1(p.gap) + " " + u,
    "箱规 " + p.sku.case + "，取整后建议 " + n0(p.suggest) + " " + u,
  ];
  if (p.source === "transfer") {
    lines.push("调出前，" + STORES[p.from].name + "有 " + n0(p.fromBefore) + " " + u + "，可售 " + n1(p.fromDosBefore) + " 天");
    lines.push("本条执行 " + n0(p.execQty) + " " + u + " 后，剩 " + n0(p.fromAfter) + " " + u + "，可售 " + n1(p.fromDosAfter) + " 天");
    lines.push("调出后至少保留 14 天用量，本条可调上限 " + n0(p.stepMax) + " " + u);
    if (p.dcOnHand < p.suggest) {
      lines.push("总仓现货 " + n0(p.dcOnHand) + " " + u + "，不够取整后的 " + n0(p.suggest) + " " + u + "，所以走调拨");
    } else {
      lines.push("总仓有 " + n0(p.dcOnHand) + " " + u + "。调出店可售超过 14 天，今天先调拨");
    }
    if (STORES[p.from].stale >= 21) {
      lines.push(STORES[p.from].name + "已 " + STORES[p.from].stale + " 天未盘点，出库前先复盘");
    }
  }
  if (p.source === "dc") {
    const siblings = plans.filter((x) => x.source === "dc" && x.sku.id === p.sku.id).sort((a, b) => a.dos - b.dos);
    const rank = siblings.findIndex((x) => x.id === p.id) + 1;
    lines.push("总仓现货 " + n0(p.dcOnHand) + " " + u + "，按在店可售从短到长分配，本店排第 " + rank);
    lines.push("分到本店时的可分配上限 " + n0(p.stepMax) + " " + u + "，执行 " + n0(p.execQty) + " " + u);
  }
  if (p.source === "supplier") lines.push("总仓不备这个商品，向供应商直送");
  if (p.source === "covered") lines.push("在店加在途已经达到目标量，执行量为 0");
  return lines;
}

export function categoryMins() {
  return CATS.map((cat) => {
    let store: string = STORE_ORDER[0];
    let dos = MATRIX[store][cat];
    STORE_ORDER.forEach((id) => {
      if (MATRIX[id][cat] < dos) {
        dos = MATRIX[id][cat];
        store = id;
      }
    });
    return { cat, store, dos };
  }).sort((a, b) => a.dos - b.dos);
}

export function overValue(minDos: number) {
  return OVER.reduce((sum, o) => {
    const dos = o.onHand / o.daily;
    if (dos >= minDos) return sum + o.onHand * SKUS[o.sku].price;
    return sum;
  }, 0);
}

export function dcNotes(plans: Plan[]) {
  return plans.filter((p) => p.blocked).map((b) => {
    const winner = plans.find((p) => p.sku.id === b.sku.id && p.source === "dc" && p.execQty > 0);
    const got = winner
      ? STORES[winner.store].name + "分到 " + n0(winner.execQty) + " " + b.sku.unit
      : "没有门店分到货";
    return b.sku.name + "总仓现货 " + n0(b.dcOnHand) + " " + b.sku.unit + "，" + got + "。" + STORES[b.store].name + "可售 " + n1(b.dos) + " 天，今天分配为 0。";
  });
}

export function cellDetail(store: string, cat: Cat, plans: Plan[]) {
  const lines: string[] = [];
  plans.filter((p) => p.store === store && p.sku.cat === cat).forEach((p) => {
    const transit = p.transit ? "，在途 " + n0(p.transit) + p.sku.unit + "，含在途 " + n1(p.dosAll) + " 天" : "";
    lines.push(p.sku.name + "：在店 " + n0(p.sellable) + p.sku.unit + transit + "，可售 " + n1(p.dos) + " 天，执行 " + n0(p.execQty) + p.sku.unit + "（" + sourceName(p) + "）");
  });
  const short = SHORT[store + "|" + cat];
  if (short) {
    lines.push(short.name + "：在店 " + n0(short.onHand) + "，日均 " + n1(short.daily) + "，可售 " + n1(short.onHand / short.daily) + " 天。" + short.note);
  }
  plans.filter((p) => p.source === "transfer" && p.from === store && p.sku.cat === cat).forEach((p) => {
    lines.push(p.sku.name + "：调出前 " + n0(p.fromBefore) + p.sku.unit + "，可售 " + n1(p.fromDosBefore) + " 天。调给" + STORES[p.store].name + " " + n0(p.execQty) + p.sku.unit + "后，剩 " + n1(p.fromDosAfter) + " 天。");
  });
  OVER.filter((o) => o.store === store && SKUS[o.sku].cat === cat).forEach((o) => {
    const sku = SKUS[o.sku];
    const dos = o.onHand / o.daily;
    const text = sku.name + "：在店 " + n0(o.onHand) + sku.unit + "，可售 " + n1(dos) + " 天，金额 " + money(o.onHand * sku.price) + "。" + (dos >= 60 ? "滞销。" : "刚过 21 天超储线。");
    if (!lines.some((l) => l.indexOf(sku.name + "：") === 0)) lines.push(text);
  });
  EXP.filter((a) => a.store === store && SKUS[a.sku].cat === cat).forEach((a) => {
    const sku = SKUS[a.sku];
    lines.push(sku.name + "：在店 " + n0(a.onHand) + sku.unit + "，其中 " + a.expiring + sku.unit + " 将在 " + a.daysLeft + " 天内到期。日均 " + n1(a.daily) + "，大约 " + n1(a.expiring / a.daily) + " 天能卖完。建议堆头，不要补货。");
  });
  if (!lines.length) {
    lines.push(SAMPLE[cat] + "：该品类在店最短可售 " + n1(MATRIX[store][cat]) + " 天。");
  }
  return lines;
}

export function exportLines(plans: Plan[]) {
  const confirmed = plans.filter((p) => p.status === "confirmed" && p.execQty > 0);
  if (confirmed.length) return { title: "已确认，可以交给进销存", lines: confirmed };
  return { title: "还没有确认行。下面是今天可执行的草稿", lines: plans.filter((p) => p.status === "pending" && p.execQty > 0) };
}

export function applyDecision(
  plans: Plan[],
  id: string,
  status: DecisionStatus,
  rawQty: number | null,
  by: string,
): { decision?: Decision; toast: string } | null {
  const plan = plans.find((p) => p.id === id);
  if (!plan || plan.source === "covered") return null;
  if (status === "confirmed" && plan.stepMax === 0) {
    return { toast: "当前没有可分配数量" };
  }
  let qty = rawQty != null && Number.isFinite(rawQty) ? rawQty : plan.stored;
  if (!Number.isFinite(qty) || qty < 0) qty = plan.suggest;
  const caseSize = plan.sku.case;
  qty = Math.floor(qty / caseSize) * caseSize;
  if (status === "hold" || qty === 0) {
    return {
      decision: { status: "hold", qty: qty || plan.suggest, by },
      toast: "已暂缓。占用的总仓或可调数量已释放",
    };
  }
  const max = plan.stepMax;
  let note = "";
  if (qty > max) {
    qty = max;
    note = "，已按可分配上限改为 " + n0(qty);
  }
  return {
    decision: { status: "confirmed", qty, by },
    toast: "已确认，并写进配货草稿" + note,
  };
}
