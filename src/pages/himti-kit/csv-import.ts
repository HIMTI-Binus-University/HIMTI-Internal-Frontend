import {
  BINUS_IT_MAJORS,
  MAJOR_TO_BACKEND_ENUM,
  type CreateHimtiKitResourceInput,
  type CreateHimtiKitSoftwareInput,
} from "@/types/himti-kit";

// Shared CSV parsing and row validation for the HIMTI Kit import dialogs.

export type ImportRow = Record<string, string>;
export type RowErrors = Partial<Record<string, string>>;

export interface ImportField {
  key: string;
  /** Lower-case header names that map to this field. */
  aliases: string[];
}

/** Parses CSV text (quoted fields, "" escapes, CRLF) into trimmed cells. Blank lines are dropped. */
export const parseCsv = (text: string): string[][] => {
  const content = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(",") ? "," : ";";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const endCell = () => {
    row.push(cell.trim());
    cell = "";
  };
  const endRow = () => {
    endCell();
    if (row.some((c) => c.length > 0)) rows.push(row);
    row = [];
  };

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"' && content[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      endCell();
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && content[i + 1] === "\n") i++;
      endRow();
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) endRow();
  return rows;
};

/**
 * Maps CSV rows to objects keyed by field. A header row is required when it names
 * any known field; otherwise columns are read in field order.
 */
export const parseImportRows = (text: string, fields: ImportField[]): ImportRow[] => {
  const table = parseCsv(text);
  if (table.length === 0) return [];

  const header = table[0].map((h) => h.toLowerCase());
  const headerIndex = fields.map((f) => header.findIndex((h) => f.aliases.includes(h)));
  const hasHeader = headerIndex.some((i) => i !== -1);
  const indexes = hasHeader ? headerIndex : fields.map((_, i) => i);

  return table.slice(hasHeader ? 1 : 0).map((cells) =>
    Object.fromEntries(fields.map((f, i) => [f.key, indexes[i] === -1 ? "" : cells[indexes[i]] ?? ""]))
  );
};

export const RESOURCE_IMPORT_FIELDS: ImportField[] = [
  { key: "title", aliases: ["title", "judul"] },
  { key: "description", aliases: ["description", "deskripsi"] },
  { key: "resourceUrl", aliases: ["resource link", "download link", "downloadurl", "link"] },
  { key: "coverImageUrl", aliases: ["image link", "cover image", "coverimageurl", "image"] },
  { key: "majors", aliases: ["majors", "major", "jurusan"] },
];

export const SOFTWARE_IMPORT_FIELDS: ImportField[] = [
  { key: "name", aliases: ["title", "name", "nama"] },
  { key: "description", aliases: ["description", "deskripsi"] },
  { key: "downloadUrl", aliases: ["resource link", "download link", "downloadurl", "link"] },
  { key: "logoUrl", aliases: ["image link", "cover image", "coverimageurl", "logo", "image"] },
];

const MAJOR_LABELS = BINUS_IT_MAJORS.filter((m) => m !== "All Majors") as string[];

/** Splits a `;`-separated majors cell into known display names and unknown entries. */
export const splitMajors = (value: string): { majors: string[]; unknown: string[] } => {
  const majors: string[] = [];
  const unknown: string[] = [];
  for (const part of value.split(";").map((p) => p.trim()).filter(Boolean)) {
    const lower = part.toLowerCase();
    if (lower === "all majors") {
      majors.push(...MAJOR_LABELS);
      continue;
    }
    const match = MAJOR_LABELS.find(
      (m) => m.toLowerCase() === lower || MAJOR_TO_BACKEND_ENUM[m].toLowerCase() === lower
    );
    if (match) majors.push(match);
    else unknown.push(part);
  }
  return { majors: Array.from(new Set(majors)), unknown };
};

export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
};

export const isValidNim = (nim: string): boolean => /^\d+$/.test(nim.trim().replace(/\s+/g, ""));

export const normalizeKey = (value: string) => value.trim().toLowerCase();

/** Keys (normalized) that appear in more than one row. */
export const findDuplicateKeys = (rows: ImportRow[], field: string): Set<string> => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = normalizeKey(row[field] ?? "");
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([key]) => key));
};

interface ValidationContext {
  existingKeys: Set<string>;
  duplicateKeys: Set<string>;
}

const checkKey = (value: string, label: string, ctx: ValidationContext): string | undefined => {
  if (!value.trim()) return `${label} is required`;
  if (ctx.duplicateKeys.has(normalizeKey(value))) return `Duplicate ${label.toLowerCase()} in this import`;
  if (ctx.existingKeys.has(normalizeKey(value))) return "Already exists, will be skipped";
  return undefined;
};

const checkUrl = (value: string, required: boolean): string | undefined => {
  if (!value.trim()) return required ? "Link is required" : undefined;
  return isHttpUrl(value) ? undefined : "Must be a valid http(s) link";
};

const compact = (errors: RowErrors): RowErrors =>
  Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as RowErrors;

export const validateResourceRow = (row: ImportRow, ctx: ValidationContext): RowErrors => {
  const { majors, unknown } = splitMajors(row.majors ?? "");
  return compact({
    title: checkKey(row.title ?? "", "Title", ctx),
    resourceUrl: checkUrl(row.resourceUrl ?? "", true),
    coverImageUrl: checkUrl(row.coverImageUrl ?? "", false),
    majors:
      unknown.length > 0
        ? `Unknown major: ${unknown.join(", ")}`
        : majors.length === 0
        ? "At least one major is required"
        : undefined,
  });
};

export const validateSoftwareRow = (row: ImportRow, ctx: ValidationContext): RowErrors =>
  compact({
    name: checkKey(row.name ?? "", "Title", ctx),
    description: (row.description ?? "").trim() ? undefined : "Description is required",
    downloadUrl: checkUrl(row.downloadUrl ?? "", true),
    logoUrl: checkUrl(row.logoUrl ?? "", false),
  });

export const toResourceInput = (row: ImportRow): CreateHimtiKitResourceInput => ({
  title: row.title.trim(),
  description: row.description.trim() || null,
  resourceUrl: row.resourceUrl.trim(),
  coverImageUrl: row.coverImageUrl.trim() || null,
  majors: splitMajors(row.majors).majors,
});

export const toSoftwareInput = (row: ImportRow): CreateHimtiKitSoftwareInput => ({
  name: row.name.trim(),
  description: row.description.trim(),
  downloadUrl: row.downloadUrl.trim(),
  logoUrl: row.logoUrl.trim() || null,
});
