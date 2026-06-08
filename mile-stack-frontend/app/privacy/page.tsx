import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy - MileStack",
};

const LAST_UPDATED = "June 8, 2026";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Legal
            </p>
            <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="prose-custom flex flex-col gap-8 text-sm text-foreground leading-relaxed">
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">1. Overview</h2>
              <p className="text-muted-foreground">
                MileStack (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a decentralised
                talent marketplace built on Stellar and Soroban. This policy explains what
                information we collect, how we use it, and your rights in relation to it. MileStack
                currently operates on the Stellar testnet and does not process real monetary value.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">2. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect only what is necessary to operate the platform:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Stellar wallet address</span> - your
                  public key, obtained when you connect your Freighter wallet. This is a public
                  identifier on the Stellar network and carries no expectation of privacy.
                </li>
                <li>
                  <span className="font-medium text-foreground">Profile information</span> - display
                  name, bio, skills, GitHub URL, and portfolio URL that you voluntarily provide when
                  setting up your freelancer profile.
                </li>
                <li>
                  <span className="font-medium text-foreground">Listing and application data</span>{" "}
                  - project listings you post and applications you submit, stored in our Supabase
                  database.
                </li>
                <li>
                  <span className="font-medium text-foreground">On-chain activity</span> - project
                  creation, milestone funding, completions, and approvals are recorded permanently
                  on the Stellar blockchain and are publicly visible.
                </li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>To display your profile to other users on the platform.</li>
                <li>To match freelancers with project opportunities.</li>
                <li>To facilitate on-chain project creation and milestone payments.</li>
                <li>To show your on-chain reputation score derived from approved milestones.</li>
              </ul>
              <p className="text-muted-foreground">
                We do not sell, rent, or share your information with third parties for marketing
                purposes.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">4. Third-Party Services</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Supabase</span> - off-chain
                  marketplace data (listings, applications, profiles) is stored in a Supabase
                  PostgreSQL database. Supabase processes data in accordance with its own{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    privacy policy
                  </a>
                  .
                </li>
                <li>
                  <span className="font-medium text-foreground">Stellar network</span> - on-chain
                  transactions are broadcast to the Stellar testnet and are permanently public. We
                  have no ability to delete or modify blockchain records.
                </li>
                <li>
                  <span className="font-medium text-foreground">Freighter</span> - wallet connection
                  is handled entirely by the Freighter browser extension. We never receive or store
                  your secret key.
                </li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">5. Local Storage</h2>
              <p className="text-muted-foreground">
                We use your browser&apos;s{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">localStorage</code>{" "}
                to persist your selected role (&quot;client&quot; or &quot;freelancer&quot;) between
                sessions. No cookies are set by MileStack. You can clear this at any time through
                your browser settings.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">6. Data Retention</h2>
              <p className="text-muted-foreground">
                Off-chain data (profiles, listings, applications) is retained for as long as the
                platform is operational. You may request deletion of your profile data by contacting
                us. On-chain data cannot be deleted due to the immutable nature of the blockchain.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">7. Security</h2>
              <p className="text-muted-foreground">
                Access to off-chain data is controlled via Supabase Row Level Security (RLS)
                policies. We use the anon key for public reads and writes scoped to valid
                operations. No authentication tokens or secret keys are ever transmitted to our
                servers.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this policy as the platform evolves. The &quot;Last updated&quot; date
                at the top of this page reflects the most recent revision. Continued use of the
                platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">9. Contact</h2>
              <p className="text-muted-foreground">
                For privacy-related questions, open an issue on our{" "}
                <a
                  href="https://github.com/johneliud/mile-stack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  GitHub repository
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Link href="/terms" className="text-sm text-accent hover:underline">
              Read our Terms of Service
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
