import { MAX_NAMES_PER_BATCH, MAX_NAME_LENGTH } from "../constants";

export interface NameAnalysis {
  /** Trimmed, unique, valid names in their original order (capped at the batch limit). */
  names: string[];
  emptyRows: number;
  duplicates: number;
  tooLong: number;
  /** Valid names dropped because the batch limit was reached. */
  overLimit: number;
  longest: string;
}

/**
 * Cleans a raw list of lines (pasted text or a spreadsheet column) into the
 * names that will be used, and counts what was skipped and why.
 */
export const analyzeNames = (
  lines: string[],
  maxNames: number = MAX_NAMES_PER_BATCH,
  maxLength: number = MAX_NAME_LENGTH,
): NameAnalysis => {
  const seen = new Set<string>();
  const names: string[] = [];

  let emptyRows = 0;
  let duplicates = 0;
  let tooLong = 0;
  let overLimit = 0;
  let longest = "";

  for (const line of lines) {
    const name = line.trim();

    if (name === "") {
      emptyRows += 1;
      continue;
    }

    if (name.length > maxLength) {
      tooLong += 1;
      continue;
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);

    if (names.length >= maxNames) {
      overLimit += 1;
      continue;
    }

    names.push(name);
    if (name.length > longest.length) longest = name;
  }

  return { names, emptyRows, duplicates, tooLong, overLimit, longest };
};
