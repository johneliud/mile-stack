import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service - MileStack",
};

const LAST_UPDATED = "June 8, 2026";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Legal
            </p>
            <h1 className="text-3xl font-bold text-primary">Terms of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="flex flex-col gap-8 text-sm text-foreground leading-relaxed">
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using MileStack (&quot;the platform&quot;, &quot;we&quot;,
                &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not
                agree, do not use the platform.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">2. Testnet Environment</h2>
              <p className="text-muted-foreground">
                MileStack currently operates exclusively on the{" "}
                <span className="font-medium text-foreground">Stellar testnet</span>. All XLM used
                on the platform is testnet XLM with no real monetary value. Do not send mainnet
                assets to any contract or address associated with MileStack. We are not liable for
                any loss of real assets.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">3. Eligibility</h2>
              <p className="text-muted-foreground">
                You must be at least 18 years of age to use the platform. By using MileStack, you
                represent that you meet this requirement and have the legal capacity to enter into
                agreements in your jurisdiction.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">4. User Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  You are solely responsible for maintaining the security of your Stellar wallet and
                  secret key. MileStack never requests, receives, or stores your secret key.
                </li>
                <li>
                  You are responsible for all transactions signed from your wallet address. On-chain
                  transactions are irreversible.
                </li>
                <li>
                  You agree not to use the platform for any unlawful purpose, including fraud, money
                  laundering, or market manipulation.
                </li>
                <li>
                  You agree to provide accurate information in your profile, listings, and
                  applications.
                </li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">5. Smart Contract Escrow</h2>
              <p className="text-muted-foreground">
                Milestone payments are governed by an auditable Soroban smart contract deployed on
                Stellar testnet. The contract enforces the following lifecycle:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  Funds are locked in the contract when a client calls{" "}
                  <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">
                    fund_milestone
                  </code>
                  .
                </li>
                <li>
                  The freelancer signals completion via{" "}
                  <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">
                    mark_complete
                  </code>
                  .
                </li>
                <li>
                  The client releases payment via{" "}
                  <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">
                    approve_milestone
                  </code>
                  .
                </li>
                <li>
                  Either party may raise a dispute via{" "}
                  <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">
                    dispute_milestone
                  </code>
                  , locking funds until a designated resolver calls{" "}
                  <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">
                    resolve_dispute
                  </code>
                  .
                </li>
              </ul>
              <p className="text-muted-foreground">
                Contract logic is final. MileStack cannot override, reverse, or alter on-chain
                transactions once submitted.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">6. On-Chain Reputation</h2>
              <p className="text-muted-foreground">
                Each approved milestone increments the freelancer&apos;s on-chain reputation score
                stored in the Soroban contract. This score is public, permanent, and cannot be
                modified or deleted. It reflects approved milestone completions only and should not
                be construed as an endorsement, certification, or guarantee of future performance.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">7. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                Disputes between clients and freelancers are resolved by the platform&apos;s
                designated resolver account via the{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">
                  resolve_dispute
                </code>{" "}
                contract function. The resolver&apos;s decision is final and executed on-chain.
                MileStack makes no guarantee of the outcome of any dispute.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">8. Intellectual Property</h2>
              <p className="text-muted-foreground">
                You retain ownership of all work product you deliver through the platform. By
                posting a listing or profile, you grant MileStack a limited, non-exclusive licence
                to display that content to other users for the purpose of facilitating connections.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">
                9. Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground">
                The platform is provided &quot;as is&quot; and &quot;as available&quot; without
                warranties of any kind, express or implied. We do not warrant that the platform will
                be uninterrupted, error-free, or free of security vulnerabilities. Use of the
                platform is at your own risk.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">
                10. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                To the fullest extent permitted by applicable law, MileStack and its contributors
                shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages arising out of or related to your use of the platform, including
                but not limited to loss of funds, loss of data, or loss of business opportunity.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">11. Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. The &quot;Last updated&quot;
                date reflects the most recent revision. Continued use of the platform after changes
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms shall be governed by and construed in accordance with applicable law.
                Any disputes arising under these terms shall be resolved through good-faith
                negotiation where possible.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-foreground">13. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these terms, open an issue on our{" "}
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
            <Link href="/privacy" className="text-sm text-accent hover:underline">
              Read our Privacy Policy
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
