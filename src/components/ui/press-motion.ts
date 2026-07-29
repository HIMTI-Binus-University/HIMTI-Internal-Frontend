import * as React from "react";

import { gsap, useGSAP } from "@/lib/motion";

const usePressMotion = <T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>,
  disabled = false,
) => {
  const elementRef = React.useRef<T>(null);
  React.useImperativeHandle(forwardedRef, () => elementRef.current as T);

  useGSAP(() => {
    const element = elementRef.current;
    if (!element) return;

    const media = gsap.matchMedia();
    media.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        allowMotion: "(prefers-reduced-motion: no-preference)",
      },
      ({ conditions }) => {
        const isDisabled = () =>
          disabled ||
          (element as unknown as HTMLButtonElement).disabled ||
          element.getAttribute("aria-disabled") === "true";
        const setScale = (scale: number) => {
          if (isDisabled()) return;
          if (conditions?.reduceMotion) gsap.set(element, { scale });
          else gsap.to(element, { scale, duration: 0.12, ease: "power2.out", overwrite: "auto" });
        };
        const press = () => setScale(0.98);
        const release = () => setScale(1);
        const keyDown = (event: KeyboardEvent) => {
          if (!event.repeat && (event.key === "Enter" || event.key === " ")) press();
        };
        const keyUp = (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") release();
        };

        element.addEventListener("pointerdown", press);
        element.addEventListener("pointerup", release);
        element.addEventListener("pointercancel", release);
        element.addEventListener("pointerleave", release);
        element.addEventListener("keydown", keyDown);
        element.addEventListener("keyup", keyUp);
        element.addEventListener("blur", release);
        return () => {
          element.removeEventListener("pointerdown", press);
          element.removeEventListener("pointerup", release);
          element.removeEventListener("pointercancel", release);
          element.removeEventListener("pointerleave", release);
          element.removeEventListener("keydown", keyDown);
          element.removeEventListener("keyup", keyUp);
          element.removeEventListener("blur", release);
        };
      },
    );
    return () => media.revert();
  }, { dependencies: [disabled], scope: elementRef, revertOnUpdate: true });

  return elementRef;
};

export { usePressMotion };
