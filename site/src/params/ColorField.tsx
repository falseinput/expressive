import { HslColorPicker, HslaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { NumberField } from "@/components/ui/number-field.tsx";
import { type Hsl, toCss } from "./model.ts";

type Props = {
  value: Hsl;
  hasAlpha: boolean;
  onChange: (value: Hsl) => void;
};

export function ColorField({ value, hasAlpha, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        className="size-6 shrink-0 rounded border border-line outline-none focus-visible:ring-2 focus-visible:ring-ink-muted"
        style={{ background: toCss(value) }}
        aria-label="Edit color"
      />
      <PopoverContent className="w-56">
        <div className="[&_.react-colorful]:h-40 [&_.react-colorful]:w-full">
          {hasAlpha ? (
            <HslaColorPicker
              color={{ ...value, a: value.a ?? 1 }}
              onChange={(next) => onChange(next)}
            />
          ) : (
            <HslColorPicker
              color={{ h: value.h, s: value.s, l: value.l }}
              onChange={(next) => onChange({ ...value, ...next })}
            />
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <NumberField
            label="H"
            value={value.h}
            max={360}
            onChange={(h) => onChange({ ...value, h })}
          />
          <NumberField
            label="S"
            value={value.s}
            max={100}
            onChange={(s) => onChange({ ...value, s })}
          />
          <NumberField
            label="L"
            value={value.l}
            max={100}
            onChange={(l) => onChange({ ...value, l })}
          />
        </div>

        {hasAlpha && (
          <NumberField
            label="A"
            value={value.a ?? 1}
            max={1}
            step={0.01}
            onChange={(a) => onChange({ ...value, a })}
            className="mt-1.5"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
