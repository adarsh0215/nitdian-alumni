"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { OnboardingValues } from "@/lib/validation/onboarding";

type Props = {
  form: UseFormReturn<OnboardingValues>;
  EMPLOYMENT_TYPES: ReadonlyArray<string>;
};

export default function ProfessionalSection({ form, EMPLOYMENT_TYPES }: Props) {
  // UI-only helpers for nicer placeholders
  const type = form.watch("employment_type");
  const companyPlaceholder =
    type === "Student"
      ? "Institution / Lab (optional)"
      : type === "Self-Employed"
      ? "Your company / brand"
      : "e.g., Google";
  const titlePlaceholder =
    type === "Student"
      ? "e.g., Student / Research Intern"
      : type === "Self-Employed"
      ? "e.g., Founder / Consultant"
      : "e.g., Software Engineer";

  return (
    <section aria-labelledby="professional-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="professional-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Professional
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Employment type */}
        <FormField
          control={form.control}
          name="employment_type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                Employment type
                <span aria-hidden className="text-red-500">*</span>
                <span className="sr-only">(required)</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-64">
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[13px]">Company</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11"
                  placeholder={companyPlaceholder}
                  autoComplete="organization"
                  autoCapitalize="words"
                  spellCheck={false}
                  maxLength={120}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Designation */}
        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[13px]">Designation</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11"
                  placeholder={titlePlaceholder}
                  autoComplete="organization-title"
                  autoCapitalize="words"
                  spellCheck={false}
                  maxLength={120}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn (optional) */}
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem className="space-y-2 md:col-span-3">
              <FormLabel className="text-[13px]">LinkedIn (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-11"
                  placeholder="linkedin.com/in/username or username"
                  inputMode="url"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={200}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
