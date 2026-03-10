import * as React from "react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "border-input text-primary focus-visible:ring-ring/50 h-4 w-4 rounded-sm border shadow-xs focus-visible:ring-[3px]",
        className
      )}
      {...props}
    />
  );
}

export { Checkbox };
