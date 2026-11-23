import type { FitResult } from "../utils/fitName";

export interface FitNote {
  tone: "info" | "warning" | "error";
  text: string;
}

/** Plain-language note about how a name was fitted, or null when it needs none. */
export const describeFit = (fit: FitResult): FitNote | null => {
  switch (fit.status) {
    case "smaller":
      return { tone: "info", text: `Shrunk to ${fit.fontSize}px so the name fits.` };
    case "atMinimum":
      return {
        tone: "warning",
        text: `Fits only at the smallest allowed size (${fit.fontSize}px).`,
      };
    case "abbreviated":
      return {
        tone: "warning",
        text: `Shortened to “${fit.text}” (${fit.fontSize}px).`,
      };
    case "overflow":
      return {
        tone: "error",
        text: "This name does not fit the name box, even at the smallest size. Widen the box or turn on abbreviation under Long names.",
      };
    default:
      return null;
  }
};
