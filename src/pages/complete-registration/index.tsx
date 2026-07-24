import { useState } from "react";
import { ArrowRight, LogOut, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import HimtiLogo from "@/components/logos/HimtiLogo";
import { Button } from "@/components/ui/button";
import { runtimeConfig } from "@/config/runtime";
import { authClient } from "@/utils/auth-client";

export default function CompleteRegistrationPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      window.location.assign("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/15 to-transparent" />
      <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-secondary-1/15 blur-3xl" />

      <section className="relative w-full max-w-xl rounded-[2rem] border border-border bg-card p-6 text-center shadow-2xl shadow-brand-primary-1/10 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-1 text-white">
          <HimtiLogo width={34} height={40} />
        </div>
        <div className="mx-auto mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-semantic-warning-background text-semantic-warning">
          <ShieldAlert aria-hidden="true" className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Complete your HIMTI registration
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          Before accessing Internal Tools, complete your membership registration
          on the HIMTI Registration website. BINUS members must also verify
          their Outlook email.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={runtimeConfig.registrationAppUrl}>
              Go to HIMTI Registration
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut aria-hidden="true" />
            {isSigningOut ? "Logging out..." : "Use another account"}
          </Button>
        </div>

        <Button asChild variant="ghost" className="mt-4">
          <Link to="/">Back to overview</Link>
        </Button>
      </section>
    </main>
  );
}
