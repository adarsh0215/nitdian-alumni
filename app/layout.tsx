import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider>

          <main className="min-h-dvh">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}