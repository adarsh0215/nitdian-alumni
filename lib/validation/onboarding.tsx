import { z } from "zod";

const thisYear = new Date().getFullYear();

export const OnboardingSchema = z.object({
  // Basic
  email: z.string().email().optional(),
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().trim().optional(),

  // Education
  degree: z.string().min(1, "Select degree"),
  branch: z.string().min(1, "Select branch"),

  // ⬇️ Make graduation_year REQUIRED (string from <Select> → number)
  graduation_year: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().min(1960).max(thisYear + 1)
  ),

  // Work
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  location: z.string().trim().optional(),

  // Profile
  bio: z.string().max(300, "Keep it under 300 characters").optional(),
  linkedin: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//i.test(v), { message: "Must be a valid URL" }),

  // Avatar
  avatar_url: z.string().url().optional(),
  avatar_file: z.instanceof(File).optional(),

  // Consent
  consent_terms: z.boolean().refine((v) => v === true, { message: "You must accept the Terms" }),
});

export type OnboardingSchemaType = z.infer<typeof OnboardingSchema>;

export function toFormDefaults(overrides?: Partial<OnboardingSchemaType>) {
  return {
    email: "",
    full_name: "",
    phone: "",
    degree: "",
    branch: "",
    // keep undefined so RHF shows placeholder until user selects (validation will require it)
    graduation_year: undefined as unknown as number,
    company: "",
    role: "",
    location: "",
    bio: "",
    linkedin: "",
    avatar_url: undefined,
    avatar_file: undefined,
    consent_terms: false,
    ...overrides,
  } as OnboardingSchemaType;
}
