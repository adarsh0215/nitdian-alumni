// app/(auth)/auth/login/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import LoginForm from "@/components/auth/LoginForm";

type SearchParams = {
  next?: string | string[];
  redirect?: string | string[];
  error?: string | string[];
};

function safePath(raw?: string | string[] | null): string {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (!val) return "/dashboard";
  const s = val.trim();
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("//")) return "/dashboard";
  if (!s.startsWith("/")) return "/dashboard";
  return s;
}

export default async function Page({
  searchParams,
}: {
  // ✅ Next 15: searchParams is a Promise in Server Components
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams; // <-- await before using
  const next = safePath(sp.next ?? sp.redirect ?? null);

  return (
    <div className="page-container py-16">
      <div className="mx-auto w-full max-w-[420px]">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
