// components/onboarding/sections/LinksSection.tsx
"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Linkedin } from "lucide-react";
import type { OnboardingValues } from "@/lib/validation/onboarding";
import { normalizeLinkedIn } from "@/lib/validation/onboarding";

export default function LinksSection({ form }: { form: UseFormReturn<OnboardingValues> }) {
  // Live, read-only preview that mirrors server-side normalization
  const raw = form.watch("linkedin") || "";
  const preview = React.useMemo(() => {
    const n = normalizeLinkedIn(raw);
    return n && n.length > 0 ? n : "";
  }, [raw]);

  return (
    <section aria-labelledby="links-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="links-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Links
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[13px]">LinkedIn</FormLabel>

              {/* Input with leading icon */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Linkedin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    className="h-11 pl-9"
                    inputMode="url"
                    autoComplete="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="in/adarsh or full URL"
                    maxLength={200}
                    onBlur={(e) => {
                      // Gentle cleanup: trim only (Zod schema normalizes fully)
                      const trimmed = e.target.value.trim();
                      if (trimmed !== field.value) field.onChange(trimmed);
                    }}
                  />
                </FormControl>
              </div>

              <FormDescription className="text-[11px] leading-4 text-muted-foreground">
                Paste your full profile URL or just the handle (e.g., <code>in/adarsh</code>).
                We’ll tidy it automatically.
              </FormDescription>

              {preview ? (
                <div className="text-[11px] leading-4">
                  <a
                    href={preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-muted-foreground hover:text-foreground"
                  >
                    Preview: {preview}
                  </a>
                </div>
              ) : null}

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
