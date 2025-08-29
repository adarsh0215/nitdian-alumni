// app/directory/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type SearchParams = {
  q?: string;
  page?: string;
  degree?: string;
  branch?: string;
  year?: string;
  employment?: string;
  interest?: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  graduation_year: number;
  degree: string;
  branch: string;
  employment_type: string;
  company: string | null;
  designation: string | null;
  linkedin: string | null;
  interests: string[]; // interest[]
  onboarded: boolean;
  is_public: boolean;
  is_approved: boolean;
};

export const metadata = {
  title: "Directory • AlumniNet",
};

async function resolveAvatarUrl(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  maybePath: string | null
): Promise<string | null> {
  if (!maybePath) return null;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const pub = supabase.storage.from("avatars").getPublicUrl(maybePath);
  if (pub.data?.publicUrl) return pub.data.publicUrl;
  const signed = await supabase.storage.from("avatars").createSignedUrl(maybePath, 60 * 60);
  return signed.data?.signedUrl ?? null;
}

function buildQS(sp: URLSearchParams, key: string, val: string | number) {
  const next = new URLSearchParams(sp);
  next.set(key, String(val));
  return `?${next.toString()}`;
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await supabaseServer();

  // require auth (change to allow anon if you want)
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) redirect("/auth/login?redirect=/directory");

  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const degree = (searchParams.degree ?? "").trim();
  const branch = (searchParams.branch ?? "").trim();
  const year = searchParams.year ? parseInt(searchParams.year, 10) : undefined;
  const employment = (searchParams.employment ?? "").trim();
  const interest = (searchParams.interest ?? "").trim();

  const PAGE_SIZE = 24;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Base query
  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, city, country, graduation_year, degree, branch, employment_type, company, designation, linkedin, interests",
      { count: "exact" }
    )
    .eq("onboarded", true)
    .eq("is_public", true)
    .eq("is_approved", true);

  // Search across a few columns
  if (q) {
    const orFilter = [
      `full_name.ilike.%${q}%`,
      `company.ilike.%${q}%`,
      `city.ilike.%${q}%`,
      `country.ilike.%${q}%`,
      `degree.ilike.%${q}%`,
      `branch.ilike.%${q}%`,
    ].join(",");
    query = query.or(orFilter);
  }

  // Filters
  if (degree) query = query.ilike("degree", `%${degree}%`);
  if (branch) query = query.ilike("branch", `%${branch}%`);
  if (employment) query = query.eq("employment_type", employment);
  if (typeof year === "number" && !Number.isNaN(year)) query = query.eq("graduation_year", year);
  if (interest) query = query.contains("interests", [interest]);

  // Sort newest grads first; page
  query = query.order("graduation_year", { ascending: false }).range(from, to);

  const { data: rows, count, error } = await query;

  if (error) {
    // If RLS blocks the select you’ll land here
    throw new Error(error.message);
  }

  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (degree) sp.set("degree", degree);
  if (branch) sp.set("branch", branch);
  if (employment) sp.set("employment", employment);
  if (year) sp.set("year", String(year));
  if (interest) sp.set("interest", interest);

  const results = rows ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Resolve avatar URLs (public/signed) in parallel
  const resolvedAvatars = await Promise.all(
    results.map((r) => resolveAvatarUrl(supabase, r.avatar_url))
  );

  return (
    <div className="px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header + search/filters */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Directory</h1>
            <p className="text-sm text-muted-foreground">Find alumni by name, company, branch, or interest.</p>
          </div>
        </div>

        {/* Filters (plain form -> GET) */}
        <form className="grid grid-cols-1 md:grid-cols-6 gap-3" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, company, city…"
            className="col-span-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <input
            type="text"
            name="degree"
            defaultValue={degree}
            placeholder="Degree"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <input
            type="text"
            name="branch"
            defaultValue={branch}
            placeholder="Branch"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <select
            name="employment"
            defaultValue={employment}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Employment</option>
            <option value="Student">Student</option>
            <option value="Employed">Employed</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            name="year"
            defaultValue={year ?? ""}
            placeholder="Year"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
          <select
            name="interest"
            defaultValue={interest}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Any interest</option>
            <option>Networking, Business & Services</option>
            <option>Mentorship & Guidance</option>
            <option>Jobs & Internships</option>
            <option>Exclusive Member Benefits</option>
            <option>Community Activities</option>
            <option>Nostalgia & Updates</option>
          </select>

          <div className="md:col-span-6 flex items-center gap-2">
            <Button type="submit" size="sm">Search</Button>
            <a href="/directory" className="text-sm text-muted-foreground hover:underline">Reset</a>
          </div>
        </form>

        {/* Results */}
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No profiles match your query.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((p, idx) => {
              const avatarUrl = resolvedAvatars[idx];
              return (
                <Card key={p.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-border bg-muted/40 flex items-center justify-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt={p.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg">👤</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">{p.full_name}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {p.degree} · {p.branch} · {p.graduation_year}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Company</span>
                        <span>{p.company || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Designation</span>
                        <span>{p.designation || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span>
                          {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                        </span>
                      </div>
                    </div>

                    {p.interests?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {p.interests.slice(0, 3).map((i: string) => (
                          <Badge key={i} variant="secondary" className="text-[11px]">
                            {i}
                          </Badge>
                        ))}
                        {p.interests.length > 3 && (
                          <Badge variant="outline" className="text-[11px]">
                            +{p.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {p.linkedin && (
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={/^https?:\/\//i.test(p.linkedin) ? p.linkedin : `https://linkedin.com/${p.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      <Button asChild size="sm">
                        <a href={`/profile/${p.id}`}>View</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <a href={buildQS(sp, "page", Math.max(1, page - 1))}>Previous</a>
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} / {totalPages} · {total} results
            </div>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <a href={buildQS(sp, "page", Math.min(totalPages, page + 1))}>Next</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
