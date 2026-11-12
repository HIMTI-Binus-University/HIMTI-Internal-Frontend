import * as XLSX from "xlsx";
import type { NameEntry } from "./types";
import { MAX_NAMES_PER_BATCH } from "./constants";

/**
 * Parse CSV file to array of names
 */
export const parseCSV = async (file: File): Promise<string[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
  }) as unknown[][];

  if (jsonData.length === 0) return [];

  const firstRow = jsonData[0] as string[];
  let dataStartIndex = 0;
  let nameColumnIndex = 0;

  if (
    firstRow.some(
      (cell) =>
        typeof cell === "string" &&
        (cell.toLowerCase() === "nama" || cell.toLowerCase() === "name"),
    )
  ) {
    dataStartIndex = 1;
    nameColumnIndex = firstRow.findIndex(
      (cell) =>
        typeof cell === "string" &&
        (cell.toLowerCase() === "nama" || cell.toLowerCase() === "name"),
    );
  }

  const names = jsonData
    .slice(dataStartIndex)
    .map((row) => {
      const cell = (row as unknown[])[nameColumnIndex];
      return typeof cell === "string" ? cell.trim() : String(cell || "").trim();
    })
    .filter((name) => name.length > 0)
    .slice(0, MAX_NAMES_PER_BATCH);

  return names;
};

/**
 * Parse XLSX file to array of names
 */
export const parseXLSX = async (file: File): Promise<string[]> => {
  return parseCSV(file);
};

/**
 * Parse manual textarea input to array of names
 */
export const parseManualInput = (input: string): string[] => {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_NAMES_PER_BATCH);
};

/**
 * Convert array of name strings to NameEntry objects
 */
export const namesToEntries = (names: string[]): NameEntry[] => {
  return names.map((name, index) => ({
    id: generateId(),
    name,
    order: index + 1,
  }));
};

/**
 * Find longest name by character count
 */
export const findLongestName = (names: NameEntry[]): NameEntry | null => {
  if (names.length === 0) return null;
  return names.reduce((longest, current) =>
    current.name.length > longest.name.length ? current : longest,
  );
};

/**
 * Abbreviate name parts
 */
export const abbreviateName = (
  name: string,
  options: { firstName: boolean; middleName: boolean; lastName: boolean },
): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return name;

  const abbreviated = parts.map((part, index) => {
    const isFirst = index === 0;
    const isLast = index === parts.length - 1;
    const isMiddle = !isFirst && !isLast;

    if ((isFirst && options.firstName) || (isMiddle && options.middleName) || (isLast && options.lastName)) {
      return part.charAt(0).toUpperCase() + ".";
    }
    return part;
  });

  return abbreviated.join(" ");
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Load custom font
 */
export const loadCustomFont = async (
  fontName: string,
  fontUrl: string,
): Promise<void> => {
  const fontFace = new FontFace(fontName, `url(${fontUrl})`);
  await fontFace.load();
  document.fonts.add(fontFace);
};

/**
 * Validate file is PNG
 */
export const isPNG = (file: File): boolean => {
  return file.type === "image/png";
};

/**
 * Validate file is font (.ttf or .otf)
 */
export const isFont = (file: File): boolean => {
  return (
    file.type === "font/ttf" ||
    file.type === "font/otf" ||
    file.name.endsWith(".ttf") ||
    file.name.endsWith(".otf")
  );
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
