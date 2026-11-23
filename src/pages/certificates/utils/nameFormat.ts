/**
 * Abbreviate name parts ("Ada Beatrice Wong" -> "Ada B. Wong" when only the
 * middle name is selected). A single word is the whole name, so it is never
 * abbreviated.
 */
export const abbreviateName = (
  name: string,
  options: { firstName: boolean; middleName: boolean; lastName: boolean },
): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;

  const abbreviated = parts.map((part, index) => {
    const isFirst = index === 0;
    const isLast = index === parts.length - 1;
    const isMiddle = !isFirst && !isLast;

    if (
      (isFirst && options.firstName) ||
      (isMiddle && options.middleName) ||
      (isLast && options.lastName)
    ) {
      return part.charAt(0).toUpperCase() + ".";
    }
    return part;
  });

  return abbreviated.join(" ");
};
