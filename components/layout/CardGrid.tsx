import * as React from "react";
import { cn } from "@/lib/utils";


export function CardGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
return (
<div
className={cn(
"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
className
)}
{...props}
/>
);
}