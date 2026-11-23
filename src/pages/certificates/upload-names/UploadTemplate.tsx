import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { CloudUpload, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCertificateStore } from "../store";
import ConfirmDialog from "../components/ConfirmDialog";
import InlineNotice from "../components/InlineNotice";
import { formatFileSize, validateTemplateFile } from "../utils/templateFile";

// Light checkerboard behind the preview so transparent PNGs are visible.
const checkerboardStyle = {
  backgroundImage:
    "linear-gradient(45deg, rgba(15,23,42,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(15,23,42,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(15,23,42,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(15,23,42,0.06) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
};

const UploadTemplate = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, setTemplate } = useCertificateStore();
  const template = state.template;

  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const readFile = (file: File) => {
    setError(null);

    const problem = validateTemplateFile(file);
    if (problem) {
      setError(problem);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    setIsReading(true);

    img.onload = () => {
      // Release the previous template's object URL now that it is replaced.
      if (template) URL.revokeObjectURL(template.url);

      setTemplate({ file, url, width: img.width, height: img.height });
      setIsReading(false);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setIsReading(false);
      setError("This image could not be read. Try another file.");
    };

    img.src = url;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires `change`.
    e.target.value = "";
    if (file) readFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const dragProps = {
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
  };

  const handleDelete = () => {
    if (template) URL.revokeObjectURL(template.url);
    setTemplate(null);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        aria-label="Certificate template file"
        onChange={handleInputChange}
      />

      {error && <InlineNotice tone="error">{error}</InlineNotice>}

      {!template ? (
        <button
          type="button"
          disabled={isReading}
          onClick={() => inputRef.current?.click()}
          {...dragProps}
          className={cn(
            "flex min-h-[260px] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragging
              ? "border-primary bg-semantic-info-background"
              : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          {isReading ? (
            <Loader2 aria-hidden="true" className="mb-2 size-8 animate-spin text-primary" />
          ) : (
            <CloudUpload aria-hidden="true" className="mb-2 size-8 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {isReading ? "Reading image…" : "Drop your template here, or click to browse"}
          </span>
          <span className="text-sm text-muted-foreground">
            PNG ratio and transparency will be preserved.
          </span>
        </button>
      ) : (
        <>
          <div
            {...dragProps}
            className={cn(
              "flex items-center justify-center rounded-xl border bg-card p-3 transition-colors",
              isDragging ? "border-primary" : "border-border",
            )}
            style={checkerboardStyle}
          >
            <img
              src={template.url}
              alt="Certificate template preview"
              className="max-h-[50vh] max-w-full rounded-md object-contain shadow-sm"
            />
          </div>

          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-4 text-sm">
            <dt className="text-muted-foreground">File</dt>
            <dd className="truncate text-right font-medium text-foreground" title={template.file.name}>
              {template.file.name}
            </dd>
            <dt className="text-muted-foreground">Dimensions</dt>
            <dd className="text-right font-medium text-foreground">
              {template.width} × {template.height} px
            </dd>
            <dt className="text-muted-foreground">Size</dt>
            <dd className="text-right font-medium text-foreground">
              {formatFileSize(template.file.size)}
            </dd>
          </dl>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={isReading}
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw aria-hidden="true" />
              Replace
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="delete" className="flex-1">
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              }
              title="Delete this template?"
              description="The template image is removed. Your names and style settings are kept."
              confirmLabel="Delete template"
              onConfirm={handleDelete}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UploadTemplate;
