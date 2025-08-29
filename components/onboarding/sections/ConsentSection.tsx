"use client";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type { OnboardingValues } from "@/lib/validation/onboarding";

export default function ConsentSection({ form }: { form: UseFormReturn<OnboardingValues> }) {
  return (
    <section aria-labelledby="consent-heading" className="space-y-3">
      {/* Section header + hint */}
      <div className="flex items-center justify-between">
        <h3
          id="consent-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Visibility & consent
        </h3>
        <span className="text-xs text-muted-foreground">* required</span>
      </div>

      <div className="space-y-3">
        {/* Public directory toggle */}
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem
              className="flex items-center justify-between rounded-lg border p-4 sm:p-5"
              aria-labelledby="public-label"
              aria-describedby="public-desc"
            >
              <div className="pr-4">
                <FormLabel id="public-label" className="mb-0 text-[13px]">
                  List me in public directory
                </FormLabel>
                <FormDescription id="public-desc" className="text-[11px] leading-4">
                  When approved, your basic profile is visible to members. You can change this later.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Toggle public listing" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Terms */}
        <FormField
          control={form.control}
          name="accepted_terms"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 rounded-lg border p-4 sm:p-5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-labelledby="terms-label"
                />
              </FormControl>
              <div className="space-y-1 leading-tight">
                <FormLabel id="terms-label" className="font-normal text-[13px] inline-flex items-center gap-1">
                  I agree to the{" "}
                  <a className="underline" href="/terms" target="_blank" rel="noreferrer">
                    Terms
                  </a>
                  <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Privacy */}
        <FormField
          control={form.control}
          name="accepted_privacy"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 rounded-lg border p-4 sm:p-5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-labelledby="privacy-label"
                />
              </FormControl>
              <div className="space-y-1 leading-tight">
                <FormLabel id="privacy-label" className="font-normal text-[13px] inline-flex items-center gap-1">
                  I agree to the{" "}
                  <a className="underline" href="/privacy" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                  <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
