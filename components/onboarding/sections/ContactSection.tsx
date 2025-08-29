"use client";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { OnboardingValues } from "@/lib/validation/onboarding";

/** Same helper you had; kept inline for component encapsulation */
function codeToFlagEmoji(code: string) {
  const FLAG_BY_CODE: Record<string, string> = {
    "+91":"🇮🇳","+1":"🇺🇸","+44":"🇬🇧","+61":"🇦🇺","+65":"🇸🇬",
    "+971":"🇦🇪","+974":"🇶🇦","+966":"🇸🇦","+973":"🇧🇭","+968":"🇴🇲","+965":"🇰🇼",
    "+49":"🇩🇪","+33":"🇫🇷","+34":"🇪🇸","+39":"🇮🇹","+31":"🇳🇱","+41":"🇨🇭",
    "+46":"🇸🇪","+47":"🇳🇴","+45":"🇩🇰","+358":"🇫🇮","+353":"🇮🇪","+351":"🇵🇹",
    "+30":"🇬🇷","+48":"🇵🇱","+420":"🇨🇿","+36":"🇭🇺","+40":"🇷🇴","+90":"🇹🇷",
    "+380":"🇺🇦","+7":"🇷🇺",
    "+81":"🇯🇵","+82":"🇰🇷","+86":"🇨🇳","+852":"🇭🇰","+853":"🇲🇴","+886":"🇹🇼",
    "+60":"🇲🇾","+62":"🇮🇩","+63":"🇵🇭","+66":"🇹🇭","+84":"🇻🇳",
    "+880":"🇧🇩","+92":"🇵🇰","+94":"🇱🇰","+977":"🇳🇵",
    "+64":"🇳🇿","+52":"🇲🇽","+55":"🇧🇷","+54":"🇦🇷","+56":"🇨🇱","+57":"🇨🇴","+58":"🇻🇪",
    "+20":"🇪🇬","+27":"🇿🇦","+212":"🇲🇦","+216":"🇹🇳","+234":"🇳🇬",
  };
  return FLAG_BY_CODE[code] ?? "🌐";
}

type Props = {
  form: UseFormReturn<OnboardingValues>;
  COUNTRY_CODES: ReadonlyArray<{ code: string; label: string }>;
};

export default function ContactSection({ form, COUNTRY_CODES }: Props) {
  return (
    <section aria-labelledby="contact-heading" className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3
          id="contact-heading"
          className="text-sm font-medium tracking-tight text-muted-foreground"
        >
          Contact
        </h3>
      </div>

      <div className="grid gap-5">
        {/* Phone row: fixed code column + flexible number (social-style) */}
        <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-3">
          <FormField
            control={form.control}
            name="phone_country"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                  Country code
                  <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select code" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-64">
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">
                            {codeToFlagEmoji(c.code)}
                          </span>
                          <span className="text-muted-foreground">{c.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="inline-flex items-center gap-1 text-[13px]">
                  Phone number
                  <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile"
                    className="h-11"
                    maxLength={14}
                    onChange={(e) => {
                      // Soft-sanitize to digits only; keeps your existing validation happy
                      const onlyDigits = e.target.value.replace(/\D+/g, "");
                      field.onChange(onlyDigits);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px]">City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-11"
                    placeholder="e.g. Bengaluru"
                    autoComplete="address-level2"
                    autoCapitalize="words"
                    spellCheck={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[13px]">Country</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-11"
                    placeholder="e.g. India"
                    autoComplete="country-name"
                    autoCapitalize="words"
                    spellCheck={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </section>
  );
}
