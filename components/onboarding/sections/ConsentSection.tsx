"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingSchemaType } from "@/lib/validation/onboarding";

export function ConsentSection() {
  const form = useFormContext<OnboardingSchemaType>();

  return (
    <section className="space-y-4">
      <div className="rounded-lg border p-3 bg-muted/30">
        <FormField
          control={form.control}
          name="consent_terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                  I agree to the Terms
                </FormLabel>
                <FormDescription className="text-xs">
                  Required to join the network.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormMessage />
      </div>
    </section>
  );
}
