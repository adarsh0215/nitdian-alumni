"use client";

import { useFormContext } from "react-hook-form";
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
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BRANCHES, DEGREES, YEARS } from "@/lib/options/academic";
import type { OnboardingSchemaType } from "@/lib/validation/onboarding";

export function EducationSection() {
  const form = useFormContext<OnboardingSchemaType>();

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Education</h3>
      <div className="rounded-lg border p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Degree (required) */}
          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                  Degree
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEGREES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Branch (required) */}
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                  Branch
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Graduation year (optional per schema) */}
          <FormField
  control={form.control}
  name="graduation_year"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
        Graduation year
      </FormLabel>
      <Select
        onValueChange={(v) => field.onChange(v)}        // string → z.coerce.number()
        value={field.value ? String(field.value) : undefined}
      >
        <FormControl>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-64">
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

        </div>
      </div>
    </section>
  );
}
