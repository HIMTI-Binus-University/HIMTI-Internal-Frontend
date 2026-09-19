import { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  UserPlus,
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

  // Row Modification Handlers
  const handleRowChange = (index: number, field: "name" | "nim", value: string) => {
    setParsedRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeleteRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    setParsedRows((prev) => [...prev, { name: "", nim: "" }]);
  };

  const handleClearParsed = () => {
    setParsedRows([]);
    setCsvText("");
    setFileName(null);
    setParseError(null);
  };

  // Validation metrics
  const duplicateNims = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of parsedRows) {
      const trimmed = r.nim.trim();
      if (!trimmed) continue;
      counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
    }
    const dupes = new Set<string>();
    for (const [nim, count] of counts.entries()) {
      if (count > 1) dupes.add(nim);
    }
    return dupes;
  }, [parsedRows]);

  const validRowsCount = useMemo(() => {
    return parsedRows.filter((r) => r.name.trim().length > 0 && r.nim.trim().length > 0).length;
  }, [parsedRows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "manual") {
      if (!name.trim() || !nim.trim()) return;
      const single = [{ name: name.trim(), nim: nim.trim().replace(/\s+/g, "") }];
      console.log(
        "%c[HIMTI-KIT:Attendees] Submitting manual attendee:",
        "font-weight: bold; color: #0284c7;",
        single
      );
      await onSubmit(single);
      resetState();
      onOpenChange(false);
    } else {
      const cleaned = parsedRows
        .map((r) => ({
          name: r.name.trim(),
          nim: r.nim.trim().replace(/\s+/g, ""),
        }))
        .filter((r) => r.name.length > 0 && r.nim.length > 0);

      if (cleaned.length === 0) {
        setParseError("No valid rows to import. Please make sure at least one row has Name and NIM.");
        return;
      }

      console.log(
        `%c[HIMTI-KIT:Attendees] Submitting ${cleaned.length} modified attendee rows to Backend:`,
        "font-weight: bold; color: #0284c7;",
        cleaned
      );
      await onSubmit(cleaned);
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
      <DialogContent
        className={`transition-all duration-200 ${
          mode === "csv" && parsedRows.length > 0 ? "sm:max-w-[680px]" : "sm:max-w-[560px]"
        }`}
      >
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
              /* ================= CSV BULK IMPORT & MODIFICATION ================= */
              <div className="space-y-4">
                {parsedRows.length === 0 ? (
                  <>
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
                  </>
                ) : (
                  /* ================= EDITABLE IMPORTED ROWS TABLE ================= */
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-semantic-success" />
                          Review & Modify Attendees
                        </span>
                        <Badge variant="secondary" className="text-[11px]">
                          {validRowsCount} of {parsedRows.length} valid
                        </Badge>
                        {duplicateNims.size > 0 && (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px] gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{duplicateNims.size} duplicate NIM</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearParsed}
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
                      You can edit names, NIMs, remove incorrect rows, or add new students before submitting to the database.
                    </p>

                    {/* Editable Table */}
                    <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-card p-1.5 text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border text-[11px] text-muted-foreground">
                            <th className="w-8 pb-1.5 pl-2">#</th>
                            <th className="w-36 pb-1.5 px-2">NIM</th>
                            <th className="pb-1.5 px-2">Student Full Name</th>
                            <th className="w-10 pb-1.5 text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {parsedRows.map((row, idx) => {
                            const isDuplicate = duplicateNims.has(row.nim.trim());
                            const isNimEmpty = !row.nim.trim();
                            const isNameEmpty = !row.name.trim();

                            return (
                              <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                                <td className="py-1.5 pl-2 text-[11px] text-muted-foreground font-mono">
                                  {idx + 1}
                                </td>
                                <td className="py-1.5 px-2">
                                  <Input
                                    value={row.nim}
                                    onChange={(e) => handleRowChange(idx, "nim", e.target.value)}
                                    placeholder="NIM"
                                    className={`h-7 text-xs font-mono font-medium ${
                                      isDuplicate
                                        ? "border-amber-500/60 bg-amber-500/5 text-amber-600 focus-visible:ring-amber-400"
                                        : isNimEmpty
                                        ? "border-destructive bg-destructive/5 text-destructive"
                                        : ""
                                    }`}
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <Input
                                    value={row.name}
                                    onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                                    placeholder="Student Name"
                                    className={`h-7 text-xs ${
                                      isNameEmpty
                                        ? "border-destructive bg-destructive/5 text-destructive"
                                        : ""
                                    }`}
                                  />
                                </td>
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

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddRow}
                        className="h-7 px-2 text-xs text-primary hover:text-primary/80 gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add another student</span>
                      </Button>

                      <span className="text-[11px] text-muted-foreground">
                        {validRowsCount} ready to import
                      </span>
                    </div>
                  </div>
                )}

                {/* Parse Error Notification */}
                {parseError && (
                  <div className="flex items-center gap-2 rounded-lg border border-semantic-danger-border bg-semantic-danger-background p-2.5 text-xs text-semantic-danger">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}
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
                (mode === "manual"
                  ? !name.trim() || !nim.trim()
                  : validRowsCount === 0)
              }
            >
              {isLoading
                ? "Processing..."
                : mode === "manual"
                ? "Add Attendee"
                : `Import ${validRowsCount} Attendees`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
