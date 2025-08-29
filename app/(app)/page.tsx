import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProCard } from "@/components/ui/pro-card";
import { Users, Calendar, Briefcase, ShieldCheck } from "lucide-react";
import Hero from "@/components/homepage/Hero";
import BenefitsGrid from "@/components/homepage/BenefitsGrid";

export const metadata = {
  title: "NITDIAN — Alumni network",
  description: "Connect with alumni, discover events and opportunities, and grow together.",
};

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <Hero/>

      {/* Value props */}
      <BenefitsGrid />
    </main>
  );
}
