import { describe, expect, it } from "vitest";
import materialsCsv from "./__fixtures__/learning_materials.csv?raw";
import softwareCsv from "./__fixtures__/software.csv?raw";
import attendeesCsv from "./__fixtures__/techno_participants.sample.csv?raw";
import {
  RESOURCE_IMPORT_FIELDS,
  SOFTWARE_IMPORT_FIELDS,
  findDuplicateKeys,
  isValidNim,
  parseCsv,
  parseImportRows,
  splitMajors,
  validateResourceRow,
  validateSoftwareRow,
} from "./csv-import";

const noContext = { existingKeys: new Set<string>(), duplicateKeys: new Set<string>() };

describe("parseCsv", () => {
  it("handles quoted cells, escaped quotes, CRLF and blank lines", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });

  it("detects tab-separated text pasted from a spreadsheet", () => {
    expect(parseCsv("Title\tDescription\nA\tB")).toEqual([
      ["Title", "Description"],
      ["A", "B"],
    ]);
  });
});

describe("learning_materials.csv", () => {
  const rows = parseImportRows(materialsCsv, RESOURCE_IMPORT_FIELDS);

  it("parses all 23 materials with every column mapped", () => {
    expect(rows).toHaveLength(23);
    expect(rows[0]).toMatchObject({
      title: "Calculus",
      description: "Rangkuman matakuliah Calculus",
      resourceUrl: expect.stringMatching(/^https:\/\/drive\.google\.com\//),
      coverImageUrl: expect.stringMatching(/CALCULUS\.png$/),
    });
  });

  it("maps every majors cell to known majors", () => {
    expect(splitMajors(rows[0].majors).majors).toHaveLength(10);
    expect(splitMajors(rows.find((r) => r.title === "Game Design")!.majors).majors).toEqual([
      "Game Application and Technology",
    ]);
    for (const row of rows) {
      expect(splitMajors(row.majors).unknown).toEqual([]);
    }
  });

  it("has no validation errors on a fresh database", () => {
    const duplicateKeys = findDuplicateKeys(rows, "title");
    expect(duplicateKeys.size).toBe(0);
    for (const row of rows) {
      expect(validateResourceRow(row, { ...noContext, duplicateKeys })).toEqual({});
    }
  });

  it("flags existing titles, unknown majors, bad links and missing fields", () => {
    const ctx = { existingKeys: new Set(["calculus"]), duplicateKeys: new Set<string>() };
    expect(validateResourceRow(rows[0], ctx).title).toMatch(/Already exists/);
    expect(
      validateResourceRow(
        { title: "", description: "", resourceUrl: "drive.google.com/x", coverImageUrl: "nope", majors: "Physics; Data Science" },
        noContext
      )
    ).toEqual({
      title: "Title is required",
      resourceUrl: "Must be a valid http(s) link",
      coverImageUrl: "Must be a valid http(s) link",
      majors: "Unknown major: Physics",
    });
    expect(validateResourceRow({ ...rows[1], majors: "" }, noContext).majors).toMatch(/At least one/);
  });

  it("flags titles repeated in the same file", () => {
    const doubled = [...rows, { ...rows[0], title: " calculus " }];
    const duplicateKeys = findDuplicateKeys(doubled, "title");
    expect(validateResourceRow(doubled[0], { ...noContext, duplicateKeys }).title).toMatch(/Duplicate/);
  });
});

describe("software.csv", () => {
  const rows = parseImportRows(softwareCsv, SOFTWARE_IMPORT_FIELDS);

  it("maps Title to name and validates cleanly", () => {
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Software Guidebook");
    expect(rows[0].logoUrl).toMatch(/SOFTWARE%20LIST\.png$/);
    expect(validateSoftwareRow(rows[0], noContext)).toEqual({});
  });

  it("requires a description", () => {
    expect(validateSoftwareRow({ ...rows[0], description: " " }, noContext)).toEqual({
      description: "Description is required",
    });
  });
});

describe("techno_participants.csv shape", () => {
  it("parses 327 Name/NIM rows with valid NIMs", () => {
    const rows = parseImportRows(attendeesCsv, [
      { key: "name", aliases: ["name"] },
      { key: "nim", aliases: ["nim"] },
    ]);
    expect(rows).toHaveLength(327);
    expect(rows.every((r) => r.name && isValidNim(r.nim))).toBe(true);
    expect(findDuplicateKeys(rows, "nim").size).toBe(0);
  });

  it("rejects NIMs with letters", () => {
    expect(isValidNim("26021111a1")).toBe(false);
    expect(isValidNim("2602 111111")).toBe(true);
  });
});
