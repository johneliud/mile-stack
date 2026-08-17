"use client";

import { ShieldCheck, Globe, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedProjectCard } from "@/components/AnimatedProjectCard";
import { LandingHeroCta } from "@/components/LandingHeroCta";
import { LandingBottomCta } from "@/components/LandingBottomCta";
import { StackedScrollCards } from "@/components/StackedScrollCards";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Trustless escrow",
    badge: "Soroban Verified",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-600 border-none",
    fillClass: "bg-amber-500 border-amber-600/70",
    filled: true,
    description:
      "Neither party needs to trust the other. The Soroban contract enforces the agreed payment rules hence no intermediary required.",
  },
  {
    icon: Globe,
    title: "Borderless payments",
    badge: "Global Liquidity",
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    iconBg: "bg-blue-500/10 text-blue-600 border-none",
    fillClass: "bg-card border-border",
    filled: false,
    description:
      "Transact globally without needing the same banking infrastructure. Any Stellar wallet, anywhere in the world.",
  },
  {
    icon: Clock,
    title: "Near-instant settlement",
    badge: "Sub-5s Finality",
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-600 border-none",
    fillClass: "bg-emerald-600 border-emerald-700/70",
    filled: true,
    description:
      "Traditional international transfers take 2–7 days. Stellar settles in seconds for a fraction of the cost.",
  },
];

const STEPS = [
  {
    number: "01",
    tag: "Discovery",
    tagClass: "bg-slate-100 text-slate-700 border-slate-200",
    numClass: "text-slate-400",
    fillClass: "bg-background border-border",
    filled: false,
    title: "Browse open projects",
    body: "Explore projects posted by global clients. No account needed. Just connect your Freighter wallet when you're ready to apply.",
  },
  {
    number: "02",
    tag: "Contract Match",
    tagClass: "bg-blue-50 text-blue-700 border-blue-200/80",
    numClass: "text-blue-600",
    fillClass: "bg-blue-600 border-blue-700/70",
    filled: true,
    title: "Apply and get hired",
    body: "Submit your application with a cover message. The client reviews applicants and accepts one, triggering the on-chain escrow contract.",
  },
  {
    number: "03",
    tag: "Milestone Escrow",
    tagClass: "bg-amber-50 text-amber-800 border-amber-200/80",
    numClass: "text-amber-600",
    fillClass: "bg-background border-border",
    filled: false,
    title: "Complete milestones",
    body: "Work through each milestone. The client funds and approves each one individually so you're never waiting on a lump-sum payment.",
  },
  {
    number: "04",
    tag: "Instant Payout",
    tagClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    numClass: "text-emerald-600",
    fillClass: "bg-emerald-600 border-emerald-700/70",
    filled: true,
    title: "Get paid in XLM instantly",
    body: "The smart contract releases XLM directly to your Stellar wallet in seconds. No bank, no wire fee, no waiting.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />

      <main className="flex-1">
        {/* - Hero - */}
        <section className="relative overflow-hidden border-b border-border bg-background">
          {/* Subtle ambient light glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(37,99,235,0.06),transparent_80%)]" />

          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:py-12 lg:py-14">
              {/* Left: copy */}
              <div className="flex flex-col">
                <h1
                  className="animate-fade-up text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-[4rem] lg:leading-tight"
                  style={{ animationDelay: "80ms" }}
                >
                  Unlocking Global Opportunities for Talent in the{" "}
                  <span className="text-accent font-heading">Global South</span>
                </h1>

                <p
                  className="animate-fade-up mt-6 text-lg leading-relaxed text-muted-foreground max-w-lg"
                  style={{ animationDelay: "160ms" }}
                >
                  MileStack connects developers and digital professionals in the Global South with
                  global employers through milestone-based XLM escrow payments. Trustless,
                  Borderless, and Instant.
                </p>

                <LandingHeroCta />
              </div>

              {/* Right: animated project card */}
              <div
                className="animate-fade-up flex justify-center md:justify-end"
                style={{ animationDelay: "200ms" }}
              >
                <AnimatedProjectCard />
              </div>
            </div>
          </div>
        </section>

        {/* - Features - */}
        <section id="features" className="border-b border-border bg-background py-8 md:py-12">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="max-w-2xl mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                  Core Architecture
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Built for clarity and trust
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Smart contract infrastructure that removes friction between global talent and the
                  opportunities they deserve.
                </p>
              </div>
            </ScrollReveal>

            <StackedScrollCards
              items={FEATURES}
              gridClassName="sm:grid-cols-3"
              revealStaggerMs={80}
              renderCard={({
                icon: Icon,
                title,
                badge,
                badgeClass,
                iconBg,
                fillClass,
                filled,
                description,
              }) => (
                <div
                  className={`relative flex h-full flex-col justify-between rounded-2xl border p-7 shadow-xs transition-all duration-200 group ${
                    filled ? fillClass : `${fillClass} hover:border-slate-300 hover:shadow-md`
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div
                        className={`rounded-xl p-3 w-fit ${filled ? "bg-white/15 text-white" : iconBg}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                          filled ? "bg-white/15 text-white border-white/25" : badgeClass
                        }`}
                      >
                        {badge}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-bold mb-2 ${
                        filled
                          ? "text-white"
                          : "text-foreground group-hover:text-primary transition-colors"
                      }`}
                    >
                      {title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${filled ? "text-white/85" : "text-muted-foreground"}`}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              )}
            />
          </div>
        </section>

        {/* - How it works - */}
        <section id="how-it-works" className="border-b border-border bg-card py-16 md:py-24">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="max-w-2xl mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                  Milestone Lifecycle
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  How payments flow
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Each milestone is secured by a Soroban smart contract. Funds move only when work
                  is confirmed without intermediaries.
                </p>
              </div>
            </ScrollReveal>

            <StackedScrollCards
              items={STEPS}
              gridClassName="md:grid-cols-4"
              revealStaggerMs={100}
              renderCard={({ number, tag, tagClass, numClass, fillClass, filled, title, body }) => (
                <div
                  className={`relative flex h-full flex-col gap-3 rounded-2xl border p-6 shadow-xs transition-all duration-200 ${
                    filled ? fillClass : `${fillClass} hover:border-slate-300`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-3xl font-black tabular-nums font-poppins ${filled ? "text-white" : numClass}`}
                    >
                      {number}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold ${
                        filled ? "bg-white/15 text-white border-white/25" : tagClass
                      }`}
                    >
                      {tag}
                    </span>
                  </div>
                  <h3
                    className={`text-base font-bold mt-2 ${filled ? "text-white" : "text-foreground"}`}
                  >
                    {title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${filled ? "text-white/85" : "text-muted-foreground"}`}
                  >
                    {body}
                  </p>
                </div>
              )}
            />
          </div>
        </section>

        {/* - CTA - */}
        <section className="relative overflow-hidden bg-primary py-20 text-center text-white">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_70%)]" />
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <LandingBottomCta />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
