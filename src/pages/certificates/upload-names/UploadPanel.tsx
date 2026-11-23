import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { CloudUpload, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCertificateStore } from "../store";
import ConfirmDialog from "../components/ConfirmDialog";
import InlineNotice from "../components/InlineNotice";
import { MAX_NAMES_PER_BATCH, MAX_NAME_LENGTH } from "../constants";
import { analyzeNames, type NameAnalysis } from "../utils/analyzeNames";
import { generateId } from "../utils";

type Mode = "view" | "edit";

const NAME_HEADERS = new Set(["name", "nama"]);

/**
 * Reads the first sheet of a CSV/XLSX file as one name per line. A column
 * headed "Name"/"Nama" is used if there is one, otherwise the first column.
 */
const readNamesFromFile = async (file: File): Promise<string[]> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];

  const headerRow = rows[0] ?? [];
  const headerIndex = headerRow.findIndex(
    (cell) => typeof cell === "string" && NAME_HEADERS.has(cell.trim().toLowerCase()),
  );
  const column = headerIndex === -1 ? 0 : headerIndex;
  const startRow = headerIndex === -1 ? 0 : 1;

  return rows.slice(startRow).map((row) => String(row[column] ?? ""));
};

const Stat = ({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) => (
  <div className="rounded-xl border border-border bg-background px-3 py-3">
    <p
      className={cn(
        "text-2xl font-semibold tabular-nums",
        highlight ? "text-primary" : "text-foreground",
      )}
    >
      {value}
    </p>
    <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
  </div>
);

const NameRows = ({ names }: { names: string[] }) => (
  <ol className="divide-y divide-border">
    {names.map((name, index) => (
      <li key={`${index}-${name}`} className="flex gap-3 px-4 py-2.5 text-sm">
        <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">
          {index + 1}.
        </span>
        <span className="min-w-0 break-words text-foreground">{name}</span>
      </li>
    ))}
  </ol>
);

const UploadPanel = ({
  onEditStateChange,
}: {
  onEditStateChange?: (isEditing: boolean) => void;
}) => {
  const { state, setNames } = useCertificateStore();
  const names = state.names;

  const [mode, setMode] = useState<Mode>("view");
  // What was skipped while cleaning the list. Null when the list was restored
  // or edited later, because those counts no longer describe it.
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [source, setSource] = useState("Pasted text");
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasNames = names.length > 0;
  const isEditing = mode === "edit";

  useEffect(() => {
    onEditStateChange?.(isEditing);
  }, [isEditing, onEditStateChange]);

  // If the list is cleared from elsewhere ("Start over"), leave edit mode and
  // forget the old cleaning counts.
  useEffect(() => {
    if (names.length === 0) {
      setMode("view");
      setAnalysis(null);
    }
  }, [names.length]);

  const applyLines = (lines: string[], sourceLabel: string) => {
    const result = analyzeNames(lines);

    if (result.names.length === 0) {
      setError(
        lines.some((line) => line.trim() !== "")
          ? `No usable names. Each name must be ${MAX_NAME_LENGTH} characters or fewer.`
          : "Add at least one name.",
      );
      return false;
    }

    setError(null);
    setNames(
      result.names.map((name, index) => ({
        id: generateId(),
        name,
        order: index + 1,
      })),
    );
    setAnalysis(result);
    setSource(sourceLabel);
    setMode("view");
    return true;
  };

  const readFile = async (file: File) => {
    setError(null);
    setIsReading(true);

    try {
      const lines = await readNamesFromFile(file);
      applyLines(lines, file.name);
    } catch {
      setError("This file could not be read. Use a .csv or .xlsx file.");
    } finally {
      setIsReading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void readFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void readFile(file);
  };

  const clearAll = () => {
    setNames([]);
    setAnalysis(null);
    setError(null);
    setMode("view");
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv,.xlsx"
      className="hidden"
      aria-label="Name list file"
      onChange={handleFileChange}
    />
  );

  // ----- Edit -----
  if (hasNames && isEditing) {
    return (
      <div className="flex flex-col gap-3">
        <label htmlFor="edit-names" className="text-sm font-medium text-foreground">
          Edit names
        </label>
        <Textarea
          id="edit-names"
          ref={textareaRef}
          defaultValue={names.map((entry) => entry.name).join("\n")}
          className="min-h-[240px] resize-y"
        />
        <p className="text-xs text-muted-foreground">
          One line equals one name. Maximum {MAX_NAME_LENGTH} characters per name.
        </p>
        {error && <InlineNotice tone="error">{error}</InlineNotice>}
        <div className="flex gap-2">
          <Button
            onClick={() =>
              applyLines((textareaRef.current?.value ?? "").split("\n"), "Edited list")
            }
          >
            Save list
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setMode("view");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ----- Review -----
  if (hasNames) {
    const longest = names.reduce(
      (current, entry) => (entry.name.length > current.length ? entry.name : current),
      "",
    );
    const list = names.map((entry) => entry.name);

    return (
      <div className="flex flex-col gap-4">
        {fileInput}

        {error && <InlineNotice tone="error">{error}</InlineNotice>}

        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-foreground">Data source</span>
          <span className="min-w-0 truncate text-muted-foreground" title={source}>
            {analysis ? source : "Restored list"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat value={list.length} label="Valid names" highlight />
          {analysis && (
            <>
              <Stat value={analysis.emptyRows} label="Empty rows skipped" />
              <Stat value={analysis.duplicates} label="Duplicates removed" />
              <Stat value={analysis.tooLong} label={`Over ${MAX_NAME_LENGTH} characters`} />
            </>
          )}
        </div>

        {analysis && analysis.overLimit > 0 && (
          <InlineNotice tone="warning">
            Only the first {MAX_NAMES_PER_BATCH} names are used.{" "}
            {analysis.overLimit} more {analysis.overLimit === 1 ? "name was" : "names were"} left out.
          </InlineNotice>
        )}

        <section aria-labelledby="names-heading">
          <h3 id="names-heading" className="mb-2 text-sm font-medium text-foreground">
            Names ({list.length})
          </h3>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
            <NameRows names={list} />
          </div>
        </section>

        <div className="rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Longest name</p>
          <p className="mt-1 break-words text-sm text-foreground">{longest}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
            <Pencil aria-hidden="true" />
            Edit list
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isReading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isReading ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Upload aria-hidden="true" />}
            Change data
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="delete" size="sm" className="ml-auto">
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            }
            title="Delete the name list?"
            description={`All ${list.length} names are removed. You can paste or upload a new list afterwards.`}
            confirmLabel="Delete list"
            onConfirm={clearAll}
          />
        </div>
      </div>
    );
  }

  // ----- Input -----
  return (
    <div className="flex flex-col gap-5">
      {fileInput}

      {error && <InlineNotice tone="error">{error}</InlineNotice>}

      <button
        type="button"
        disabled={isReading}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full items-start gap-4 rounded-xl border border-dashed p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging
            ? "border-primary bg-semantic-info-background"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/60",
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {isReading ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
          ) : (
            <CloudUpload aria-hidden="true" className="size-5 text-primary" />
          )}
        </span>
        <span>
          <span className="block font-medium text-foreground">
            {isReading ? "Reading file…" : "Upload an XLSX or CSV file"}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Uses the “Name” column, or the first column. Drag a file here or click to browse.
          </span>
        </span>
      </button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">Or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="paste-names" className="text-sm font-medium text-foreground">
          Write a list of names
        </label>
        <Textarea
          id="paste-names"
          ref={textareaRef}
          className="min-h-[160px] resize-y"
          placeholder={`John Doe\nJad Abyanza Fauzan`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            One name per line, maximum {MAX_NAME_LENGTH} characters each.
          </p>
          <Button
            onClick={() =>
              applyLines((textareaRef.current?.value ?? "").split("\n"), "Pasted text")
            }
          >
            Use this list
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
