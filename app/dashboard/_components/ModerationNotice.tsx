import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ModerationNotice() {
  return (
    <Card className="border-amber-300/50 bg-amber-50/60 dark:border-amber-400/40 dark:bg-amber-400/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your profile is under review</CardTitle>
        <CardDescription>
          You’ll get access to the Directory and Jobs once an admin approves your profile.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
