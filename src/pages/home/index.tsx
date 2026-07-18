import { AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import HimtiLogo from "@/components/logos/HimtiLogo";
import { Button } from "@/components/ui/button";

function HomePage() {
  const [searchParams] = useSearchParams();
  const showNoPermissionsWarning = searchParams.get("warning") === "no-permissions";

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/15 to-transparent" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="motion-enter flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-1 text-white shadow-lg shadow-brand-primary-1/15">
              <HimtiLogo width={30} height={36} />
            </div>
            <div>
              <p className="text-sm font-bold leading-5">HIMTI</p>
              <p className="text-xs font-medium text-muted-foreground">
                Internal Tools
              </p>
            </div>
          </div>

          <Button asChild variant="secondary" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </header>

        {showNoPermissionsWarning && (
          <div className="motion-enter mt-8 flex gap-3 rounded-xl border border-semantic-warning-border bg-semantic-warning-background px-4 py-3 text-sm text-semantic-warning">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your account is signed in, but it does not have permission to
              access any internal tools. Contact an administrator if this seems
              wrong.
            </p>
          </div>
        )}

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="motion-enter motion-delay-1 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold text-primary">
              <Sparkles aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
              Built for HIMTI operations
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              One workspace for internal tools, links, events, and access.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Manage day-to-day operational workflows with a focused dashboard
              designed for KOMTIG HIMTI members.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/login">
                  Continue to dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="motion-enter motion-delay-2 rounded-[2rem] border border-border bg-card p-5 shadow-xl shadow-brand-primary-1/5">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-brand-primary-1 to-brand-primary-2 p-6 text-white">
              <ShieldCheck aria-hidden="true" className="h-10 w-10 stroke-[1.5]" />
              <h2 className="mt-8 text-2xl font-bold tracking-tight">
                Secure internal access
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Google sign-in, permission-aware navigation, and purpose-built
                tools keep the workspace clear for each member role.
              </p>
              <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  "URL shortener",
                  "Event operations",
                  "Role management",
                  "Permission control",
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-white/10 px-3 py-2">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
