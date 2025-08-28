"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { OnboardingSchema, toFormDefaults } from "@/lib/validation/onboarding";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { BasicSection } from "./sections/BasicSection";
import { EducationSection } from "./sections/EducationSection";
import { WorkSection } from "./sections/WorkSection";
import { ProfileSection } from "./sections/ProfileSection";
import { ConsentSection } from "./sections/ConsentSection";
import { FormActions } from "./sections/FormActions";

export type OnboardingValues = z.infer<typeof OnboardingSchema>;

export function OnboardingForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const supabase = React.useMemo(() => supabaseBrowser(), []);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: toFormDefaults(),
    mode: "onChange",
  });

  const consentOk = form.watch("consent_terms");
  const isValid = form.formState.isValid;

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);

  // Prefill
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: ures } = await supabase.auth.getUser();
      const user = ures?.user;
      if (!user) {
        router.replace("/auth/login?redirect=/onboarding");
        return;
      }
      setUserId(user.id);

      const { data: p } = await supabase
        .from("profiles")
        .select(
          "email, full_name, phone, avatar_url, degree, branch, graduation_year, company, role, location, bio, linkedin"
        )
        .eq("id", user.id)
        .maybeSingle();

      form.reset(
        toFormDefaults({
          email: p?.email ?? user.email ?? "",
          full_name: p?.full_name ?? "",
          phone: p?.phone ?? "",
          degree: p?.degree ?? "",
          branch: p?.branch ?? "",
          graduation_year: p?.graduation_year ?? undefined,
          company: p?.company ?? "",
          role: p?.role ?? "",
          location: p?.location ?? "",
          bio: p?.bio ?? "",
          linkedin: p?.linkedin ?? "",
          avatar_url: p?.avatar_url ?? undefined,
        })
      );

      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function normalizeUrl(v?: string | null) {
    if (!v) return null;
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }

  async function onSubmit(values: OnboardingValues) {
    if (!userId) return;
    setSubmitting(true);
    try {
      // Upload avatar if selected
      let finalAvatarUrl = values.avatar_url || null;
      if (values.avatar_file) {
        const file = values.avatar_file;
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image too large (max 5MB)");
          setSubmitting(false);
          return;
        }
        const safe = file.name.replace(/[^\w.\-]/g, "_");
        const path = `${userId}/${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, file, { cacheControl: "3600", contentType: file.type || "image/*", upsert: false });
        if (upErr) {
          toast.error(
            upErr.message.includes("Bucket not found")
              ? "Create a public 'avatars' bucket in Supabase Storage first."
              : `Avatar upload failed: ${upErr.message}`
          );
          setSubmitting(false);
          return;
        }
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        finalAvatarUrl = data?.publicUrl ?? null;
      }

      // Save
      const payload = {
        id: userId,
        email: values.email || null,
        full_name: values.full_name || null,
        phone: values.phone || null,
        avatar_url: finalAvatarUrl,
        degree: values.degree || null,
        branch: values.branch || null,
        graduation_year: values.graduation_year ?? null,
        company: values.company || null,
        role: values.role || null,
        location: values.location || null,
        bio: values.bio || null,
        linkedin: normalizeUrl(values.linkedin || null),
        onboarded: true,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as const;

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      toast.success("Profile saved. Welcome!");
      router.replace(nextPath);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSkip() {
    if (!userId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        onboarded: true,
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      });
      if (error) throw error;
      router.replace(nextPath);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not skip onboarding");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-10" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <BasicSection />
        <Separator />
        <EducationSection />
        <Separator />
        <WorkSection />
        <Separator />
        <ProfileSection />
        <ConsentSection />
        <FormActions
          submitting={submitting}
          canSubmit={!!consentOk && isValid && !submitting}
          onSkip={onSkip}
        />
      </form>
    </Form>
  );
}
