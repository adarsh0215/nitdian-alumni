import { cn } from "@/lib/utils";


export function KPIStat({
label,
value,
delta,
className,
}: {
label: string;
value: string | number;
delta?: { value: string; tone?: "up" | "down" | "flat" };
className?: string;
}) {
const tone = delta?.tone ?? "flat";
return (
<div className={cn("rounded-xl border p-4 bg-card shadow-sm", className)}>
<div className="text-sm text-muted-foreground">{label}</div>
<div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
{delta ? (
<div className="mt-1 text-xs">
<span className={
tone === "up" ? "text-emerald-600 dark:text-emerald-400" :
tone === "down" ? "text-rose-600 dark:text-rose-400" :
"text-muted-foreground"
}>
{tone === "up" ? "▲ " : tone === "down" ? "▼ " : "– "}
{delta.value}
</span>
</div>
) : null}
</div>
);
}