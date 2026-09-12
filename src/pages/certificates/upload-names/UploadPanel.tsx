import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, Pencil, Trash2, Upload, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";
import { useCertificateStore } from "../store";
import { generateId } from "../utils";

const UploadPanel = () => {
  const { state, setNames } = useCertificateStore();
  const [panelState, setPanelState] = useState<"input" | "review" | "edit">("input");

  const [showNames, setShowNames] = useState(false);

  type NamesInfo = {
    sumber_data: string;
    baris_kosong: number;
    nama_dup: number;
    nama_panjang: number;
    nama_terpanjang: string;
    lima_pertama: string[];
    semua_nama: string[];
    jmlh_nama_valid: number;
  };

  const [namesInfo, setNamesInfo] = useState<NamesInfo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state from store when component mounts or state.names changes
  useEffect(() => {
    if (state.names.length > 0 && !namesInfo) {
      // Reconstruct namesInfo from store
      const semua_nama = state.names.map(entry => entry.name);
      const nama_terpanjang = semua_nama.reduce((a, b) => a.length > b.length ? a : b, "");
      
      setNamesInfo({
        sumber_data: "Restored from store",
        baris_kosong: 0,
        nama_dup: 0,
        nama_panjang: 0,
        nama_terpanjang,
        lima_pertama: semua_nama.slice(0, 5),
        semua_nama,
        jmlh_nama_valid: semua_nama.length,
      });
      setPanelState("review");
    } else if (state.names.length === 0 && namesInfo) {
      setNamesInfo(null);
      setPanelState("input");
    }
  }, [state.names]);

  const HandleInputFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data, { type: "array" });

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      defval: "",
    }) as string[][];

    const names = rows
      .map((row) => String(row[0]).trim())
      .filter((name) => name !== "");

    const text = names.join("\n");

    HandleInputText(text, file.name);
  };

  const HandleInputText = (name_list: string | undefined, sumber_data: string = "Text") => {
    if (!name_list) {
      return;
    }

    const raw_lines = name_list.split("\n");

    let baris_kosong = 0;
    let nama_panjang = 0;
    let nama_terpanjang = "";

    const seen = new Set<string>();

    let nama_dup = 0;
    const semua_nama: string[] = [];
    let jmlh_nama_valid = 0;

    for (const cur_line of raw_lines) {
      const nama = cur_line.trim();

      if (nama === "") {
        baris_kosong++;
        continue;
      }

      if (nama.length > 150) {
        nama_panjang++;
        continue;
      }

      if (nama.length > nama_terpanjang.length) {
        nama_terpanjang = nama;
      }

      const key = nama.toLowerCase();

      if (seen.has(key)) {
        nama_dup++;
        continue;
      }

      seen.add(key);
      jmlh_nama_valid++;
      semua_nama.push(cur_line);
    }

    setNamesInfo({
      sumber_data,
      baris_kosong,
      nama_dup,
      nama_panjang,
      nama_terpanjang,
      lima_pertama: semua_nama.slice(0, 5),
      semua_nama,
      jmlh_nama_valid,
    });

    // Save to store
    const nameEntries = semua_nama.map((name, index) => ({
      id: generateId(),
      name: name.trim(),
      order: index + 1,
    }));
    setNames(nameEntries);

    setPanelState("review");
  };

  const textareaClass =
    "w-full min-h-[180px] resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

  switch (panelState) {
    case "input":
      return (
        <div className="w-full">
          <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Add participant list
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload file or enter list of names manually
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={HandleInputFile}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="group w-full rounded-xl border border-dashed border-border bg-muted/30 p-5 text-left transition hover:border-primary/50 hover:bg-muted/60"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CloudUpload className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="font-medium text-foreground">
                    Upload XLSX or CSV File
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    The first column that contains data will be used
                  </p>
                </div>
              </div>
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                Or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Write lists of names
              </label>

              <textarea
                ref={textareaRef}
                className={`${textareaClass} mt-3`}
                placeholder={`John Doe
Jad Abyanza Fauzan`}
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Maximum of 150 characters per name
                </p>

                <Button
                  onClick={() =>
                    HandleInputText(textareaRef.current?.value)
                  }
                  className="rounded-lg"
                >
                  Use this list
                </Button>
              </div>
            </div>
          </div>
        </div>
      );

    case "review":
      return (
        <div className="w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={HandleInputFile}
          />

          <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Check list name
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Make sure the participant data is correct
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Data Source
                  </p>

                  <p className="mt-1 font-medium text-foreground">
                    {namesInfo?.sumber_data}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {namesInfo?.jmlh_nama_valid}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Valid name
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-2xl font-semibold text-foreground">
                  {namesInfo?.baris_kosong}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Empty row skipped
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-2xl font-semibold text-foreground">
                  {namesInfo?.nama_dup}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Duplicate names
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-2xl font-semibold text-foreground">
                  {namesInfo?.nama_panjang}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Overly long names
                </p>
              </div>
            </div>

            {/* First five names */}
            <div className="mt-6">
              <p className="text-sm font-medium text-foreground">
                First five names
              </p>

              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                {namesInfo?.lima_pertama.map((nama, i) => (
                  <div
                    key={i}
                    className="border-b border-border px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="mr-3 text-muted-foreground">
                      {i + 1}.
                    </span>

                    <span className="text-foreground">{nama}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Longest name */}
            <div className="mt-4 rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                Longest name
              </p>

              <p className="mt-1 break-words text-sm text-foreground">
                {namesInfo?.nama_terpanjang}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setShowNames(true)}
              >
                <Eye className="mr-2 h-4 w-4"/>
                View full list
              </Button>

              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setPanelState("edit")}
              >
                <Pencil className="mr-2 h-4 w-4"/>
                Edit list
              </Button>

              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4"/>
                Change data
              </Button>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="ghost"
                className="rounded-lg px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setNames([]);
                  setNamesInfo(null);
                  setPanelState("input");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <Dialog open={showNames} onOpenChange={setShowNames}>
            <DialogContent className="max-h-[80vh] overflow-hidden rounded-2xl">
              <DialogHeader>
                <DialogTitle>Seluruh daftar peserta</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">
                {namesInfo?.jmlh_nama_valid} valid names.
              </p>

              <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-border">
                {namesInfo?.semua_nama.map((nama, i) => (
                  <div
                    key={i}
                    className="border-b border-border px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="mr-3 text-muted-foreground">
                      {i + 1}.
                    </span>

                    <span className="text-foreground">{nama}</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );

    case "edit":
      return (
        <div className="w-full">
          <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Edit list names
              </h2>
            </div>

            <textarea
              ref={textareaRef}
              defaultValue={namesInfo?.semua_nama.join("\n")}
              className={textareaClass}
            />

            <p className="mt-2 text-xs text-muted-foreground">
              One line equals one name. Maximum 150 characters per name.
            </p>

            <div className="mt-5 flex gap-2">
              <Button
                onClick={() =>
                  HandleInputText(textareaRef.current?.value)
                }
                className="rounded-lg"
              >
                Save list
              </Button>

              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => setPanelState("review")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      );
  }
};

export default UploadPanel;