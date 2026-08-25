import { Slider } from "@/components/ui/slider.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ColorField } from "./ColorField.tsx";
import { type Hsl, type Param, type ParamValue, kindOf, stepFor } from "./model.ts";

type Props = {
  name: string;
  param: Param;
  value: ParamValue;
  modified: boolean;
  onChange: (value: ParamValue) => void;
};

export function ParamControl({ name, param, value, modified, onChange }: Props) {
  const kind = kindOf(param.value);

  return (
    <div className="border-b border-line px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label htmlFor={name}>
            {param.title}
            {modified && <span className="ml-1.5 text-[10px] text-ink-muted">edited</span>}
          </Label>
          <p className="mt-0.5 text-xs leading-snug text-ink-muted">{param.description}</p>
        </div>

        {kind === "color" && (
          <ColorField
            value={value as Hsl}
            hasAlpha={(param.value as Hsl).a !== undefined}
            onChange={onChange}
          />
        )}

        {kind === "boolean" && (
          <Switch id={name} checked={value as boolean} onCheckedChange={onChange} />
        )}
      </div>

      {kind === "number" && <NumberRow param={param} value={value as number} onChange={onChange} />}
    </div>
  );
}

function NumberRow({
  param,
  value,
  onChange,
}: {
  param: Param;
  value: number;
  onChange: (value: number) => void;
}) {
  const min = param.min ?? 0;
  const max = param.max ?? (param.value as number) * 2;
  const step = stepFor(min, max);

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-[10px] tabular-nums text-ink-muted">{min}</span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
      />
      <span className="text-[10px] tabular-nums text-ink-muted">{max}</span>
      <span className="w-9 text-right text-[10px] font-medium tabular-nums text-ink">
        {step < 1 ? value.toFixed(2) : value.toFixed(1)}
      </span>
    </div>
  );
}
