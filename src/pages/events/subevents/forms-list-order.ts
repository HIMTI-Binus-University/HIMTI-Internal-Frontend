export const newestFormsFirst = <
  T extends { createdAt: string; updatedAt: string | null; id: string },
>(
  forms: T[],
) =>
  [...forms].sort(
    (a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt) ||
      b.id.localeCompare(a.id),
  );
