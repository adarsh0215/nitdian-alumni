"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, GraduationCap, Briefcase, ExternalLink, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "../_lib/types";

type Props = {
  profile: Profile;
  href?: string;                  // e.g. `/directory/${id}`
  density?: "normal" | "compact"; // optional
};

export default function DirectoryCard({
  profile,
  href = `/directory/${profile.id}`,
  density = "normal",
}: Props) {
  const initials =
    (profile.full_name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "A";

  const grad = profile.graduation_year ? String(profile.graduation_year) : null;
  const chips = [profile.degree, profile.branch].filter(Boolean) as string[];
  const hasLinkedIn = !!profile.linkedin;

  return (
    <Card
      className={cn(
        "h-full rounded-2xl border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60",
        "transition-all duration-200 hover:translate-y-[-2px] hover:shadow-sm",
        "focus-within:ring-2 focus-within:ring-primary/40"
      )}
    >
      <div className={cn("flex h-full flex-col p-5", density === "compact" && "p-4")}>
        {/* Top row */}
        <div className="flex items-start gap-4">
          <div className="rounded-2xl p-[2px]">
            <Avatar className="h-16 w-16 rounded-full">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "Avatar"} />
              ) : (
                <AvatarFallback className="bg-muted text-base font-semibold text-muted-foreground">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={href}
                className="block truncate text-[20px] font-semibold leading-6 hover:text-primary"
              >
                {profile.full_name || "—"}
              </Link>

              {hasLinkedIn && (
                <a
                  href={normalizeLinkedIn(profile.linkedin!)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/20 bg-background/70 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
                  title="Open LinkedIn"
                  aria-label="Open LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              )}
            </div>

            {/* Chips */}
            {(chips.length > 0 || grad) && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                {chips.map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="rounded-full border-muted-foreground/20 bg-muted/50 px-2.5 py-0.5"
                  >
                    {c}
                  </Badge>
                ))}
                {grad && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {grad}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-4 space-y-1.5 text-sm">
          {(profile.role || profile.company) && (
            <MetaRow icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}>
              <span className="truncate">
                {profile.role || ""}
                {profile.role && profile.company ? " · " : ""}
                {profile.company || ""}
              </span>
            </MetaRow>
          )}
          {profile.location && (
            <MetaRow icon={<MapPin className="h-4 w-4 text-muted-foreground" />}>
              <span className="truncate text-muted-foreground">{profile.location}</span>
            </MetaRow>
          )}
        </div>

        {/* Actions pinned to bottom for alignment */}
        <div className="mt-5 flex items-center gap-2 pt-1 md:mt-6 md:pt-2">
          <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3">
            <Link href={href}>View profile</Link>
          </Button>
          {hasLinkedIn && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-full px-3"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={normalizeLinkedIn(profile.linkedin!)} target="_blank" rel="noreferrer">
                LinkedIn
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function MetaRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 truncate">
      {icon}
      <div className="min-w-0 truncate">{children}</div>
    </div>
  );
}

function normalizeLinkedIn(url: string) {
  const t = url.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
