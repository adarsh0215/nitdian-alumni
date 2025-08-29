// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  CheckCircle2,
  CircleAlert,
  UserRound,
  Building2,
  GraduationCap,
  MapPin,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  ListChecks,
  Gauge,
  Link as LinkIcon,
} from "lucide-react";

export const metadata = {
  title: "Dashboard • AlumniNet",
};

type ProfileRow = {
  id: string;
  email: string;
  avatar_url: string | null;
  full_name: string;
  phone_e164: string | null;
  city: string | null;
  country: string | null;
  graduation_year: number | null;
  degree: string | null;
  /** renamed in DB/schema: department (was branch) */
  department: string | null;
  employment_type: string | null;
  company: string | null;
  designation: string | null;
  linkedin: string | null;
  interests: string[]; // interest[]
  onboarded: boolean;
  is_public: boolean;
  is_approved: boolean;
};

// ---------- tiny helpers (keep JSX clean) ----------
function firstName(name: string | null | undefined) {
  if (!name) return "there";
  const n = name.trim();
  if (!n) return "there";
  return n.split(/\s+/)[0];
}

function displayUrl(u: string) {
  try {
    const withoutProto = u.replace(/^https?:\/\//i, "");
    return withoutProto.replace(/\/$/, "");
  } catch {
    return u;
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate">{children}</dd>
    </>
  );
}

async function resolveAvatarUrl(
  supabase: ReturnType<typeof supabaseServer>,
  maybePath: string | null
): Promise<string | null> {
  if (!maybePath) return null;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;

  const pub = (await supabase).storage.from("avatars").getPublicUrl(maybePath);
  if (pub.data?.publicUrl) return pub.data.publicUrl ?? null;

  const signed = await (await supabase)
    .storage
    .from("avatars")
    .createSignedUrl(maybePath, 60 * 60);
  return signed.data?.signedUrl ?? null;
}

function completionChecks(p: ProfileRow) {
  const checks = [
    { ok: !!p.full_name, label: "Name" },
    { ok: !!p.email, label: "Email" },
    { ok: !!p.phone_e164, label: "Phone" },
    { ok: !!p.city, label: "City" },
    { ok: !!p.country, label: "Country" },
    { ok: !!p.graduation_year, label: "Graduation year" },
    { ok: !!p.degree, label: "Degree" },
    { ok: !!p.department, label: "Department" },
    { ok: !!p.employment_type, label: "Employment status" },
    { ok: !!p.company || p.employment_type === "Student", label: "Company / Institute" },
    { ok: !!p.designation || p.employment_type === "Student", label: "Designation / Role" },
    { ok: !!p.linkedin, label: "LinkedIn" },
    { ok: (p.interests?.length ?? 0) > 0, label: "At least 1 interest" },
    { ok: typeof p.is_public === "boolean", label: "Profile visibility" },
  ];
  return checks;
}

function pctComplete(p: ProfileRow) {
  const checks = completionChecks(p);
  const got = checks.filter((c) => c.ok).length;
  return Math.round((got / checks.length) * 100);
}

// ---------- page ----------
export default async function DashboardPage() {
  const supabase = supabaseServer();

  // Auth
  const { data: { user }, error: userErr } = await (await supabase).auth.getUser();
  if (userErr || !user) redirect("/auth/login?redirect=/dashboard");

  // Profile
  const { data: profile, error } = await (await supabase)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (error || !profile || !profile.onboarded) redirect("/onboarding");

  const avatarUrl = await resolveAvatarUrl(supabase, profile.avatar_url);
  const complete = pctComplete(profile);
  const missing = completionChecks(profile).filter((c) => !c.ok).map((c) => c.label);

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ---------- HERO ---------- */}
        <header
          className="
            relative overflow-hidden rounded-3xl border
            bg-gradient-to-b from-muted/50 to-background
            p-6 md:p-8
          "
        >
          {/* brand grid backdrop */}
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-0 opacity-[0.35]
              [background-image:linear-gradient(to_right,rgba(120,120,120,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.08)_1px,transparent_1px)]
              [background-size:20px_20px]
            "
          />
          <div
            aria-hidden
            className="
              pointer-events-none absolute -inset-20
              bg-[radial-gradient(1200px_500px_at_0%_-10%,theme(colors.primary/8%),transparent_60%)]
            "
          />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* left: avatar + greeting */}
            <div className="flex items-center gap-5">
              <div className="h-18 w-18 md:h-20 md:w-20 overflow-hidden rounded-2xl ring-1 ring-border bg-muted/60 flex items-center justify-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Welcome back, {firstName(profile.full_name)}!
                </h1>
                <p className="text-sm md:text-[0.95rem] text-muted-foreground">
                  Calm, clear snapshot of your alumni profile and actions.
                </p>
              </div>
            </div>

            {/* right: status + edit */}
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {profile.is_approved ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  Approved
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <CircleAlert className="h-4 w-4" />
                  Pending approval
                </Badge>
              )}
              {profile.is_public ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground flex items-center gap-1">
                  <EyeOff className="h-4 w-4" />
                  Hidden
                </Badge>
              )}
              <Button asChild size="sm" className="ml-1">
                <a href="/onboarding">Edit profile</a>
              </Button>
            </div>
          </div>

          {/* KPI bento */}
          <div className="relative mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="shadow-none transition-all hover:translate-y-[-1px]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Gauge className="h-4 w-4" /> Profile completeness
                </div>
                <div className="mt-2 flex items-baseline gap-4">
                  <div className="text-3xl font-semibold tabular-nums">{complete}%</div>
                  <div className="h-2 w-full rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary transition-[width] duration-500 ease-out"
                      style={{ width: `${complete}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none transition-all hover:translate-y-[-1px]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" /> Verification
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {profile.is_approved ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      You’re verified. Directory unlocked.
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-5 w-5 text-amber-600" />
                      Waiting for admin review.
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none transition-all hover:translate-y-[-1px]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LinkIcon className="h-4 w-4" /> Quick links
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><a href="/directory">Directory</a></Button>
                  <Button asChild size="sm" variant="outline"><a href="/events">Events</a></Button>
                  <Button asChild size="sm" variant="outline"><a href="/jobs">Jobs</a></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* ---------- MAIN GRID ---------- */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT: Overview */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[0.95rem] font-semibold">Profile overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Academics */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Academics
                    </h3>
                    <dl className="grid grid-cols-[150px,1fr] gap-y-1 text-sm">
                      <Field label="Graduation">{profile.graduation_year ?? "—"}</Field>
                      <Field label="Degree">{profile.degree || "—"}</Field>
                      <Field label="Department">{profile.department || "—"}</Field>
                    </dl>
                  </div>

                  {/* Professional */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Professional
                    </h3>
                    <dl className="grid grid-cols-[150px,1fr] gap-y-1 text-sm">
                      <Field label="Status">{profile.employment_type || "—"}</Field>
                      <Field label="Company">{profile.company || "—"}</Field>
                      <Field label="Designation">{profile.designation || "—"}</Field>
                    </dl>
                  </div>
                </div>

                <Separator />

                {/* Location & Links */}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location
                    </h3>
                    <dl className="grid grid-cols-[150px,1fr] gap-y-1 text-sm">
                      <Field label="City">{profile.city || "—"}</Field>
                      <Field label="Country">{profile.country || "—"}</Field>
                      <Field label="Phone">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {profile.phone_e164 || "—"}
                        </span>
                      </Field>
                    </dl>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Links</h3>
                    <dl className="grid grid-cols-[150px,1fr] gap-y-1 text-sm">
                      <Field label="LinkedIn">
                        {profile.linkedin ? (
                          <a
                            className="inline-flex items-center gap-1 underline underline-offset-2"
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {displayUrl(profile.linkedin)}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </Field>
                    </dl>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Interests</h3>
                  {profile.interests?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((i) => (
                        <Badge key={i} variant="secondary">
                          {i}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests selected.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Next steps + Access */}
          <aside className="space-y-8">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[0.95rem] font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Next steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {missing.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Your profile is complete. Great job!
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Complete these to reach 100%:
                    </p>
                    <ul className="space-y-2">
                      {missing.slice(0, 6).map((label) => (
                        <li key={label} className="flex items-start gap-2">
                          <CircleAlert className="mt-0.5 h-4 w-4 text-amber-600" />
                          <span className="text-sm">{label}</span>
                        </li>
                      ))}
                    </ul>
                    {missing.length > 6 && (
                      <p className="text-xs text-muted-foreground">
                        + {missing.length - 6} more
                      </p>
                    )}
                    <Button asChild className="mt-1 w-full">
                      <a href="/onboarding">Update profile</a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[0.95rem] font-semibold">Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Dashboard</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Onboarding (edit anytime)</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Directory</span>
                  {profile.is_approved ? (
                    <Badge variant="secondary">Available</Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-700 border border-amber-200">
                      Awaiting approval
                    </Badge>
                  )}
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><a href="/directory">Open directory</a></Button>
                  <Button asChild size="sm" variant="outline"><a href="/events">Explore events</a></Button>
                  <Button asChild size="sm" variant="outline"><a href="/jobs">Find jobs</a></Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </div>
  );
}
