export type SearchParams = Record<string, string | string[] | undefined>;

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  degree: string | null;
  branch: string | null;
  graduation_year: number | null;
  company: string | null;
  role: string | null;           // ✅ final schema
  location: string | null;
  linkedin: string | null;
};

export type DirectoryFilters = {
  q: string;
  degree: string;
  branch: string;
  company: string;
  location: string;
  year?: number;
  page: number;
};
