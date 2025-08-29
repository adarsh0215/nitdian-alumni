"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";

import {
  OnboardingSchema,
  type OnboardingValues,
  toFormDefaults,
  valuesToUpsert,
  DEGREES,
  BRANCHES,
  EMPLOYMENT_TYPES,
  INTERESTS,
  YEARS,
  COUNTRY_CODES,
} from "@/lib/validation/onboarding";

import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

/** ---------- helpers (unchanged logic) ---------- */
function extFromFilename(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "webp";
}
async function getPublicOrSignedUrl(
  supabase: ReturnType<typeof supabaseBrowser>,
  bucket: string,
  path: string
): Promise<string | null> {
  const pub = supabase.storage.from(bucket).getPublicUrl(path);
  if (pub.data?.publicUrl) return pub.data.publicUrl;
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return signed.data?.signedUrl ?? null;
}

/** ---------- sections ---------- */
import IdentitySection from "./sections/IdentitySection";
import ContactSection from "./sections/ContactSection";
import AcademicSection from "./sections/AcademicSection";
import ProfessionalSection from "./sections/ProfessionalSection";
import LinksSection from "./sections/LinksSection";
import InterestsSection from "./sections/InterestsSection";
import ConsentSection from "./sections/ConsentSection";

export default function OnboardingForm() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: toFormDefaults(),
    mode: "onChange",
  });

  // Load user + profile (unchanged)
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
          toast.error("Please log in first.");
          router.push("/auth/login?redirect=/onboarding");
          return;
        }

        const { data: row, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error(error);
          toast.error("Failed to load your profile.");
        }

        const authEmail =
          user.email ??
          (typeof user.user_metadata?.email === "string" ? user.user_metadata.email : "") ??
          "";

        const defaults = toFormDefaults({ ...row, email: row?.email ?? authEmail });
        if (!active) return;
        form.reset(defaults);

        if (row?.avatar_url) {
          if (/^https?:\/\//i.test(row.avatar_url)) {
            setAvatarPreview(row.avatar_url);
          } else {
            const url = await getPublicOrSignedUrl(supabase, "avatars", row.avatar_url);
            setAvatarPreview(url);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live avatar preview (unchanged)
  React.useEffect(() => {
    const file = form.getValues("avatar_file") as File | undefined;
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("avatar_file")]);

  // Submit (unchanged)
  async function onSubmit(values: OnboardingValues) {
    setSubmitting(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast.error("Please log in first.");
        router.push("/auth/login?redirect=/onboarding");
        return;
      }

      const email =
        values.email || user.email || (user.user_metadata?.email as string | undefined) || "";
      if (!email) {
        toast.error("Email is required.");
        return;
      }

      // Avatar upload
      let avatar_url: string | null | undefined = avatarPreview ?? null;
      const file = values.avatar_file as File | undefined;
      if (file) {
        const ext = extFromFilename(file.name);
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true });
        if (upErr) {
          console.error("Avatar upload failed", upErr);
          toast.error(upErr.message || "Failed to upload avatar.");
          return;
        }
        const resolved = await getPublicOrSignedUrl(supabase, "avatars", path);
        avatar_url = resolved ?? path;
      }

      // Upsert
      const payload = valuesToUpsert(values, { userId: user.id, email, avatar_url });
      if (payload.id !== user.id) {
        toast.error("Auth mismatch. Please re-login.");
        return;
      }

      const upsertRes = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (upsertRes.error) {
        if (upsertRes.status === 406 || upsertRes.status === 400) {
          const probe = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (probe.error) {
            toast.error(probe.error.message || "Could not save your profile.");
            return;
          }
        } else {
          toast.error(upsertRes.error.message || "Could not save your profile.");
          return;
        }
      }

      toast.success("Onboarding complete! Redirecting…");
      router.replace("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-0 shadow-none">

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <IdentitySection
              form={form}
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
            />

            <Separator />

            <ContactSection form={form} COUNTRY_CODES={COUNTRY_CODES} />

            <Separator />

            <AcademicSection
              form={form}
              YEARS={YEARS}
              DEGREES={DEGREES}
              BRANCHES={BRANCHES}
            />

            <Separator />

            <ProfessionalSection
              form={form}
              EMPLOYMENT_TYPES={EMPLOYMENT_TYPES}
            />

            <Separator />

            {/* <LinksSection form={form} /> */}

            <InterestsSection form={form} INTERESTS={INTERESTS} />

            <Separator />

            <ConsentSection form={form} />

            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
              <Button type="button" variant="ghost" className="sm:w-auto" onClick={() => form.reset()}>
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
