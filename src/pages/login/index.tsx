import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useGetMe } from "@/api/auth/queries";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/motion";
import { getFirstAccessibleInternalRoute } from "@/config/routes";
import { authClient } from "@/utils/auth-client";
import { needsRegistrationCompletion } from "@/utils/registration-access";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.6 0 3 .5 4.1 1.6L19 4.7A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z"
      />
    </svg>
  );
}

export const LoginPage = () => {
  const pageRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { data: meData, isLoading: isMeLoading } = useGetMe(!!session);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useGSAP(
    () => {
      const appearTargets =
        pageRef.current?.querySelectorAll<HTMLElement>("[data-page-appear]");
      if (!appearTargets?.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(appearTargets, {
          autoAlpha: 0,
          y: 12,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          clearProps: "transform,opacity,visibility",
        });
      });

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  useEffect(() => {
    if (!session || isMeLoading || !meData) return;

    if (needsRegistrationCompletion(meData)) {
      navigate("/complete-registration", { replace: true });
      return;
    }

    const firstRoute = getFirstAccessibleInternalRoute(
      meData.permissions,
      meData.roles,
    );
    navigate(firstRoute?.path ?? "/?warning=no-permissions", { replace: true });
  }, [isMeLoading, meData, navigate, session]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");

    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: `${window.location.origin}/login`,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (ctx) => {
          setErrorMessage(ctx.error.message);
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <main
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-primary-2 via-brand-primary-1 to-[#001431] text-foreground"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-y-[8%] left-[5%] hidden w-16 rounded-xl border border-white/20 bg-white/[0.04] py-6 sm:flex sm:flex-col sm:items-center sm:gap-5">
          <span className="size-7 rounded-lg bg-white/30" />
          <span className="h-px w-8 bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/45" />
          <span className="size-2.5 rounded-full bg-white/25" />
          <span className="size-2.5 rounded-full bg-white/25" />
        </div>
        <div className="absolute -right-[8%] top-[10%] h-[72%] w-[78%] rounded-2xl border border-white/25 bg-white/[0.025] p-6 sm:right-[4%] sm:w-[66%]">
          <div className="flex items-center justify-between border-b border-white/20 pb-4">
            <span className="h-2.5 w-24 rounded-full bg-white/30" />
            <span className="h-7 w-20 rounded-lg bg-white/15" />
          </div>
          <div className="mt-8 space-y-5">
            <div className="h-20 rounded-xl bg-white/15" />
            <div className="h-28 rounded-xl border border-white/15 bg-white/[0.06]" />
            <div className="h-14 rounded-xl bg-brand-secondary-1/25" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          <section data-page-appear className="min-w-0 max-w-xl text-white">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-white/75 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary-1 lg:mb-10"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to home
            </Link>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Welcome back.
              <br />
              {" "}
              Let’s get to work.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/75 sm:mt-5 sm:text-lg sm:leading-8">
              Sign in with your authorized HIMTI Google account to access the
              tools and resources available to your role.
            </p>
          </section>

          <section
            aria-labelledby="login-heading"
            data-page-appear
            className="w-full min-w-0 rounded-2xl bg-white p-6 shadow-2xl shadow-slate-950/25 sm:p-8"
          >
            <div className="mb-8 flex items-center gap-3">
              <img
                src="/icon-primary.svg"
                alt=""
                className="size-12 shrink-0 object-contain"
              />
              <div className="leading-tight">
                <p className="text-sm font-bold text-foreground">HIMTI BINUS</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Internal Tools
                </p>
              </div>
            </div>

            <h2
              id="login-heading"
              className="text-3xl font-extrabold tracking-tight text-foreground"
            >
              Sign in to your workspace
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use your authorized HIMTI Google account to continue.
            </p>

            {errorMessage && (
              <div className="mt-6 flex gap-3 rounded-xl border border-semantic-danger-border bg-semantic-danger-background px-4 py-3 text-sm text-semantic-danger">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <p>{errorMessage}</p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="mt-8 h-12 w-full gap-3 border-brand-primary-1/20 bg-white text-foreground hover:bg-brand-primary-1/5"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                "Opening Google..."
              ) : (
                <>
                  <GoogleMark />
                  Continue with Google
                </>
              )}
            </Button>

            <p className="mt-6 text-center text-sm leading-6 text-muted-foreground">
              Having trouble?{" "}
              <a
                href="https://wa.me/6285716303865"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Contact the administrator.
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
