import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Moderation } from "../_lib/types";

export function StatusBadge({ status }: { status: Moderation }) {
  if (status === "approved") {
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">Approved</Badge>;
  }
  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">Pending approval</Badge>;
}

export function Info({ label, value, link }: { label: string; value: any; link?: boolean }) {
  const text = value == null || value === "" ? "—" : String(value);
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      {link && value ? (
        <a
          href={String(value)}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sm text-primary underline"
        >
          {String(value)}
        </a>
      ) : (
        <p className="truncate text-sm">{text}</p>
      )}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Completed</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
          aria-valuemin={0}
          aria-valuenow={value}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export function Avatar({ src, name, size = 64 }: { src: string | null; name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <div
      className="grid place-items-center overflow-hidden rounded-full ring-1 ring-border bg-muted text-sm font-medium"
      style={{ width: size, height: size }}
      aria-label="Profile avatar"
    >
      {src ? (
        <Image src={src} alt={name} width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  );
}
