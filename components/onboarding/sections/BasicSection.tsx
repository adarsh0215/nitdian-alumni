"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AvatarUploader } from "../AvatarUploader";
import type { OnboardingSchemaType } from "@/lib/validation/onboarding";

export function BasicSection() {
  const form = useFormContext<OnboardingSchemaType>();

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Basic</h3>
      <div className="rounded-lg border p-4">
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-12">
          {/* Avatar (optional) */}
          <div className="md:col-span-3 flex items-start md:items-center">
            <FormField
              control={form.control}
              name="avatar_file"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col items-center md:items-start">
                  <FormLabel className="sr-only">Profile photo</FormLabel>
                  <FormControl>
                    <AvatarUploader
                      value={field.value as File | undefined}
                      previewUrl={form.getValues("avatar_url") || undefined}
                      onChange={(file, previewUrl) => {
                        field.onChange(file);
                        form.setValue("avatar_url", previewUrl || undefined);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="mt-2">PNG/JPG, up to 5MB.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fields */}
          <div className="md:col-span-9 grid gap-4 md:grid-cols-2">
            {/* Email (optional) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="h-10" placeholder="you@alumni.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full name (required) */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:ml-0.5 after:text-destructive after:content-['*']">
                    Full name
                  </FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="e.g., Priya Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone (optional) */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input className="h-10" placeholder="+91 98xxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="hidden md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
