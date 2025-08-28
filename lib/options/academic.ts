export const DEGREES = [
  "B.Tech",
  "M.Tech",
  "Dual Degree",
  "MBA",
  "MSc",
  "PhD",
] as const;

export const BRANCHES = [
  "CSE",
  "ECE",
  "EE",
  "ME",
  "CE",
  "CH",
  "BT",
  "MME",
  "Other",
] as const;

// Years from next year down to 1980 inclusive
const current = new Date().getFullYear();
export const YEARS = Array.from(
  { length: (current + 1) - 1980 + 1 },
  (_, i) => (current + 1) - i
);
