"use client";
import type { UseFormReturn } from "react-hook-form";
import { Upload, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import type { OnboardingValues } from "@/lib/validation/onboarding";

type Props = {
  form: UseFormReturn<OnboardingValues>;
  preview: string | null;
  onClearPreview: () => void;
};

export default function AvatarPicker({ form, preview, onClearPreview }: Props) {
  return (
    // ← left-aligned
    <div className="flex flex-col items-start gap-3">
      <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden ring-1 ring-border bg-muted/40 flex items-center justify-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <FormField
        control={form.control}
        name="avatar_file"
        render={({ field }) => (
          // don’t force full width or it will look centered
          <FormItem className="w-auto">
            <FormControl>
              <div className="flex items-center gap-2">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) field.onChange(f);
                    }}
                  />
                  <span className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border cursor-pointer">
                    <Upload className="h-4 w-auto mr-1.5" />
                    Upload
                  </span>
                </label>

                {preview && (
                  <Button type="button" variant="ghost" size="sm" className="px-2" onClick={onClearPreview}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
