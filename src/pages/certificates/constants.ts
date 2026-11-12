export const MAX_NAMES_PER_BATCH = 400;

export const DEFAULT_FONTS = [
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
  { label: "System Sans Serif", value: "sans-serif" },
] as const;

export const ZOOM_CONFIG = {
  MIN: 50,
  MAX: 200,
  STEP: 10,
  DEFAULT: 100,
} as const;

export const FONT_WEIGHTS = [
  { label: "Normal", value: "normal" },
  { label: "Bold", value: "bold" },
  { label: "100 - Thin", value: "100" },
  { label: "200 - Extra Light", value: "200" },
  { label: "300 - Light", value: "300" },
  { label: "400 - Regular", value: "400" },
  { label: "500 - Medium", value: "500" },
  { label: "600 - Semi Bold", value: "600" },
  { label: "700 - Bold", value: "700" },
  { label: "800 - Extra Bold", value: "800" },
  { label: "900 - Black", value: "900" },
] as const;

export const TEXT_ALIGNMENTS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
] as const;
