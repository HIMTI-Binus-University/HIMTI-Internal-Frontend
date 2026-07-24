import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { getSafeHttpUrl } from "@/utils/http-url";

export const ImagePreview = ({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) => {
  const safeSrc = getSafeHttpUrl(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [safeSrc]);

  if (!safeSrc || failed)
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-brand-primary-1 to-primary text-primary-foreground/70",
          className,
        )}
      >
        <ImageOff aria-hidden="true" className="h-6 w-6" />
        <span className="sr-only">No image available for {alt}</span>
      </div>
    );
  return (
    <img
      src={safeSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
};
