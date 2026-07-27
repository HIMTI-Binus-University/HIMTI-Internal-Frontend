import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Link2,
  Mail,
  UsersRound,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/motion";
import { authClient } from "@/utils/auth-client";

const tools = [
  {
    name: "URL Shortener",
    description: "Create and manage official HIMTI links.",
    icon: Link2,
  },
  {
    name: "Email Blaster",
    description: "Prepare and send organized email campaigns.",
    icon: Mail,
  },
  {
    name: "Event Operations",
    description: "Manage registrations and event workflows.",
    icon: CalendarDays,
  },
  {
    name: "Member & Role Access",
    description: "Control access to internal tools.",
    icon: UsersRound,
  },
];
function HomePage() {
  const pageRef = useRef<HTMLElement>(null);
  const [searchParams] = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const showNoPermissionsWarning = searchParams.get("warning") === "no-permissions";

  useGSAP(
    () => {
      const appearTargets =
        pageRef.current?.querySelectorAll<HTMLElement>("[data-page-appear]");
      const toolCards =
        pageRef.current?.querySelectorAll<HTMLElement>("[data-tool-card]");

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (appearTargets?.length) {
          gsap.from(appearTargets, {
            autoAlpha: 0,
            y: 10,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform,opacity,visibility",
          });
        }

        if (toolCards?.length) {
          gsap.to(toolCards, {
            y: -2,
            duration: 2.8,
            ease: "sine.inOut",
            stagger: 0.3,
            repeat: -1,
            yoyo: true,
          });
        }
      });

      return () => mm.revert();
    },
    { scope: pageRef },
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-background text-foreground"
    >
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/15 to-transparent" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header data-page-appear className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-3"
          >
            <img
              src="/icon-primary.svg"
              alt=""
              className="size-8 shrink-0 object-contain sm:size-10"
            />
            <span className="min-w-0 leading-tight">
              <span className="block whitespace-nowrap text-xs font-bold tracking-tight text-foreground sm:text-sm">
                HIMTI BINUS
              </span>
              <span className="block text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                Internal Tools
              </span>
            </span>
          </Link>

          {isPending ? (
            <Button variant="secondary" size="sm" disabled>
              Checking session...
            </Button>
          ) : session ? (
            <Button
              type="button"
              variant="delete"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Logging out..." : "Log out"}
            </Button>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </header>

        {showNoPermissionsWarning && (
          <div
            data-page-appear
            className="mt-8 flex gap-3 rounded-xl border border-semantic-warning-border bg-semantic-warning-background px-4 py-3 text-sm text-semantic-warning"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your account is signed in, but it does not have permission to
              access any internal tools. Contact an administrator if this seems
              wrong.
            </p>
          </div>
        )}

        <div className="grid min-w-0 flex-1 items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:py-16">
          <div data-page-appear className="min-w-0 max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-5xl">
              Everything HIMTI
              <br />
              {" "}
              needs to keep moving.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Access internal tools, manage operational work, and find the
              resources your team needs. All from one workspace.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/login">
                  Open workspace
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <aside
            aria-label="Available internal tools preview"
            data-page-appear
            className="min-w-0 rounded-2xl bg-brand-primary-1 p-4 text-white shadow-xl shadow-brand-primary-1/15 sm:p-5"
          >
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">HIMTI Internal Tools</p>
              </div>
              <div
                aria-hidden="true"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-2"
              >
                <span className="size-1.5 rounded-full bg-white/35" />
                <span className="size-1.5 rounded-full bg-white/55" />
                <span className="size-1.5 rounded-full bg-white/75" />
              </div>
            </div>

            <div className="flex min-w-0 gap-4 pt-4">
              <div
                aria-hidden="true"
                className="hidden w-10 shrink-0 flex-col items-center gap-3 rounded-xl bg-white/[0.06] py-3 sm:flex"
              >
                <span className="size-5 rounded-md bg-white/20" />
                <span className="h-px w-5 bg-white/15" />
                <span className="size-2 rounded-full bg-white/45" />
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-white/20" />
              </div>

              <ul className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                {tools.map(({ name, description, icon: Icon }) => (
                  <li
                    key={name}
                    data-tool-card
                    className="min-w-0 rounded-xl border border-white/10 bg-white/10 p-4 will-change-transform"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-5 stroke-[1.75] text-white/85"
                    />
                    <h2 className="mt-4 text-sm font-bold leading-5">{name}</h2>
                    <p className="mt-1.5 text-xs leading-5 text-white/70">
                      {description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
