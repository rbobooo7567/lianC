export type Actor = {
  id: string;
  name: string;
  title: string;
  store: string;
};

export const ACTORS: Actor[] = [
  { id: "hq", name: "周宁", title: "总部运营", store: "" },
  { id: "dxc", name: "陈可", title: "店长", store: "dxc" },
  { id: "gtz", name: "赵衡", title: "店长", store: "gtz" },
  { id: "wanda", name: "林夏", title: "店长", store: "wanda" },
  { id: "rml", name: "李娜", title: "店长", store: "rml" },
  { id: "bj", name: "孙琪", title: "店长", store: "bj" },
  { id: "kjy", name: "郑凯", title: "店长", store: "kjy" },
  { id: "zsl", name: "何清", title: "店长", store: "zsl" },
  { id: "lc", name: "吴敏", title: "店长", store: "lc" },
];

export function findActor(id: string | null): Actor {
  return ACTORS.find((actor) => actor.id === id) ?? ACTORS[0];
}

export function actorForStore(storeId: string): Actor {
  return ACTORS.find((actor) => actor.store === storeId) ?? ACTORS[0];
}
