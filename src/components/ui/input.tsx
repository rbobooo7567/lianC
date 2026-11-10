import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-8 w-full rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink tabular-nums shadow-[inset_0_1px_0_color-mix(in_srgb,white_70%,transparent)] transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-mute focus-visible:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
