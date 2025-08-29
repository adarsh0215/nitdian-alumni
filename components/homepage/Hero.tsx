// components/homepage/Hero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/* -------------------- Motion -------------------- */
const easeOut = [0.2, 0.8, 0.2, 1] as const;

const makeFadeUp = (reduced: boolean | null): Variants => {
  const r = !!reduced;
  return {
    hidden: r ? { opacity: 1 } : { opacity: 0, y: 22 },
    show: r
      ? { opacity: 1 }
      : { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };
};

const makeStagger = (reduced: boolean | null): Variants => ({
  hidden: {},
  show: reduced ? {} : { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
});

/* -------------------- Component -------------------- */
export default function Hero({
  image = "/images/delhi-chapter-hero.jpg",
  priorityImage = true,
  blurPx = 2,
  overlayStrength = 0.65,
}: {
  image?: string;
  priorityImage?: boolean;
  blurPx?: number;
  overlayStrength?: number;
}) {
  const reduced = useReducedMotion();
  const fade = makeFadeUp(reduced);
  const st = makeStagger(reduced);

  return (
    <section className="relative isolate">
      {/* Fallback background */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(1200px_600px_at_50%_0%,_#0b2a2f_20%,_#091717_60%,_#000_100%)]" />

      {/* Background image */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src={image}
          alt=""
          role="presentation"
          fill
          priority={priorityImage}
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: `blur(${Math.max(0, blurPx)}px) saturate(1.04)` }}
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,${overlayStrength}), rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.25))`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/15 [mask-image:radial-gradient(65%_60%_at_50%_40%,black,transparent)]" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[88svh] flex-col items-center justify-center py-20 sm:py-24 md:py-28">
          <motion.div
            variants={st}
            initial="hidden"
            animate="show"
            className="relative z-10 mx-auto max-w-[46rem] text-center"
          >
            <motion.h1
              variants={fade}
              className="text-balance font-semibold leading-tight tracking-tight text-white
                         [font-size:clamp(2.35rem,2.6vw+1.6rem,4.3rem)]"
            >
              Connect. Collaborate. <span className="">Contribute.</span>
            </motion.h1>

            <motion.p
              variants={fade}
              className="mx-auto mt-4 max-w-prose text-white/85
                         [font-size:clamp(1rem,0.45vw+0.9rem,1.2rem)]"
            >
              The official NIT Durgapur International Alumni Network.
            </motion.p>

            <motion.div variants={fade} className="mt-8 flex justify-center">
              <Button asChild size="lg" className="h-11 px-6 shadow-md">
                <Link href="/auth/login?redirect=/onboarding">
                  Register &amp; Join <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
