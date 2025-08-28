import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";


export function EmptyState({
title = "Nothing here yet",
description = "Once there’s data, it will appear here.",
action,
className,
}: {
title?: string;
description?: string;
action?: { label: string; onClick?: () => void; href?: string };
className?: string;
}) {
return (
<div className={cn(
"flex flex-col items-center justify-center rounded-2xl border bg-card text-card-foreground",
"p-10 text-center shadow-sm"
, className)}>
<div className="rounded-full p-3 border mb-4">
<Inbox className="h-6 w-6" aria-hidden />
</div>
<h3 className="text-lg font-semibold">{title}</h3>
<p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>
{action ? (
action.href ? (
<Button asChild className="mt-6"><a href={action.href}>{action.label}</a></Button>
) : (
<Button className="mt-6" onClick={action.onClick}>{action.label}</Button>
)
) : null}
</div>
);
}