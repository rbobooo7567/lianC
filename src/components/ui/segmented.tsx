import { motion, useReducedMotion } from "motion/react";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
  label: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap rounded-[10px] bg-ink/[0.06] p-0.5"
    >
      {options.map((opt) => {
        const on = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(opt.id)}
            className={`relative h-7 rounded-lg px-3 text-[13px] ${on ? "font-medium text-ink" : "text-mute"}`}
          >
            {on && !reduce ? (
              <motion.span
                layoutId={label}
                className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_1px_color-mix(in_srgb,var(--ink)_6%,transparent),0_0_0_0.5px_var(--line)]"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
              />
            ) : null}
            {on && reduce ? (
              <span className="absolute inset-0 rounded-lg bg-surface shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)]" />
            ) : null}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
