"use client";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import type { OnboardingValues } from "@/lib/validation/onboarding";

type Props = {
  form: UseFormReturn<OnboardingValues>;
  YEARS: ReadonlyArray<number>;
  DEGREES: ReadonlyArray<string>;
  BRANCHES: ReadonlyArray<string>;
};

export default function AcademicSection({ form, YEARS, DEGREES, BRANCHES }: Props) {
  return (
    <section aria-labelledby="academic-heading" className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3
          id="academic-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Academics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Graduation Year */}
        <FormField
          control={form.control}
          name="graduation_year"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                Graduation year
                <span aria-hidden="true" className="text-red-500">*</span>
                <span className="sr-only">(required)</span>
              </FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select year" />
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

        {/* Branch */}
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                Department/Branch
                <span aria-hidden="true" className="text-red-500">*</span>
                <span className="sr-only">(required)</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-64">
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

        {/* Degree */}
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                Degree
                <span aria-hidden="true" className="text-red-500">*</span>
                <span className="sr-only">(required)</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-64">
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

        
      </div>
    </section>
  );
}
