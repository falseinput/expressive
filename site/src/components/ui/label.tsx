import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils.ts";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}
