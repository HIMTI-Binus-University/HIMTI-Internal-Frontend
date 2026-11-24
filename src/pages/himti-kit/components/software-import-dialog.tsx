import type { CreateHimtiKitSoftwareInput } from "@/types/himti-kit";
import { SOFTWARE_IMPORT_FIELDS, validateSoftwareRow, toSoftwareInput } from "../csv-import";
import { KitCsvImportDialog, type ImportColumn } from "./kit-csv-import-dialog";

const COLUMNS: ImportColumn[] = [
  { key: "name", label: "Title", placeholder: "Software name", className: "w-44" },
  { key: "description", label: "Description", placeholder: "Description", className: "w-56" },
  { key: "downloadUrl", label: "Resource Link", placeholder: "https://...", className: "w-52" },
  { key: "logoUrl", label: "Image Link", placeholder: "https://... (optional)", className: "w-52" },
];

interface SoftwareImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateHimtiKitSoftwareInput[]) => Promise<void>;
  existingNames: string[];
  isLoading?: boolean;
}

export function SoftwareImportDialog({ onSubmit, existingNames, ...props }: SoftwareImportDialogProps) {
  return (
    <KitCsvImportDialog
      {...props}
      onSubmit={(rows) => onSubmit(rows.map(toSoftwareInput))}
      title="Import Software"
      description="Upload or paste a CSV of software. Review each row, fix anything marked in red, then import."
      itemLabel="Software"
      fields={SOFTWARE_IMPORT_FIELDS}
      columns={COLUMNS}
      keyField="name"
      existingKeys={existingNames}
      validate={validateSoftwareRow}
      columnsHint="Title, Description, Resource Link, Image Link"
      pastePlaceholder={"Title,Description,Resource Link,Image Link\nSoftware Guidebook,Semua link ada di pdf,https://drive.google.com/...,https://...png"}
    />
  );
}
