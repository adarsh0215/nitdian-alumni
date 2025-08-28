// app/directory/_lib/query.ts
"use server";
import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { type Profile, type DirectoryFilters } from "./types";

const PAGE_SIZE = 24; // ⬅️ remove `export`

export async function fetchDirectory(filters: DirectoryFilters) {
  const { q, degree, branch, company, location, year, page } = filters;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await supabaseServer();

  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, degree, branch, graduation_year, company, role, location, linkedin",
      { count: "exact" }
    )
    .eq("onboarded", true)
    .eq("moderation", "approved");

  if (degree) query = query.eq("degree", degree);
  if (branch) query = query.eq("branch", branch);
  if (company) query = query.ilike("company", `%${company}%`);
  if (location) query = query.ilike("location", `%${location}%`);
  if (year) query = query.eq("graduation_year", year);
  if (q) {
    query = query.or(
      [
        `full_name.ilike.%${q}%`,
        `company.ilike.%${q}%`,
        `location.ilike.%${q}%`,
        `branch.ilike.%${q}%`,
        `role.ilike.%${q}%`,
        `degree.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data, count, error } = await query
    .order("full_name", { ascending: true, nullsFirst: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const items = (data ?? []) as Profile[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { items, total, totalPages };
}
