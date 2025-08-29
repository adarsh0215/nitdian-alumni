import * as React from "react";
import { cn } from "@/lib/utils";

export function SiteShell({
  heading,
  subtitle,
  actions,
  children,
  className,
}: {
  heading?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-container py-8 md:py-10", className)}>
      {(heading || subtitle || actions) && (
        <div className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {heading && <h1 className="tracking-tight">{heading}</h1>}
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
