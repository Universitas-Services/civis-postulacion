import { Loader2, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/** Indicador de espera compacto para botones y paneles. */
export function Spinner({ className, ...props }: LucideProps) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" {...props} />
  );
}
