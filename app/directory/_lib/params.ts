import { DirectoryFilters, SearchParams } from "./types";

function getString(sp: SearchParams, key: string) {
  return typeof sp[key] === "string" ? (sp[key] as string) : "";
}
function getNumber(sp: SearchParams, key: string) {
  const raw = getString(sp, key);
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function readFilters(sp: SearchParams): DirectoryFilters {
  return {
    q: getString(sp, "q").trim(),
    degree: getString(sp, "degree").trim(),
    branch: getString(sp, "branch").trim(),
    company: getString(sp, "company").trim(),
    location: getString(sp, "location").trim(),
    year: getNumber(sp, "year"),
    page: Math.max(1, getNumber(sp, "page") ?? 1),
  };
}

/** Build `/directory?...` preserving existing filters but with a new `page` */
export function toPageHref(sp: SearchParams, page: number) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (!v) continue;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else params.set(k, v);
  }
  params.set("page", String(page));
  return `/directory?${params.toString()}`;
}
