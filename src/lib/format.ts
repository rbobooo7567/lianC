export function n1(n: number) {
  return Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 1 });
}

export function n0(n: number) {
  return Math.round(Number(n)).toLocaleString("zh-CN");
}

export function money(n: number) {
  return (
    "¥" +
    Number(n).toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
