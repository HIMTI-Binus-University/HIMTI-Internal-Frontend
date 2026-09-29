import { useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "@/utils/auth-client";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const retry = async () => {
    setPending(true);
    setFailed(false);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/login`,
        errorCallbackURL: `${window.location.origin}/auth/error`,
      });
      if (result.error) throw new Error("Sign-in failed");
    } catch {
      setPending(false);
      setFailed(true);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 text-foreground">
        <p className="font-semibold">HIMTI Internal Tools</p>
        <h1 className="text-3xl font-bold">Sign-in could not be completed</h1>
        <p>
          Please start again. Your sign-in attempt may have expired or been
          replaced by another attempt.
        </p>
        {failed && (
          <p role="alert">Could not start sign-in. Please try again.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} onClick={() => void retry()}>
            {pending ? "Signing in..." : "Try again"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
