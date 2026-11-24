import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendMessage } from "@/components/notification";
import {
  findDuplicateKeys,
  normalizeKey,
  parseImportRows,
  type ImportField,
  type ImportRow,
  type RowErrors,
} from "../csv-import";

export interface ImportColumn {
  key: string;
  label: string;
  placeholder: string;
  className?: string;
}

interface KitCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rows: ImportRow[]) => Promise<void>;
  isLoading?: boolean;
  title: string;
  description: string;
  /** Plural noun used in buttons, e.g. "Materials". */
  itemLabel: string;
  fields: ImportField[];
  columns: ImportColumn[];
  /** Field that identifies a row (title / name), used for duplicate checks. */
  keyField: string;
  existingKeys: string[];
  validate: (row: ImportRow, ctx: { existingKeys: Set<string>; duplicateKeys: Set<string> }) => RowErrors;
  columnsHint: string;
  pastePlaceholder: string;
}

export function KitCsvImportDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title,
  description,
  itemLabel,
  fields,
  columns,
  keyField,
  existingKeys,
  validate,
  columnsHint,
  pastePlaceholder,
}: KitCsvImportDialogProps) {
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetState = () => {
    setCsvText("");
    setRows([]);
    setParseError(null);
    setFileName(null);
    setSubmitError(null);
  };

  const parseContent = (content: string) => {
    const parsed = parseImportRows(content, fields);
    setRows(parsed);
    setParseError(
      content.trim() && parsed.length === 0 ? `Could not detect any rows. Expected columns: ${columnsHint}` : null
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseContent(text);
    };
    reader.readAsText(file);
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeleteRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleAddRow = () =>
    setRows((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, ""]))]);

  const existingKeySet = useMemo(() => new Set(existingKeys.map(normalizeKey)), [existingKeys]);
  const duplicateKeys = useMemo(() => findDuplicateKeys(rows, keyField), [rows, keyField]);

  const rowErrors = useMemo(
    () => rows.map((row) => validate(row, { existingKeys: existingKeySet, duplicateKeys })),
    [rows, validate, existingKeySet, duplicateKeys]
  );

  const validRows = rows.filter((_, i) => Object.keys(rowErrors[i]).length === 0);
  const existingCount = rows.filter((row) => existingKeySet.has(normalizeKey(row[keyField] ?? ""))).length;
  const invalidCount = rows.length - validRows.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (validRows.length === 0) {
      setParseError("No valid rows to import. Fix or remove the rows marked in red.");
      return;
    }
    try {
      await onSubmit(validRows);
      resetState();
      onOpenChange(false);
    } catch (err) {
      console.error(`[HIMTI-KIT:Import] Failed to import ${itemLabel}:`, err);
      setSubmitError(backendMessage(err, `Failed to import ${itemLabel.toLowerCase()}. Please check backend connection.`));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent
        className={`flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden transition-all duration-200 ${
          rows.length > 0 ? "sm:max-w-[960px]" : "sm:max-w-[560px]"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="-mx-1 mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-1">
            {rows.length === 0 ? (
              <>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center transition-colors hover:border-primary/50">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-1.5 text-xs font-semibold text-foreground">
                    {fileName ? fileName : "Upload CSV file from Google Sheets"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports columns: <code>{columnsHint}</code>
                  </p>
                  <label className="mt-2.5 inline-flex cursor-pointer items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileUpload}
                      className="sr-only"
                      aria-label="CSV file"
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="kit-csv-raw" className="text-xs">
                    Or Paste CSV Data Directly:
                  </Label>
                  <textarea
                    id="kit-csv-raw"
                    rows={4}
                    className="w-full font-mono rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={pastePlaceholder}
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value);
                      parseContent(e.target.value);
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-semantic-success" />
                      Review & Modify {itemLabel}
                    </span>
                    <Badge variant="secondary" className="text-[11px]">
                      {validRows.length} of {rows.length} valid
                    </Badge>
                    {existingCount > 0 && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px]"
                      >
                        {existingCount} already exist
                      </Badge>
                    )}
                    {duplicateKeys.size > 0 && (
                      <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{duplicateKeys.size} duplicate in CSV</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetState}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Re-import</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRow}
                      className="h-7 px-2 text-[11px] gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Row</span>
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Edit cells to fix the rows marked in red, or remove them. Rows that still have errors are skipped on import.
                </p>

                <div className="overflow-x-auto rounded-lg border border-border bg-card p-1.5 text-xs">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-border text-[11px] text-muted-foreground">
                        <th className="w-8 pb-1.5 pl-2">#</th>
                        <th className="w-16 pb-1.5 px-1 text-center">Status</th>
                        {columns.map((col) => (
                          <th key={col.key} className={`pb-1.5 px-2 ${col.className ?? ""}`}>
                            {col.label}
                          </th>
                        ))}
                        <th className="w-10 pb-1.5 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {rows.map((row, idx) => {
                        const errors = rowErrors[idx];
                        const messages = Object.values(errors);
                        return (
                          <tr key={idx} className="group align-top hover:bg-muted/30 transition-colors">
                            <td className="py-1.5 pl-2 text-[11px] text-muted-foreground font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-1 text-center">
                              {messages.length === 0 ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[9px] px-1.5 py-0 h-4 font-medium whitespace-nowrap"
                                >
                                  New
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-destructive/40 text-destructive bg-destructive/10 text-[9px] px-1.5 py-0 h-4 font-medium whitespace-nowrap"
                                  title={messages.join("\n")}
                                >
                                  Skip
                                </Badge>
                              )}
                            </td>
                            {columns.map((col) => {
                              const error = errors[col.key];
                              return (
                                <td key={col.key} className="py-1.5 px-2">
                                  <Input
                                    value={row[col.key] ?? ""}
                                    onChange={(e) => handleRowChange(idx, col.key, e.target.value)}
                                    placeholder={col.placeholder}
                                    aria-label={`Row ${idx + 1} ${col.label}`}
                                    aria-invalid={Boolean(error)}
                                    title={error ?? row[col.key]}
                                    className={`h-7 text-xs ${
                                      error ? "border-destructive bg-destructive/5 text-destructive" : ""
                                    }`}
                                  />
                                  {error && (
                                    <p className="mt-0.5 text-[10px] leading-tight text-destructive">{error}</p>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-1.5 text-right pr-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRow(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {parseError && (
              <div className="flex items-center gap-2 rounded-lg border border-semantic-danger-border bg-semantic-danger-background p-2.5 text-xs text-semantic-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-semantic-danger-border bg-semantic-danger-background p-3 text-xs text-semantic-danger">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 shrink-0 border-t border-border pt-4">
            {invalidCount > 0 && (
              <span className="mr-auto self-center text-[11px] text-muted-foreground">
                {invalidCount} {invalidCount === 1 ? "row" : "rows"} will be skipped
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetState();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || validRows.length === 0}>
              {isLoading ? "Processing..." : `Import ${validRows.length} ${itemLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
