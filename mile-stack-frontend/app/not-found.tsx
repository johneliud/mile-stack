import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background flex items-center justify-center py-24">
        <div className="mx-auto max-w-md px-4 text-center">
          <p className="text-8xl font-black text-accent/20 leading-none select-none mb-6">404</p>
          <h1 className="text-2xl font-bold text-foreground mb-3">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <Button variant="primary">
                <Home className="h-4 w-4" />
                Go home
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline">
                <Search className="h-4 w-4" />
                Browse projects
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
