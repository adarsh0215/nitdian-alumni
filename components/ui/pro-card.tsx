// components/ui/pro-card.tsx
import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProCardProps = React.ComponentPropsWithoutRef<"div"> & {
  glow?: boolean;
};

export const ProCard = React.forwardRef<HTMLDivElement, ProCardProps>(
  ({ className, glow = true, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "card-elevated transition-all dur-2 ease-out-brand hover:shadow-lg hover:-translate-y-[1px]",
          glow && "",
          className
        )}
        {...props}
      />
    );
  }
);

ProCard.displayName = "ProCard";
