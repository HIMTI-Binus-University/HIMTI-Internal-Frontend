export interface RegisteredFont {
  name: string;
  file: Blob;
}

// Fonts registered during this session. Kept at module level so they survive
// moving between steps (the settings panel unmounts on every step change).
const registry = new Map<string, RegisteredFont>();

export const listCustomFonts = (): RegisteredFont[] => [...registry.values()];

/** Loads a font file into the page and remembers it for this session. */
export const registerCustomFont = async (name: string, file: Blob) => {
  const url = URL.createObjectURL(file);

  try {
    const fontFace = new FontFace(name, `url(${url})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    registry.set(name, { name, file });
  } finally {
    // The font data is already in memory once loaded.
    URL.revokeObjectURL(url);
  }
};

export const clearCustomFonts = () => registry.clear();
