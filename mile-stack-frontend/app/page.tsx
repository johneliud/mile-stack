import Link from "next/link";
import { ShieldCheck, Globe, Clock, ArrowRight, Circle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ScrollReveal";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Trustless escrow",
    description:
      "Neither party needs to trust the other. The Soroban contract enforces the agreed payment rules hence no intermediary required.",
  },
  {
    icon: Globe,
    title: "Borderless payments",
    description:
      "Transact globally without needing the same banking infrastructure. Any Stellar wallet, anywhere in the world.",
  },
  {
    icon: Clock,
    title: "Near-instant settlement",
    description:
      "Traditional international transfers take 2–7 days. Stellar settles in seconds for a fraction of the cost.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Client creates a project",
    body: "Define milestones, set XLM amounts, and assign a freelancer by their Stellar wallet address.",
  },
  {
    number: "02",
    title: "Funds enter escrow",
    body: "XLM is deposited into the Soroban smart contract, locked and verifiable on-chain until the milestone is approved.",
  },
  {
    number: "03",
    title: "Work is delivered",
    body: "The freelancer completes the milestone. The client reviews and approves directly from their dashboard.",
  },
  {
    number: "04",
    title: "Instant XLM release",
    body: "The smart contract transfers payment directly to the freelancer's wallet in seconds.",
  },
];

const MOCK_MILESTONES = [
  { label: "UI Design", amount: "500 XLM", status: "released" as const },
  { label: "Frontend Dev", amount: "1,000 XLM", status: "funded" as const },
  { label: "Backend Integration", amount: "1,500 XLM", status: "pending" as const },
];

const STATUS_STYLES = {
  released: { dot: "bg-success", text: "text-success", label: "Released" },
  funded: { dot: "bg-accent", text: "text-accent", label: "Funded" },
  pending: { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "Pending" },
};

function ProjectMockCard() {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Card header */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Active project
        </p>
        <h3 className="text-base font-bold text-foreground">Website Redesign</h3>
        <p className="text-xs text-muted-foreground mt-0.5">3,000 XLM total · Stellar testnet</p>
      </div>

      {/* Milestones */}
      <ul className="space-y-3">
        {MOCK_MILESTONES.map(({ label, amount, status }) => {
          const s = STATUS_STYLES[status];
          return (
            <li
              key={label}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <Circle className={`h-2 w-2 fill-current ${s.dot} ${s.text}`} aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">{amount}</p>
                <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">Powered by Soroban</span>
        <span className="text-xs font-semibold text-success">1,500 XLM released</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:py-28">
              {/* Left: copy */}
              <div className="flex flex-col">
                <p className="animate-fade-up text-sm font-semibold uppercase tracking-widest text-accent mb-4">
                  Powered by Stellar &amp; Soroban
                </p>
                <h1
                  className="animate-fade-up text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-[4rem] lg:leading-tight"
                  style={{ animationDelay: "80ms" }}
                >
                  Unlocking Global Opportunities for Talent in the{" "}
                  <span className="text-primary">Global South</span>
                </h1>
                <p
                  className="animate-fade-up mt-6 text-lg leading-relaxed text-muted-foreground max-w-lg"
                  style={{ animationDelay: "160ms" }}
                >
                  MileStack connects developers and digital professionals in the Global South with
                  global employers through milestone-based XLM escrow payments. Trustless,
                  Borderless, and Instant.
                </p>
                <div
                  className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
                  style={{ animationDelay: "240ms" }}
                >
                  <Link href="/projects/new">
                    <Button variant="primary" size="lg">
                      Post a project
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/#how-it-works">
                    <Button variant="outline" size="lg">
                      See how it works
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: mock project card */}
              <div
                className="animate-fade-up flex justify-center md:justify-end"
                style={{ animationDelay: "200ms" }}
              >
                <ProjectMockCard />
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="border-b border-border bg-background">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <ScrollReveal>
              <div className="max-w-2xl mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Built for clarity
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Blockchain infrastructure that removes friction between global talent and the
                  opportunities they deserve.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }, idx) => (
                <ScrollReveal key={title} delay={idx * 80}>
                  <div className="h-full rounded-xl border border-border bg-card p-6">
                    <Icon className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
                    <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="border-b border-border bg-card">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <ScrollReveal>
              <div className="max-w-2xl mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  How it works
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Each milestone is secured by a Soroban smart contract. Funds move only when work
                  is confirmed without intermediaries.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-0 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
              {STEPS.map(({ number, title, body }, idx) => (
                <ScrollReveal key={number} delay={idx * 100}>
                  <div className="flex flex-col gap-4 py-10 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
                    <span className="text-4xl font-black tabular-nums text-primary/20 md:text-5xl">
                      {number}
                    </span>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-primary">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <ScrollReveal>
              <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
                Connect your Freighter wallet and create your first milestone-based project on
                Stellar testnet.
              </p>
              <Link href="/projects/new">
                <Button variant="accent" size="lg">
                  Create your first project
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
