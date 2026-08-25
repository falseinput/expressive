import { useId } from "react";
import { Slider } from "@/components/ui/slider.tsx";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  onChange: (value: number) => void;
};

export function Knob({ label, value, min, max, step, unit, digits = 0, onChange }: Props) {
  const id = useId();

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={id}
        className="w-[72px] shrink-0 font-mono text-[11px] text-ink-muted"
      >
        {label}
      </label>
      <Slider
        id={id}
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
      />
      <span className="w-[46px] shrink-0 text-right font-mono text-[11px] tabular-nums text-ink">
        {value.toFixed(digits)}
        {unit}
      </span>
    </div>
  );
}
