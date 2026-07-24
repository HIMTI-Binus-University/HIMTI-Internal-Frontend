import { useState, useEffect, useMemo } from "react";
import { FaGoogle } from "react-icons/fa";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetMe } from "@/api/auth/queries";
import HimtiLogov2 from "@/components/logos/HimtiLogov2";
import { Button } from "@/components/ui/button";
import { getFirstAccessibleInternalRoute } from "@/config/routes";
import { authClient } from "@/utils/auth-client";
import { needsRegistrationCompletion } from "@/utils/registration-access";

const TypingHelloAnimation = () => {
  const greetings = useMemo(
    () => [
      "Hello",
      "你好",
      "Hola",
      "नमस्ते",
      "Ciao",
      "أهلاً",
      "Olá",
      "こんにちは",
    ],
    [],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentGreeting = greetings[currentIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentGreeting.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentGreeting.slice(0, displayText.length + 1));
        }, 150);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentIndex, greetings]);

  return (
    <h2 className="flex items-center text-left text-2xl font-light text-muted-foreground">
      {displayText}
      <span className="animate-pulse">|</span>,
    </h2>
  );
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { data: meData, isLoading: isMeLoading } = useGetMe(!!session);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!session || isMeLoading || !meData) return;

    if (needsRegistrationCompletion(meData)) {
      navigate("/complete-registration", { replace: true });
      return;
    }

    const firstRoute = getFirstAccessibleInternalRoute(meData.permissions);
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
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-brand-primary-1 text-foreground">
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-primary-2 via-brand-primary-1 to-[#001431]">
        <div className="absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full bg-white/10 blur-[100px] animate-smoothGradient1" />
        <div className="absolute bottom-[-160px] left-[-120px] h-[460px] w-[460px] rounded-full bg-brand-secondary-1/30 blur-[90px] animate-smoothGradient2Reverse" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px]">
          <section className="motion-enter hidden max-w-xl text-white lg:block">
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to overview
            </Link>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              Welcome back to the internal workspace.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Sign in with your authorized Google account to access HIMTI tools
              for links, events, roles, and permissions.
            </p>
          </section>

          <div className="motion-enter motion-delay-1 w-full rounded-[1.75rem] border border-white/20 bg-white p-6 shadow-2xl shadow-slate-950/25 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <HimtiLogov2 width={42} height={50} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">HIMTI</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    Internal Tools
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="lg:hidden">
                <Link to="/">Back</Link>
              </Button>
            </div>

            <TypingHelloAnimation />

            <h2 className="mt-1 text-left text-4xl font-extrabold tracking-tight text-foreground">
              Welcome
            </h2>

            <p className="mt-3 text-left text-sm leading-6 text-muted-foreground">
              Use your HIMTI Google account to continue to the dashboard.
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
              className="mt-8 w-full"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                "Opening Google..."
              ) : (
                <>
                  <FaGoogle aria-hidden="true" size={18} />
                  Sign in with Google
                </>
              )}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-1 text-center text-sm text-muted-foreground">
              <span>Can't sign in?</span>
              <a
                href="https://wa.me/6285716303865"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
