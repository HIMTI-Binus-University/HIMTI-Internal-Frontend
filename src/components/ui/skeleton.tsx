import * as React from "react";

import { gsap, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ref.current,
        { opacity: 0.45 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        },
      );
    });
    return () => media.revert();
  }, { scope: ref });

  return <div ref={ref} className={cn("rounded-lg bg-muted", className)} {...props} />;
};

export { Skeleton };
