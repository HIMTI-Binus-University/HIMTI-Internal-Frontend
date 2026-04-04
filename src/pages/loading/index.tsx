import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetUrlByShortCode } from "@/api/url-shortener/queries";

const RedirectLoadingPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { data, isError } = useGetUrlByShortCode(shortCode ?? "");

  useEffect(() => {
    if (!data?.originalUrl) return;
    const timer = setTimeout(() => {
      window.location.href = data.originalUrl;
    }, 2000);
    return () => clearTimeout(timer);
  }, [data]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-semantic-background">
        <p className="text-body-1 text-semantic-foreground/50">Link not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-semantic-background">
      <p className="text-body-1 text-semantic-foreground/50">Redirecting...</p>
    </div>
  );
};

export default RedirectLoadingPage;
