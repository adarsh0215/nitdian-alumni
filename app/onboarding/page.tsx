"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  const params = useSearchParams();
  const next = params.get("next") || params.get("redirect") || "/dashboard";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <Card className="border-muted/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">
            Complete your profile
          </CardTitle>
          <CardDescription>
            A polished profile helps alumni discover and connect with you. You
            can always edit later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm nextPath={next} />
        </CardContent>
      </Card>
    </main>
  );
}
