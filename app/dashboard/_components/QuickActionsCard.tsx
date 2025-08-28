import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, ShieldCheck, PencilLine, Lock } from "lucide-react";

export default function QuickActionsCard({
  isAdmin,
  moderation,
}: {
  isAdmin: boolean;
  moderation: "pending" | "approved" | "rejected";
}) {
  const locked = moderation !== "approved";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription className="mt-1">
              {locked
                ? "Pending approval — core features will unlock soon."
                : "Jump in faster."}
            </CardDescription>
          </div>
          {locked && <Lock className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden />}
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        <Button asChild className="w-full" disabled={locked}>
          <Link href="/directory" aria-disabled={locked}>
            <Users className="mr-2 h-4 w-4" aria-hidden />
            Open Directory
          </Link>
        </Button>

        <Button asChild className="w-full" disabled={locked}>
          <Link href="/jobs" aria-disabled={locked}>
            <Briefcase className="mr-2 h-4 w-4" aria-hidden />
            Browse Jobs
          </Link>
        </Button>

        {isAdmin && (
          <Button asChild variant="secondary" className="w-full">
            <Link href="/admin/members">
              <ShieldCheck className="mr-2 h-4 w-4" aria-hidden />
              Moderation
            </Link>
          </Button>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href="/onboarding">
            <PencilLine className="mr-2 h-4 w-4" aria-hidden />
            Edit profile
          </Link>
        </Button>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {locked ? "Directory & Jobs unlock after admin approval." : "You have full access."}
        </p>
      </CardFooter>
    </Card>
  );
}
