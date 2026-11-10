import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-[22px] items-center rounded-md px-2 text-[12px] font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-ink/[0.06] text-ink/80",
        bad: "bg-bad-bg text-bad",
        warn: "bg-warn-bg text-warn",
        over: "bg-over-bg text-over",
        ok: "bg-ok-bg text-ok",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
