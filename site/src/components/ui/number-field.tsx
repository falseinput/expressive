import { cn } from "@/lib/utils.ts";

type Props = {
  label: string;
  value: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
};

export function NumberField({ label, value, max, step = 1, onChange, className }: Props) {
  return (
    <label className={cn("flex items-center gap-1.5", className)}>
      <span className="w-3 text-[10px] text-ink-muted">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={Number(value.toFixed(2))}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isNaN(next)) onChange(Math.min(max, Math.max(0, next)));
        }}
        className="w-full rounded border border-line px-1.5 py-1 text-xs tabular-nums outline-none focus:border-ink-muted"
      />
    </label>
  );
}
