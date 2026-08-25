import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils.ts";

export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-4 w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-surface-muted">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-ink-muted" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-3.5 rounded-full border border-line-strong bg-control shadow-sm outline-none" />
    </SliderPrimitive.Root>
  );
}
