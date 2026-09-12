import { useState } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, UserPlus } from "lucide-react";
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
import type { CreateHimtiKitAttendeeInput } from "@/types/himti-kit";

interface AttendeeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (attendees: CreateHimtiKitAttendeeInput[]) => Promise<void>;
  isLoading?: boolean;
}

type Mode = "manual" | "csv";

export function AttendeeImportDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AttendeeImportDialogProps) {
  const [mode, setMode] = useState<Mode>("manual");

  // Manual Form State
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<CreateHimtiKitAttendeeInput[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetState = () => {
    setName("");
    setNim("");
    setCsvText("");
    setParsedRows([]);
    setParseError(null);
    setFileName(null);
  };

  const parseCsvContent = (content: string) => {
    setParseError(null);
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const results: CreateHimtiKitAttendeeInput[] = [];

    // Check if first line is a header
    let startIndex = 0;
    let nameIndex = 0;
    let nimIndex = 1;

    // Detect delimiter
    const delimiter = lines[0].includes("\t")
      ? "\t"
      : lines[0].includes(";")
      ? ";"
      : ",";

    const headerParts = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
    if (headerParts.some((h) => h.includes("nim") || h.includes("name") || h.includes("nama"))) {
      startIndex = 1;
      const foundNimIndex = headerParts.findIndex((h) => h.includes("nim") || h.includes("id"));
      const foundNameIndex = headerParts.findIndex(
        (h) => h.includes("name") || h.includes("nama")
      );

      if (foundNimIndex !== -1) nimIndex = foundNimIndex;
      if (foundNameIndex !== -1) nameIndex = foundNameIndex;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map((p) => p.replace(/^["']|["']$/g, "").trim());
      if (parts.length >= 2) {
        const rowName = parts[nameIndex] || parts[0];
        const rowNim = parts[nimIndex] || parts[1];
        if (rowNim) {
          results.push({
            name: rowName || `Student ${rowNim}`,
            nim: rowNim.replace(/\s+/g, ""),
          });
        }
      } else if (parts.length === 1 && parts[0]) {
        // Only NIM provided
        results.push({
          name: `Student (${parts[0]})`,
          nim: parts[0].replace(/\s+/g, ""),
        });
      }
    }

    if (results.length === 0) {
      setParseError("Could not detect valid Name and NIM from the provided CSV.");
    }

    setParsedRows(results);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    parseCsvContent(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "manual") {
      if (!name.trim() || !nim.trim()) return;
      await onSubmit([{ name: name.trim(), nim: nim.trim().replace(/\s+/g, "") }]);
      resetState();
      onOpenChange(false);
    } else {
      if (parsedRows.length === 0) {
        setParseError("No valid rows to import.");
        return;
      }
      await onSubmit(parsedRows);
      resetState();
      onOpenChange(false);
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
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Eligible TECHNO Attendees</DialogTitle>
            <DialogDescription>
              Authorize students by adding their student identifier (NIM) for HIMTI-KIT authentication access.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Selector Tabs */}
          <div className="mt-4 flex rounded-lg border border-border bg-muted/40 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 transition-colors ${
                mode === "manual"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Manual Entry</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("csv")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 transition-colors ${
                mode === "csv"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>CSV / Bulk Import</span>
            </button>
          </div>

          <div className="py-4">
            {mode === "manual" ? (
              /* ================= MANUAL ENTRY FORM ================= */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="attendee-name">
                    Student Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="attendee-name"
                    placeholder="e.g. Alya Putri"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="attendee-nim">
                    NIM (Student Identifier) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="attendee-nim"
                    placeholder="e.g. 2602111111"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This NIM will be validated when the student signs into the public HIMTI-KIT portal.
                  </p>
                </div>
              </div>
            ) : (
              /* ================= CSV BULK IMPORT ================= */
              <div className="space-y-4">
                {/* File Upload / Drag zone */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center transition-colors hover:border-primary/50">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-1.5 text-xs font-semibold text-foreground">
                    {fileName ? fileName : "Upload CSV file from Google Sheets"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports columns: <code>Name, NIM</code> or <code>NIM, Name</code>
                  </p>
                  <label className="mt-2.5 inline-flex cursor-pointer items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Paste Area Alternative */}
                <div className="space-y-1.5">
                  <Label htmlFor="csv-raw" className="text-xs">
                    Or Paste CSV Data Directly:
                  </Label>
                  <textarea
                    id="csv-raw"
                    rows={4}
                    className="w-full font-mono rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Name, NIM&#10;Alya Putri, 2602111111&#10;Bima Pratama, 2602111112"
                    value={csvText}
                    onChange={(e) => handleCsvTextChange(e.target.value)}
                  />
                </div>

                {/* Status / Parse Preview */}
                {parseError ? (
                  <div className="flex items-center gap-2 rounded-lg border border-semantic-danger-border bg-semantic-danger-background p-2.5 text-xs text-semantic-danger">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                ) : parsedRows.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-semantic-success" />
                        Preview Parsed Attendees
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {parsedRows.length} students detected
                      </Badge>
                    </div>

                    <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-card p-2 text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border text-[11px] text-muted-foreground">
                            <th className="pb-1">NIM</th>
                            <th className="pb-1">Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {parsedRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="py-1">
                              <td className="py-1 font-mono font-medium text-primary">
                                {row.nim}
                              </td>
                              <td className="py-1 text-foreground">{row.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedRows.length > 10 && (
                        <p className="pt-2 text-center text-[10px] text-muted-foreground">
                          ...and {parsedRows.length - 10} more rows
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <DialogFooter>
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
            <Button
              type="submit"
              disabled={
                isLoading ||
                (mode === "manual" ? !name.trim() || !nim.trim() : parsedRows.length === 0)
              }
            >
              {isLoading ? (
                "Processing..."
              ) : mode === "manual" ? (
                "Add Attendee"
              ) : (
                `Import ${parsedRows.length} Attendees`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
