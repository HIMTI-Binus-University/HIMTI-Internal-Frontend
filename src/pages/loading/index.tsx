import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useParams } from "react-router-dom";
import { useGetUrlByShortCode } from "@/api/url-shortener/queries";
import HimtiLogo from "@/components/logos/HimtiLogo";
import { runtimeConfig } from "@/config/runtime";
import { Button } from "@/components/ui/button";

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

type ErrorResponseBody = {
  msg?: string;
  message?: string;
};

const getBackendErrorInfo = (error: unknown) => {
  if (!isAxiosError(error)) {
    return {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }

  const response = error.response;
  const responseData = response?.data as ErrorResponseBody | string | undefined;

  if (!response) {
    return {
      code: "NETWORK_ERROR",
      message: error.message || "The request could not reach the server.",
    };
  }

  const backendMessage =
    typeof responseData === "string"
      ? responseData
      : responseData?.msg || responseData?.message;

  return {
    code: response.status,
    message: backendMessage || error.message || "Request failed",
  };
};

const RedirectLoadingPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { data, error, isError, isFetching, refetch } = useGetUrlByShortCode(
    shortCode ?? "",
  );

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
    const errorInfo = getBackendErrorInfo(error);

    return (
      <div className="min-h-screen bg-semantic-background px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <StatusCard
            title="Link Error"
            description="The backend returned the following status for this short link."
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-semantic-border bg-semantic-muted/30 px-6 py-5">
                <p className="mb-3 text-center text-body-3 font-semibold uppercase tracking-widest text-semantic-foreground/40">
                  Error Code
                </p>
                <h1 className="break-all text-center font-mono text-5xl font-bold leading-tight text-semantic-foreground/70 max-md:text-3xl">
                  {errorInfo.code}
                </h1>
              </div>
              <p className="break-words text-body-2 text-semantic-foreground/60">
                {errorInfo.message}
              </p>
              <Button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full"
              >
                {isFetching ? "Retrying..." : "Retry"}
              </Button>
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
