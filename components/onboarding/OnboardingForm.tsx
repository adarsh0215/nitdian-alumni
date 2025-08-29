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

/** Sections (unchanged) */
import IdentitySection from "./sections/IdentitySection";
import ContactSection from "./sections/ContactSection";
import AcademicSection from "./sections/AcademicSection";
import ProfessionalSection from "./sections/ProfessionalSection";
// import LinksSection from "./sections/LinksSection";
import InterestsSection from "./sections/InterestsSection";
import ConsentSection from "./sections/ConsentSection";

/** Props: pass server action + prefill values from the page */
export type OnboardingFormProps = {
  /** Server Action from the page: (formData: FormData) => Promise<any> */
  action: (formData: FormData) => void | Promise<void>;
  /** Prefill from DB (whatever you selected on the page) */
  defaultValues?: Partial<OnboardingValues>;
};

export default function OnboardingForm({ action, defaultValues }: OnboardingFormProps) {
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: toFormDefaults(defaultValues),
    mode: "onChange",
  });

  // If the page loads/changes defaults after mount, sync them into RHF
  React.useEffect(() => {
    if (defaultValues) {
      form.reset(toFormDefaults(defaultValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  // Live preview for newly selected avatar file
  React.useEffect(() => {
    const file = form.getValues("avatar_file") as File | undefined;
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("avatar_file")]);

  /** Validate with zod/RHF. If invalid, stop submit; otherwise let the browser
   *  submit the form to the Server Action (which handles upload + DB + redirect).
   */
  async function handlePreSubmit(e: React.FormEvent<HTMLFormElement>) {
    const valid = await form.trigger(); // run RHF+zod validators
    if (!valid) {
      e.preventDefault();
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-0 shadow-none">
      <CardContent>
        <Form {...form}>
          {/* IMPORTANT: This <form> submits to the Server Action passed via props */}
          <form action={action} onSubmit={handlePreSubmit} className="space-y-8">
            <IdentitySection
              form={form}
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
            />

            <Separator />

            <ContactSection form={form} COUNTRY_CODES={COUNTRY_CODES} />

            <Separator />

            <AcademicSection form={form} YEARS={YEARS} DEGREES={DEGREES} BRANCHES={BRANCHES} />

            <Separator />

            <ProfessionalSection form={form} EMPLOYMENT_TYPES={EMPLOYMENT_TYPES} />

            <Separator />

            {/* <LinksSection form={form} /> */}

            <InterestsSection form={form} INTERESTS={INTERESTS} />

            <Separator />

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
