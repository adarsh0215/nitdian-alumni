"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  OnboardingSchema,
  type OnboardingValues,
  toFormDefaults,
  DEGREES,
  BRANCHES,
  EMPLOYMENT_TYPES,
  INTERESTS,
  YEARS,
  COUNTRY_CODES,
} from "@/lib/validation/onboarding";

import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import IdentitySection from "./sections/IdentitySection";
import ContactSection from "./sections/ContactSection";
import AcademicSection from "./sections/AcademicSection";
import ProfessionalSection from "./sections/ProfessionalSection";
// import LinksSection from "./sections/LinksSection";
import InterestsSection from "./sections/InterestsSection";
import ConsentSection from "./sections/ConsentSection";

export type OnboardingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<OnboardingValues> | any;
};

export default function OnboardingForm({ action, defaultValues }: OnboardingFormProps) {
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: toFormDefaults(defaultValues),
    mode: "onChange",
  });

  // Re-hydrate defaults when they arrive
  React.useEffect(() => {
    if (defaultValues) form.reset(toFormDefaults(defaultValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  // Live avatar preview if your IdentitySection sets `avatar_file`
  React.useEffect(() => {
    const file = form.getValues("avatar_file") as File | undefined;
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("avatar_file")]);

  // Validate with RHF+zod; only block when invalid; prevent double-submits
  async function handlePreSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (submitting) {
      e.preventDefault();
      return;
    }
    const valid = await form.trigger();
    if (!valid) {
      e.preventDefault();
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true); // allow native submit to Server Action
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-0 shadow-none">
      <CardContent>
        <Form {...form}>
          <form
            action={action}
            method="post"
            encType="multipart/form-data" // safe if no files; required if you add them later
            onSubmit={handlePreSubmit}
            noValidate
            className="space-y-8"
          >
            {/* Identity: full_name, email, avatar_url (or avatar_file) */}
            <IdentitySection
              form={form}
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
            />

            <Separator />
            {/* Contact: phone_country, phone_number, city, country */}
            <ContactSection form={form} COUNTRY_CODES={COUNTRY_CODES} />

            <Separator />
            {/* Academic: graduation_year, degree, branch */}
            <AcademicSection form={form} YEARS={YEARS} DEGREES={DEGREES} BRANCHES={BRANCHES} />

            <Separator />
            {/* Professional: employment_type, company, designation, linkedin */}
            <ProfessionalSection form={form} EMPLOYMENT_TYPES={EMPLOYMENT_TYPES} />

            <Separator />
            {/* Interests: multiple checkboxes all named "interests" */}
            <InterestsSection form={form} INTERESTS={INTERESTS} />

            <Separator />
            {/* Consent & visibility: is_public, accepted_terms, accepted_privacy */}
            <ConsentSection form={form} />

            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="sm:w-auto"
                onClick={() => form.reset(toFormDefaults(defaultValues))}
                disabled={submitting}
              >
                Reset
              </Button>

              <Button type="submit" className="h-11 w-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
