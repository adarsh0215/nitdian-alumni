import { cn } from "@/lib/utils";


export function SkeletonList({ count = 6, className }: { count?: number; className?: string }) {
return (
<div className={cn("space-y-4", className)}>
{Array.from({ length: count }).map((_, i) => (
<div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted" />
))}
</div>
);
}