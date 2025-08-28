// app/auth/debug/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
export default async function Debug() {
  const { data, error } = await (await supabaseServer()).auth.getUser();
  return <pre className="p-4 text-xs">{JSON.stringify({ serverUser: data.user, error }, null, 2)}</pre>;
}
