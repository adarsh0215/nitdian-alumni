import type { Profile, Moderation } from "./types";

export function firstName(name: string) {
  return name.split(/\s+/)[0] || name;
}

export function ensureModeration(m: Moderation): "pending" | "approved" | "rejected" {
  return (m ?? "pending") as "pending" | "approved" | "rejected";
}

export function missingFields(profile: Profile) {
  const requiredMissing = [
    !profile.full_name && "Full name",
    !profile.degree && "Degree",
    !profile.branch && "Branch",
  ].filter(Boolean) as string[];

  const optionalMissing = [
    !profile.graduation_year && "Graduation year",
    !profile.company && "Company",
    !profile.role && "Role",
    !profile.location && "Location",
    !profile.phone && "Phone",
    !profile.linkedin && "LinkedIn",
    !profile.bio && "Short bio",
  ].filter(Boolean) as string[];

  return { requiredMissing, optionalMissing };
}

export function completionPercent(profile: Profile) {
  const totalFields = 3 + 7; // 3 required + 7 optional
  const completed =
    (profile.full_name ? 1 : 0) +
    (profile.degree ? 1 : 0) +
    (profile.branch ? 1 : 0) +
    (profile.graduation_year ? 1 : 0) +
    (profile.company ? 1 : 0) +
    (profile.role ? 1 : 0) +
    (profile.location ? 1 : 0) +
    (profile.phone ? 1 : 0) +
    (profile.linkedin ? 1 : 0) +
    (profile.bio ? 1 : 0);

  return Math.min(100, Math.round((completed / totalFields) * 100));
}
