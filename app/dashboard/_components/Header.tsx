import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, StatusBadge } from "./ui";
import { firstName } from "../_lib/helpers";

export default function Header({
  name,
  email,
  avatarUrl,
  isAdmin,
  moderation,
}: {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  moderation: "pending" | "approved" | "rejected";
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <Avatar size={64} src={avatarUrl} name={name} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome, {firstName(name)} 👋
            </h1>
            {isAdmin ? (
              <Badge className="bg-indigo-600 hover:bg-indigo-600">Admin</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{email ?? ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={moderation} />
        <Button asChild variant="outline">
          <Link href="/onboarding">Edit profile</Link>
        </Button>
      </div>
    </div>
  );
}
