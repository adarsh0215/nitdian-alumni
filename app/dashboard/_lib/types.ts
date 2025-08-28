export type Moderation = "pending" | "approved" | "rejected" | null;

export type Profile = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;

  degree: string | null;
  branch: string | null;
  graduation_year: number | null;

  company: string | null;
  role: string | null;
  location: string | null;

  linkedin: string | null;
  bio: string | null;

  onboarded: boolean | null;
  moderation: Moderation;

  last_active_at: string | null;
};
