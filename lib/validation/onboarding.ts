// lib/validation/onboarding.ts
import { z } from "zod";

/* ---------------------------------------
 * Shared option sources (UI + validation)
 * ------------------------------------- */

// Keep degrees/branches as text in DB, but constrain UI picks for consistency.
export const DEGREES = [
  "B.Tech",
  "M.Tech",
  "MBA",
  "PhD",
  "Other",
] as const;

export const BRANCHES = [
  "Biotechnology",
  "Civil Engineering",
  "Chemical Engineering",
  "Computer Science & Engineering",
  "Chemistry",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Earth & Environmental Studies",
  "Humanities & Social Sciences",
  "Mathematics",
  "Mechanical Engineering",
  "Metallurgical & Materials Engineering",
  "Management Studies",
  "Physics",
] as const;

export const EMPLOYMENT_TYPES = [
  "Student",
  "Employed",
  "Self-Employed",
  "Unemployed",
  "Other",
] as const;

// EXACT strings — must match your Postgres ENUM `interest`
export const INTERESTS = [
  "Networking, Business & Services",
  "Mentorship & Guidance",
  "Jobs & Internships",
  "Exclusive Member Benefits",
  "Community Activities",
  "Nostalgia & Updates",
] as const;

/** Country calling codes: widely used set for alumni audience */
export const COUNTRY_CODES = [
  { label: "India", code: "+91" },
  { label: "USA / Canada", code: "+1" },
  { label: "United Kingdom", code: "+44" },
  { label: "Australia", code: "+61" },
  { label: "Singapore", code: "+65" },
  { label: "United Arab Emirates", code: "+971" },
  { label: "Qatar", code: "+974" },
  { label: "Saudi Arabia", code: "+966" },
  { label: "Bahrain", code: "+973" },
  { label: "Oman", code: "+968" },
  { label: "Kuwait", code: "+965" },
  { label: "Germany", code: "+49" },
  { label: "France", code: "+33" },
  { label: "Spain", code: "+34" },
  { label: "Italy", code: "+39" },
  { label: "Netherlands", code: "+31" },
  { label: "Switzerland", code: "+41" },
  { label: "Sweden", code: "+46" },
  { label: "Norway", code: "+47" },
  { label: "Denmark", code: "+45" },
  { label: "Finland", code: "+358" },
  { label: "Ireland", code: "+353" },
  { label: "Portugal", code: "+351" },
  { label: "Greece", code: "+30" },
  { label: "Poland", code: "+48" },
  { label: "Czechia", code: "+420" },
  { label: "Hungary", code: "+36" },
  { label: "Romania", code: "+40" },
  { label: "Turkey", code: "+90" },
  { label: "Ukraine", code: "+380" },
  { label: "Russia", code: "+7" },
  { label: "Japan", code: "+81" },
  { label: "South Korea", code: "+82" },
  { label: "China", code: "+86" },
  { label: "Hong Kong", code: "+852" },
  { label: "Macau", code: "+853" },
  { label: "Taiwan", code: "+886" },
  { label: "Malaysia", code: "+60" },
  { label: "Indonesia", code: "+62" },
  { label: "Philippines", code: "+63" },
  { label: "Thailand", code: "+66" },
  { label: "Vietnam", code: "+84" },
  { label: "Bangladesh", code: "+880" },
  { label: "Pakistan", code: "+92" },
  { label: "Sri Lanka", code: "+94" },
  { label: "Nepal", code: "+977" },
  { label: "New Zealand", code: "+64" },
  { label: "Mexico", code: "+52" },
  { label: "Brazil", code: "+55" },
  { label: "Argentina", code: "+54" },
  { label: "Chile", code: "+56" },
  { label: "Colombia", code: "+57" },
  { label: "Venezuela", code: "+58" },
  { label: "Egypt", code: "+20" },
  { label: "South Africa", code: "+27" },
  { label: "Morocco", code: "+212" },
  { label: "Tunisia", code: "+216" },
  { label: "Nigeria", code: "+234" },
] as const;

// Precompute a length-desc list for robust prefix matching in splitE164
const COUNTRY_CODES_DESC = [...COUNTRY_CODES].sort(
  (a, b) => b.code.length - a.code.length
);

/** Years helper (1965 → currentYear + 10) */
const NOW = new Date();
export const YEARS = (() => {
  const max = NOW.getUTCFullYear() + 5;
  const out: number[] = [];
  for (let y = max; y >= 1965; y--) out.push(y);
  return out;
})();

/* ---------------------------------------
 * Small utilities
 * ------------------------------------- */

export function normalizeLinkedIn(input: string | null | undefined): string | null {
  if (!input) return null;
  let v = input.trim();
  if (!v) return null;

  // Allow vanity like "in/adarsh" or "adarsh"
  if (!/^https?:\/\//i.test(v)) {
    if (/^in\//i.test(v)) v = `https://www.linkedin.com/${v}`;
    else v = `https://www.linkedin.com/in/${v}`;
  }

  try {
    const u = new URL(v);
    if (u.hostname.endsWith("linkedin.com")) {
      u.search = "";
      u.hash = "";
      return u.toString();
    }
    return v;
  } catch {
    return v;
  }
}

/** Assemble +<cc><number> with basic sanity. */
export function assembleE164(countryCode: string, local: string): string | null {
  const cc = (countryCode || "").replace(/\s+/g, "");
  const num = (local || "").replace(/\D+/g, "");
  if (!cc || !num) return null;
  if (!/^\+\d{1,3}$/.test(cc)) return null;
  const e164 = `${cc}${num}`;
  // E.164 allows max 15 digits (including country code, excluding '+')
  if (!/^\+\d{7,15}$/.test(e164)) return null;
  return e164;
}

/** Split a stored E.164 into { country, number } using longest-matching CC. */
export function splitE164(e164?: string | null): { country: string; number: string } {
  if (!e164 || !/^\+\d{7,15}$/.test(e164)) {
    return { country: "+91", number: "" }; // sensible default
  }

  // Prefer the longest match among known codes (handles +971, +380, +886, +7, +1, etc.)
  const match = COUNTRY_CODES_DESC.find((c) => e164.startsWith(c.code));
  if (match) {
    return { country: match.code, number: e164.slice(match.code.length) };
  }

  // Fallback: assume a 3-char code like +81, +44, etc.
  return { country: e164.slice(0, 3), number: e164.slice(3) };
}

/* ---------------------------------------
 * Zod schema (FORM values)
 * ------------------------------------- */

const FullName = z.string().trim().min(2, "Please enter your full name");
const Email = z.string().email("Enter a valid email");
const Degree = z.enum(DEGREES, { required_error: "Select a degree" });
const Branch = z.enum(BRANCHES, { required_error: "Select a department/branch" });
const EmploymentType = z.enum(EMPLOYMENT_TYPES, { required_error: "Select employment type" });
const Interest = z.enum(INTERESTS);

const GraduationYear = z
  .number({ invalid_type_error: "Select a graduation year" })
  .refine((y) => YEARS.includes(y), "Select a valid year");

const CountryCode = z
  .string()
  .regex(/^\+\d{1,3}$/, "Select a valid country code");

const PhoneNumber = z
  .string()
  .regex(/^\d{6,14}$/, "Enter a valid phone number (digits only)");

/** Onboarding form schema (what your React form works with) */
export const OnboardingSchema = z
  .object({
    // Identity
    full_name: FullName,
    email: Email, // readonly/disabled in UI but validated here

    // Avatar (optional file input in the form)
    avatar_file: z.instanceof(File).optional().or(z.null()).optional(),

    // Contact
    phone_country: CountryCode,
    phone_number: PhoneNumber,
    city: z.string().trim().max(80).optional().or(z.literal("")),
    country: z.string().trim().max(80).optional().or(z.literal("")),

    // Academic
    graduation_year: GraduationYear,
    degree: Degree,
    branch: Branch,

    // Professional
    employment_type: EmploymentType,
    company: z.string().trim().max(120).optional().or(z.literal("")),
    designation: z.string().trim().max(120).optional().or(z.literal("")),

    // Links
    linkedin: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal(""))
      .transform((v) => normalizeLinkedIn(v || "") || ""),

    // Interests (0..6)
    interests: z.array(Interest).max(6).default([]),

    // Visibility & consent
    is_public: z.boolean().default(true),
    accepted_terms: z.boolean().refine((v) => v === true, { message: "You must accept the Terms" }),
    accepted_privacy: z.boolean().refine((v) => v === true, { message: "You must accept the Privacy Policy" }),
  })
  .refine(
    (vals) => assembleE164(vals.phone_country, vals.phone_number) !== null,
    {
      message: "Phone number is invalid",
      path: ["phone_number"],
    }
  );

export type OnboardingValues = z.infer<typeof OnboardingSchema>;

/* ---------------------------------------
 * Default values + DB mapping helpers
 * ------------------------------------- */

export type ProfileRow = {
  id: string;
  email: string;
  avatar_url: string | null;
  full_name: string;
  phone_e164: string | null;
  city: string | null;
  country: string | null;
  graduation_year: number;
  degree: string;
  branch: string;
  employment_type: string;
  company: string | null;
  designation: string | null;
  linkedin: string | null;
  interests: string[]; // interest[]
  onboarded: boolean;
  is_public: boolean;
  is_approved: boolean;
  accepted_terms: boolean;
  accepted_privacy: boolean;
};

/** Build clean form defaults from an existing row (or empty). */
export function toFormDefaults(existing?: Partial<ProfileRow> | null): OnboardingValues {
  const phone = splitE164(existing?.phone_e164 ?? null);

  // Pick nearest valid year (fallback to current)
  const current = NOW.getUTCFullYear();
  const defaultYear = YEARS.includes(existing?.graduation_year as number)
    ? (existing!.graduation_year as number)
    : Math.min(Math.max(current, 1965), NOW.getUTCFullYear() + 10);

  return {
    // Identity
    full_name: existing?.full_name ?? "",
    email: existing?.email ?? "",

    // Avatar
    avatar_file: undefined,

    // Contact
    phone_country: phone.country,
    phone_number: phone.number,
    city: existing?.city ?? "",
    country: existing?.country ?? "",

    // Academic
    graduation_year: defaultYear,
    degree: (existing?.degree as (typeof DEGREES)[number]) ?? "B.Tech",
    branch: (existing?.branch as (typeof BRANCHES)[number]) ?? "CSE",

    // Professional
    employment_type:
      (existing?.employment_type as (typeof EMPLOYMENT_TYPES)[number]) ?? "Student",
    company: existing?.company ?? "",
    designation: existing?.designation ?? "",

    // Links
    linkedin: normalizeLinkedIn(existing?.linkedin ?? "") ?? "",

    // Interests
    interests: (existing?.interests as (typeof INTERESTS)[number][]) ?? [],

    // Visibility & consent (UI will force true on submit)
    is_public: existing?.is_public ?? true,
    accepted_terms: existing?.accepted_terms ?? false,
    accepted_privacy: existing?.accepted_privacy ?? false,
  };
}

/**
 * Convert validated form values → DB upsert payload aligned with `profiles` columns.
 * - Requires `userId` and `email` you trust (from Supabase auth).
 * - Provide an `avatar_url` you computed after uploading (or pass existing).
 */
export function valuesToUpsert(
  vals: OnboardingValues,
  args: { userId: string; email: string; avatar_url?: string | null }
) {
  const phone_e164 = assembleE164(vals.phone_country, vals.phone_number);
  return {
    id: args.userId,
    email: args.email,
    avatar_url: args.avatar_url ?? null,

    full_name: vals.full_name.trim(),
    phone_e164,
    city: vals.city?.trim() || null,
    country: vals.country?.trim() || null,

    graduation_year: vals.graduation_year,
    degree: vals.degree,
    branch: vals.branch,

    employment_type: vals.employment_type,
    company: vals.company?.trim() || null,
    designation: vals.designation?.trim() || null,

    linkedin: normalizeLinkedIn(vals.linkedin || "") || null,
    interests: vals.interests,

    is_public: !!vals.is_public,
    onboarded: true, // flip on first successful onboarding
    is_approved: false, // stays false until admin approves

    accepted_terms: true,
    accepted_privacy: true,
  } satisfies Partial<ProfileRow>;
}
