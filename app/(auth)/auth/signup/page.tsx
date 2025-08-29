import SignupForm from "@/components/auth/SignupForm";

type SearchParams = Record<string, string | string[] | undefined>;
function safePath(raw: string | string[] | undefined): string {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (!val) return "/onboarding";
  const s = val.trim();
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("//")) return "/onboarding";
  if (!s.startsWith("/")) return "/onboarding";
  return s;
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const next = safePath(searchParams.next || searchParams.redirect);
  return (
    <div className="page-container py-16">
      <div className="mx-auto w-full max-w-[420px]">
        <SignupForm next={next} />
      </div>
    </div>
  );
}
