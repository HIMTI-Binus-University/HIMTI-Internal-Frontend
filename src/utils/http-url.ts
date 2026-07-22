const explicitSchemePattern = /^[a-z][a-z\d+.-]*:/i;
const httpSchemePattern = /^https?:\/\//i;
const hostWithPortPattern = /^[^/?#\s:]+:\d+(?:[/?#]|$)/;

export const normalizeHttpUrlInput = (value: string): string => {
  const trimmedValue = value.trim();

  const hasControlCharacter = [...trimmedValue].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });

  if (!trimmedValue || hasControlCharacter) {
    throw new TypeError("Invalid HTTP URL");
  }

  if (trimmedValue.includes("\\")) throw new TypeError("Invalid HTTP URL");

  let candidate = trimmedValue;
  if (!httpSchemePattern.test(candidate)) {
    if (
      /^https?:/i.test(candidate) ||
      /^https?\/\//i.test(candidate) ||
      candidate.startsWith("//") ||
      (explicitSchemePattern.test(candidate) && !hostWithPortPattern.test(candidate))
    ) {
      throw new TypeError("Invalid HTTP URL");
    }
    candidate = `https://${candidate}`;
  }

  const url = new URL(candidate);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new TypeError("Invalid HTTP URL");
  }

  return url.toString();
};

export const getSafeHttpUrl = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      url.hostname &&
      !url.username &&
      !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};
