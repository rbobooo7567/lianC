import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("bezel", className)}>
      <div className="bezel-core overflow-hidden">{children}</div>
    </section>
  );
}

export function PanelHeader({
  title,
  aside,
}: {
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 pb-1">
      <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>
      {aside ? <p className="text-[12px] text-mute">{aside}</p> : null}
    </div>
  );
}
