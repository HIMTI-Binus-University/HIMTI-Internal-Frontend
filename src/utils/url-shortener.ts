const createdAtFormatter = new Intl.DateTimeFormat("en-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
  timeZoneName: "short",
});

export const formatUrlCreatedAt = (value?: string | null): string => {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return createdAtFormatter.format(date);
};
