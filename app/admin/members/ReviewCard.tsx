"use client";

import { useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, MapPin, Loader2 } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  degree: string | null;
  branch: string | null;
  graduation_year: number | null;
  company: string | null;
  role: string | null;
  location: string | null;
  linkedin: string | null;
  bio: string | null;
};

export default function ReviewCard({ profile }: { profile: Profile }) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    const { error } = await supabase
      .from("profiles")
      .update({
        moderation: action === "approve" ? "approved" : "rejected",
        moderated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setLoading(null);

    if (error) {
      toast.error(`Failed to ${action} ${profile.full_name}`);
    } else {
      toast.success(`${profile.full_name} ${action}d`);
      window.location.reload(); // simplest way to refresh list
    }
  }

  const initials =
    (profile.full_name || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "A";

  return (
    <Card className="shadow-sm hover:shadow-md transition">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? ""}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground truncate">{profile.bio || profile.email}</p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {profile.degree || profile.branch || profile.graduation_year ? (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  <span>
                    {profile.degree} {profile.branch} {profile.graduation_year || ""}
                  </span>
                </div>
              ) : null}
              {profile.company || profile.role ? (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>
                    {profile.role} {profile.role && profile.company ? "·" : ""} {profile.company}
                  </span>
                </div>
              ) : null}
              {profile.location ? (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading !== null}
            onClick={() => handleAction("reject")}
          >
            {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
          </Button>
          <Button
            size="sm"
            disabled={loading !== null}
            onClick={() => handleAction("approve")}
          >
            {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
