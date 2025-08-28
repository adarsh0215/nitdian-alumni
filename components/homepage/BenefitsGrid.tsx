// components/landing/BenefitsGrid.tsx
import { Users, Handshake, Briefcase, Gift, CalendarDays, Images } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Benefit = {
  title: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const BENEFITS: readonly Benefit[] = [
  {
    title: "Networking, Business & Services",
    desc:
      "Grow Professionally - Leverage network, Increase your business and career prospects, Seek references, Offer services.",
    Icon: Users,
  },
  {
    title: "Mentorship & Guidance",
    desc:
      "Give back as a mentor. Support undergraduates, guide aspiring professionals, or coach peers exploring new passions.",
    Icon: Handshake,
  },
  {
    title: "Jobs & Internships",
    desc:
      "Create opportunities that matter. Share openings from your company or network to help students and fellow alumni.",
    Icon: Briefcase,
  },
  {
    title: "Exclusive Member Benefits",
    desc:
      "Enjoy alumni-only perks—special discounts and offers, and oppurtunities reserved exclusively for alumni members.",
    Icon: Gift,
  },
  {
    title: "Community Activities",
    desc:
      "Stay engaged and contribute. Join social, cultural, and community initiatives organized by the alumni association.",
    Icon: CalendarDays,
  },
  {
    title: "Nostalgia & Updates",
    desc:
      "Relive memories through reunions, events, and celebrations, while staying updated on alumni initiative and achievements.",
    Icon: Images,
  },
] as const;

export default function BenefitsGrid() {
  return (
    <section aria-labelledby="benefits-heading" className="page-container py-14 md:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
        <h2 id="benefits-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">
          What you’ll get as a member
        </h2>
        <p className="mt-2 text-muted-foreground">
          Practical ways to connect, grow, and give back—purpose-built for the NIT Durgapur alumni community.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {BENEFITS.map(({ title, desc, Icon }) => (
          <li key={title} className="group">
            <Card
              className="
                rounded-2xl border-border/80 shadow-sm
                transition-[transform,background-color,box-shadow]
                group-hover:-translate-y-0.5 group-hover:bg-muted/40
                focus-within:-translate-y-0.5
              "
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <span
                  aria-hidden
                  className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground">
                {desc}
              </CardContent>

              {/* focus target for keyboard parity with hover */}
              <button
                className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:rounded-2xl focus:outline-none focus-visible:focus-ring"
                aria-label={`Learn more about ${title}`}
                tabIndex={-1}
              />
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
