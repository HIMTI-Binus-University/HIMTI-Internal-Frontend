interface FitCanvasInput {
  availableWidth: number;
  /** Infinity when the height is not constrained (stacked layout). */
  availableHeight: number;
  /** template height / template width */
  aspectRatio: number;
  templateWidth: number;
}

/** Never let the height limit shrink the canvas below this share of the width fit. */
const MIN_SHARE_OF_WIDTH_FIT = 0.7;

/**
 * Width (px) for the canvas. It fits the available width, never exceeds the
 * template's own width, and also tries to fit the available height. When the
 * height is very tight the canvas keeps at least 70% of its width-fit size
 * and the area scrolls a little, instead of turning into a thumbnail.
 */
export const computeFitWidth = ({
  availableWidth,
  availableHeight,
  aspectRatio,
  templateWidth,
}: FitCanvasInput): number => {
  const widthFit = Math.max(1, Math.min(availableWidth, templateWidth));
  const heightFit = Math.max(1, availableHeight / aspectRatio);

  return Math.max(1, Math.min(widthFit, Math.max(heightFit, widthFit * MIN_SHARE_OF_WIDTH_FIT)));
};
