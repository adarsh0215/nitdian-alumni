// next.config.ts
import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      ...(supabaseHost ? [supabaseHost] : []),
    ],
  },
};

export default nextConfig;
