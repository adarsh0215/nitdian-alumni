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
import { Badge } from "@/components/ui/badge";
import { Progress } from "./ui";
import { CheckCircle2 } from "lucide-react";

export default function ProfileCompletionCard({
  completion,
  requiredMissing,
  optionalMissing,
}: {
  completion: number;
  requiredMissing: string[];
  optionalMissing: string[];
}) {
  const missing = [
    ...requiredMissing.map((label) => ({ label, required: true })),
    ...optionalMissing.map((label) => ({ label, required: false })),
  ];

  const top = missing.slice(0, 4); // show only a few, keep it minimal
  const more = Math.max(0, missing.length - top.length);
  const done = completion >= 100 || missing.length === 0;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Profile completion</CardTitle>
            <CardDescription className="mt-1">
              {done ? "Looks great. Add more details anytime." : "Add a few details to unlock everything."}
            </CardDescription>
          </div>
          {done && <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" aria-hidden />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div aria-label={`Profile ${completion}% complete`}>
          <Progress value={completion} />
        </div>

        {!done && (
          <div className="flex flex-wrap gap-2">
            {top.map((item, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="rounded-full px-2.5 py-1"
                title={item.required ? "Required" : "Recommended"}
              >
                {item.label}
                {item.required ? <span className="ml-1 text-[10px] text-muted-foreground">*</span> : null}
              </Badge>
            ))}
            {more > 0 && (
              <Badge variant="outline" className="rounded-full px-2.5 py-1">
                +{more} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button asChild>
          <Link href="/onboarding">{done ? "Edit profile" : "Add details"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
