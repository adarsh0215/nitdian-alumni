"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingValues } from "@/lib/validation/onboarding";

type Props = {
  form: UseFormReturn<OnboardingValues>;
  INTERESTS: ReadonlyArray<string>;
};

export default function InterestsSection({ form, INTERESTS }: Props) {
  const MAX = 6;
  const selected = form.watch("interests") || [];

  return (
    <section aria-labelledby="interests-heading" className="space-y-3">
      {/* Header + live counter */}
      <div className="flex items-center justify-between">
        <h3
          id="interests-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Interests
        </h3>
        <span className="text-xs text-muted-foreground">
          {selected.length}/{MAX} selected
        </span>
      </div>

      {/* Checkboxes */}
      <div
        role="group"
        aria-labelledby="interests-heading"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
      >
        {INTERESTS.map((interest) => (
          <Controller
            key={interest}
            control={form.control}
            name="interests"
            render={({ field }) => {
              const value: string[] = field.value || [];
              const isChecked = value.includes(interest);
              const atLimit = value.length >= MAX && !isChecked;

              const base =
                "inline-flex items-center justify-between rounded-lg border px-3 py-2 transition-colors";
              const selectedCls = isChecked
                ? "bg-primary/5 border-primary/40"
                : "hover:bg-muted/50";
              const disabledCls = atLimit ? "opacity-60 cursor-not-allowed" : "cursor-pointer";

              return (
                <label
                  className={`${base} ${selectedCls} ${disabledCls}`}
                  aria-disabled={atLimit ? "true" : "false"}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      disabled={atLimit && !isChecked}
                      onCheckedChange={(c) => {
                        const next = !!c; // normalize true | false | "indeterminate"
                        if (next) {
                          if (isChecked) return;
                          if (value.length >= MAX) return; // enforce cap in UI
                          field.onChange([...value, interest]);
                        } else {
                          field.onChange(value.filter((i) => i !== interest));
                        }
                      }}
                    />
                    <span className="text-sm">{interest}</span>
                  </div>
                </label>
              );
            }}
          />
        ))}
      </div>

      {/* Limit hint */}
      {selected.length >= MAX && (
        <p className="text-[11px] leading-4 text-muted-foreground">
          You’ve reached the limit of {MAX} interests.
        </p>
      )}
    </section>
  );
}
