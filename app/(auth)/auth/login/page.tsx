import LoginForm from "@/components/auth/LoginForm";

type SearchParams = Record<string, string | string[] | undefined>;
function safePath(raw: string | string[] | undefined): string {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (!val) return "/dashboard";
  const s = val.trim();
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("//")) return "/dashboard";
  if (!s.startsWith("/")) return "/dashboard";
  return s;
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const next = safePath(searchParams.next || searchParams.redirect);
  return (
    <div className="page-container py-16">
      <div className="mx-auto w-full max-w-[420px]">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
