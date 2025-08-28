import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SearchParams } from "../_lib/types";
import { toPageHref } from "../_lib/params";

export default function PaginationBar({
  page,
  totalPages,
  searchParams,
  className,
}: {
  page: number;
  totalPages: number;
  searchParams: SearchParams;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button asChild variant="outline" disabled={page <= 1}>
        <Link href={toPageHref(searchParams, prev)}>Previous</Link>
      </Button>
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of {totalPages}
      </div>
      <Button asChild variant="outline" disabled={page >= totalPages}>
        <Link href={toPageHref(searchParams, next)}>Next</Link>
      </Button>
    </div>
  );
}
