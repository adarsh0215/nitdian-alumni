// components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, GraduationCap, Sun, Moon } from "lucide-react";

import { useTheme } from "next-themes";

type Me = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // ---------- theme (next-themes) ----------
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "system" ? systemTheme : theme) === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // ---------- profile load ----------
  const loadMe = useCallback(async () => {
    const { data: ures } = await supabase.auth.getUser();
    const user = ures?.user;
    if (!user) {
      setMe(null);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    setMe({
      id: user.id,
      email: user.email ?? null,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadMe();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadMe();
    });
    return () => sub?.subscription.unsubscribe();
  }, [loadMe, supabase.auth]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    window.location.assign("/");
  }, [supabase]);

  // ---------- helpers ----------
  const initials = useMemo(() => {
    const base = (me?.full_name || me?.email || "U").trim();
    return base
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "U";
  }, [me]);

  const isActive = useCallback(
    (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  const linkCls = useCallback(
    (href: string) =>
      cn(
        "rounded-md px-2 py-1 text-sm transition-colors",
        isActive(href) ? "bg-muted text-foreground" : "hover:bg-muted"
      ),
    [isActive]
  );

  const links = [
    { href: "/", label: "Home" },
    { href: "/directory", label: "Directory" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/jobs", label: "Jobs" },
    ...(me ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  // ---------- render ----------
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 md:px-4">
        {/* Brand */}
        <Link href="/" aria-label="NITDIAN home" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">NITDIAN</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={linkCls(l.href)}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="h-9 w-9"
            onClick={toggleTheme}
          >
            {mounted ? (
              isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            ) : (
              <span className="h-5 w-5" />
            )}
          </Button>

          {/* Auth (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            {!loading && !me && (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}

            {!loading && me && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8">
                      {me.avatar_url ? (
                        <AvatarImage src={me.avatar_url} alt={me.full_name ?? "Avatar"} />
                      ) : (
                        <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden max-w-[160px] truncate text-sm md:block">
                      {me.full_name ?? me.email ?? "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {me.full_name ?? me.email ?? "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/onboarding">Edit profile</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {loading && <div className="h-8 w-[160px] animate-pulse rounded-md bg-muted" />}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-9 w-9 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t bg-background/95 md:hidden"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-3">
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={linkCls(l.href)}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-2 flex flex-col gap-2">
              {!loading && !me && (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}

              {!loading && me && (
                <>
                  <Link href="/dashboard" className={linkCls("/dashboard")} onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/onboarding" className={linkCls("/onboarding")} onClick={() => setOpen(false)}>
                    Edit profile
                  </Link>
                  <Button variant="destructive" size="sm" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              )}

              {loading && <div className="h-8 w-full animate-pulse rounded-md bg-muted" />}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
