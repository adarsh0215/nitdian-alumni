// lib/validation/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
});

export const signupSchema = loginSchema;
