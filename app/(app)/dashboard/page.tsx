// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata = {
  title: "Dashboard • AlumniNet",
};

// Ensure SSR (auth-sensitive)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  return (
    <main className="px-4 py-8">
      <Dashboard />
    </main>
  );
}
