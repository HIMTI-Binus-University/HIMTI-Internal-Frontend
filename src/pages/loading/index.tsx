import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetUrlByShortCode } from "@/api/url-shortener/queries";
import { HimtiLogo } from "@/components/icons";
import { runtimeConfig } from "@/config/runtime";

type StatusCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const StatusCard = ({ title, description, children }: StatusCardProps) => {
  return (
    <div className="w-full max-w-xl rounded-[32px] border border-semantic-border/70 bg-white px-8 py-10 shadow-xl shadow-black/5 max-md:px-6 max-md:py-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-4 rounded-2xl bg-brand-primary-1 px-6 py-4 text-white shadow-lg shadow-brand-primary-1/15 max-md:flex-col max-md:gap-3">
          <HimtiLogo width={58} height={68} className="shrink-0" />
          <div className="flex flex-col items-start text-left leading-none max-md:items-center max-md:text-center">
            <span className="text-ds-h2 font-bold text-white">HIMTI</span>
            <span className="text-ds-h3 font-light text-white/80">
              Internal Tools
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-h4 font-bold text-semantic-foreground max-md:text-h5">
            {title}
          </h1>
          <p className="mx-auto max-w-md text-body-1 text-semantic-foreground/60">
            {description}
          </p>
        </div>

        <div className="mt-8 w-full">{children}</div>
      </div>
    </div>
  );
};

const RedirectLoadingPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { data, isError } = useGetUrlByShortCode(shortCode ?? "");

  useEffect(() => {
    if (!shortCode) {
      window.location.replace(runtimeConfig.ofogUrl);
      return;
    }

    if (!data?.originalUrl) return;

    const timer = setTimeout(() => {
      window.location.href = data.originalUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, shortCode]);

  if (!shortCode) {
    return (
      <div className="min-h-screen bg-semantic-background px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <StatusCard
            title="Redirecting..."
            description="Sending you to the HIMTI OFOG page."
          >
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-primary-1/15 border-t-brand-primary-1 animate-spin">
                  <div className="h-7 w-7 rounded-full bg-brand-primary-1/10" />
                </div>
              </div>

              <p className="text-body-2 text-semantic-foreground/45">
                No short code was provided, so we are taking you to the default
                destination.
              </p>
            </div>
          </StatusCard>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-semantic-background px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <StatusCard
            title="Link not found"
            description="The short link may be missing, expired, or mistyped."
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-semantic-border bg-semantic-muted/30 px-6 py-5">
                <h1 className="text-center font-mono text-6xl leading-5 text-semantic-foreground/30 max-md:text-xs p-10">
                  {`@('_')@`}
                </h1>
              </div>
              <p className="text-body-2 text-semantic-foreground/45">
                We could not figure out where this one was supposed to go.
              </p>
            </div>
          </StatusCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-semantic-background px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <StatusCard
          title="Redirecting..."
          description="Taking you to your destination in just a moment."
        >
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-primary-1/15 border-t-brand-primary-1 animate-spin">
                <div className="h-7 w-7 rounded-full bg-brand-primary-1/10" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-body-2 text-semantic-foreground/45">
                Preparing the redirect and checking the target link.
              </p>
            </div>
          </div>
        </StatusCard>
      </div>
    </div>
  );
};

export default RedirectLoadingPage;
