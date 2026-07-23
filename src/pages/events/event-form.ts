import { normalizeHttpUrlInput } from "@/utils/http-url";

export const normalizeOptionalEventUrl = (
  value: unknown,
  label: string,
): string | null => {
  const input = String(value ?? "").trim();
  if (!input) return null;
  try {
    return normalizeHttpUrlInput(input);
  } catch {
    throw new TypeError(
      `Enter a valid ${label} link. Only HTTP and HTTPS links are allowed.`,
    );
  }
};

export const combineEventDateTime = (date: unknown, time: unknown): string => {
  const dateValue = String(date ?? "").trim();
  const timeValue = String(time ?? "").trim();
  if (!dateValue || !timeValue) {
    throw new TypeError("Enter both an event date and time.");
  }

  const value = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(value.getTime())) {
    throw new TypeError("Enter a valid event date and time.");
  }
  return value.toISOString();
};

export const splitEventDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };

  const pad = (part: number) => String(part).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
};
