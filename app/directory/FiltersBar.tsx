"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  X,
  RotateCcw,
  GraduationCap,
  GitBranch,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEGREE_OPTIONS = ["B.Tech", "M.Tech", "MBA", "PhD", "Other"] as const;
const BRANCH_OPTIONS = ["CSE", "ECE", "EEE", "ME", "CE", "CHE", "MME", "Other"] as const;

type Props = {
  sticky?: boolean;        // make it stick under navbar
  resultCount?: number;    // optional, show "Showing N"
};

export default function FiltersBar({ sticky = false, resultCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = React.useState(searchParams.get("q") ?? "");
  const [degree, setDegree] = React.useState(searchParams.get("degree") ?? "");
  const [branch, setBranch] = React.useState(searchParams.get("branch") ?? "");
  const [company, setCompany] = React.useState(searchParams.get("company") ?? "");
  const [location, setLocation] = React.useState(searchParams.get("location") ?? "");
  const [year, setYear] = React.useState(searchParams.get("year") ?? "");

  React.useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setDegree(searchParams.get("degree") ?? "");
    setBranch(searchParams.get("branch") ?? "");
    setCompany(searchParams.get("company") ?? "");
    setLocation(searchParams.get("location") ?? "");
    setYear(searchParams.get("year") ?? "");
  }, [searchParams]);

  // debounce for text fields
  React.useEffect(() => {
    const t = setTimeout(() => pushParams({ q, company, location }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, company, location]);

  function pushParams(partial: Record<string, string | null | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(partial).forEach(([k, v]) => {
      const val = (v ?? "").toString().trim();
      if (val) sp.set(k, val);
      else sp.delete(k);
    });
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  function onDegreeChange(next: string) {
    setDegree(next);
    pushParams({ degree: next });
  }
  function onBranchChange(next: string) {
    setBranch(next);
    pushParams({ branch: next });
  }
  function onYearCommit(next: string) {
    const clean = next && /^\d{4}$/.test(next) ? next : "";
    setYear(clean);
    pushParams({ year: clean || null });
  }

  function clearOne(key: "q" | "degree" | "branch" | "company" | "location" | "year") {
    if (key === "q") setQ("");
    if (key === "degree") setDegree("");
    if (key === "branch") setBranch("");
    if (key === "company") setCompany("");
    if (key === "location") setLocation("");
    if (key === "year") setYear("");
    pushParams({ [key]: null });
  }

  function clearAll() {
    setQ(""); setDegree(""); setBranch(""); setCompany(""); setLocation(""); setYear("");
    router.push(pathname, { scroll: false });
  }

  const activeChips: Array<{ key: "q" | "degree" | "branch" | "company" | "location" | "year"; label: string; value: string }> = [];
  if (q) activeChips.push({ key: "q", label: "Search", value: q });
  if (degree) activeChips.push({ key: "degree", label: "Degree", value: degree });
  if (branch) activeChips.push({ key: "branch", label: "Branch", value: branch });
  if (company) activeChips.push({ key: "company", label: "Company", value: company });
  if (location) activeChips.push({ key: "location", label: "Location", value: location });
  if (year) activeChips.push({ key: "year", label: "Year", value: year });

  const hasActive = activeChips.length > 0;

  return (
    <section
      className={cn(
        "rounded-2xl border bg-card/80 p-4 md:p-5 shadow-sm",
        "backdrop-blur supports-[backdrop-filter]:bg-card/60",
        sticky && "sticky top-16 z-30"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {typeof resultCount === "number" && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Showing {resultCount.toLocaleString()}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        {/* Search */}
        <Field className="col-span-12 md:col-span-5" icon={<Search className="h-4 w-4" />}>
          <Input
            placeholder="Search name, company, role, location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
            className="h-11 rounded-xl pl-10 pr-9"
          />
          {q && <Clear onClick={() => clearOne("q")} />}
        </Field>

        {/* Degree */}
        <Field className="col-span-6 md:col-span-2" icon={<GraduationCap className="h-4 w-4" />}>
          <Select value={degree || undefined} onValueChange={onDegreeChange}>
            <SelectTrigger className="h-11 rounded-xl pl-10 pr-9">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {degree && <Clear onClick={() => clearOne("degree")} />}
        </Field>

        {/* Branch */}
        <Field className="col-span-6 md:col-span-2" icon={<GitBranch className="h-4 w-4" />}>
          <Select value={branch || undefined} onValueChange={onBranchChange}>
            <SelectTrigger className="h-11 rounded-xl pl-10 pr-9">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {BRANCH_OPTIONS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {branch && <Clear onClick={() => clearOne("branch")} />}
        </Field>

        {/* Company */}
        <Field className="col-span-12 md:col-span-3" icon={<Building2 className="h-4 w-4" />}>
          <Input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            aria-label="Company"
            className="h-11 rounded-xl pl-10 pr-9"
          />
          {company && <Clear onClick={() => clearOne("company")} />}
        </Field>

        {/* Location */}
        <Field className="col-span-8 md:col-span-3" icon={<MapPin className="h-4 w-4" />}>
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
            className="h-11 rounded-xl pl-10 pr-9"
          />
          {location && <Clear onClick={() => clearOne("location")} />}
        </Field>

        {/* Year */}
        <Field className="col-span-4 md:col-span-2" icon={<Calendar className="h-4 w-4" />}>
          <Input
            inputMode="numeric"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
            onBlur={(e) => onYearCommit(e.target.value)}
            aria-label="Graduation year"
            className="h-11 rounded-xl pl-10 pr-9"
          />
          {year && <Clear onClick={() => clearOne("year")} />}
        </Field>
      </div>

      {/* Active chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!hasActive ? (
          <span className="text-xs text-muted-foreground">
            Tip: combine filters to narrow results.
          </span>
        ) : (
          activeChips.map((c) => (
            <Badge key={c.key} variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
              <span className="max-w-[24ch] truncate">{c.label}: {c.value}</span>
              <button
                type="button"
                onClick={() => clearOne(c.key)}
                className="ml-1 inline-flex items-center rounded p-0.5 hover:bg-muted"
                aria-label={`Clear ${c.label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </section>
  );
}

/* ---------------------------- UI helpers ---------------------------- */

function Field({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function Clear({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground/70 hover:bg-muted hover:text-foreground"
      aria-label="Clear field"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
