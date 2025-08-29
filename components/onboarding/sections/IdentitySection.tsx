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
import { Input } from "@/components/ui/input";
import type { OnboardingValues } from "@/lib/validation/onboarding";
import AvatarPicker from "./AvatarPicker";

type Props = {
  form: UseFormReturn<OnboardingValues>;
  avatarPreview: string | null;
  setAvatarPreview: (v: string | null) => void;
};

export default function IdentitySection({
  form,
  avatarPreview,
  setAvatarPreview,
}: Props) {
  // Safely read a value that isn't in OnboardingValues' type.
  // We avoid 'watch' and 'register' to keep TS happy when avatar_url isn't in the schema.
  const avatarUrl =
    ((form.getValues() as any)?.avatar_url as string | undefined) ?? "";
  const emailValue = form.watch("email") ?? "";

  return (
    <section aria-labelledby="identity-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="identity-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Identity
        </h3>
        <span className="text-xs text-muted-foreground/80">* required</span>
      </div>

      <div className="grid gap-6 md:grid-cols-[112px,1fr]">
        {/* Left: avatar */}
        <div className="pt-1">
          <AvatarPicker
            form={form}
            preview={avatarPreview}
            onClearPreview={() => {
              form.setValue("avatar_file", undefined);
              // If you also track avatar_url elsewhere, you can clear it too:
              // (form.getValues() as any).avatar_url = "";
              setAvatarPreview(null);
            }}
          />
        </div>

        {/* Right: name & email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                  Full name <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-11"
                    placeholder="e.g. Adarsh Kumar"
                    autoComplete="name"
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={80}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                  Email <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </FormLabel>
                <FormControl>
                  {/* readOnly (not disabled) so it gets submitted */}
                  <Input
                    {...field}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="h-11"
                    readOnly
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Hidden mirrors so FormData always contains these values */}
      {/* avatar_url: not registered with RHF; plain hidden input is enough */}
      <input type="hidden" name="avatar_url" value={avatarUrl} />
      {/* email: safety mirror; harmless even with readOnly input */}
      <input type="hidden" name="email" value={emailValue} />
    </section>
  );
}
