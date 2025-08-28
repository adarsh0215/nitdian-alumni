import * as React from "react";
import { cn } from "@/lib/utils";


type Props = {
title: string;
subtitle?: string;
actions?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;


export function PageHeader({ title, subtitle, actions, className, ...props }: Props) {
return (
<header className={cn("mb-8 md:mb-10", className)} {...props}>
<div className="flex flex-wrap items-end justify-between gap-4">
<div>
<h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
{subtitle ? (
<p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
) : null}
</div>
{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
</div>
</header>
);
}