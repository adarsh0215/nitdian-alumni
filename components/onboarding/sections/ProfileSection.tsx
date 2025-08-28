"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingSchemaType } from "@/lib/validation/onboarding";

export function ProfileSection() {
  const form = useFormContext<OnboardingSchemaType>();

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Profile</h3>
      <div className="rounded-lg border p-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input className="h-10" placeholder="https://linkedin.com/in/username" {...field} />
                </FormControl>
                <FormDescription>Paste your public LinkedIn URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Short bio…" {...field} />
                </FormControl>
                <FormDescription>Keep it crisp (≤ 300 chars).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </section>
  );
}
