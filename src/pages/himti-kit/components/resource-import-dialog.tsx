import type { CreateHimtiKitResourceInput } from "@/types/himti-kit";
import { RESOURCE_IMPORT_FIELDS, validateResourceRow, toResourceInput } from "../csv-import";
import { KitCsvImportDialog, type ImportColumn } from "./kit-csv-import-dialog";

const COLUMNS: ImportColumn[] = [
  { key: "title", label: "Title", placeholder: "Title", className: "w-44" },
  { key: "description", label: "Description", placeholder: "Description", className: "w-44" },
  { key: "resourceUrl", label: "Resource Link", placeholder: "https://...", className: "w-44" },
  { key: "coverImageUrl", label: "Image Link", placeholder: "https://... (optional)", className: "w-40" },
  { key: "majors", label: "Majors (; separated)", placeholder: "Computer Science; Data Science", className: "w-52" },
];

interface ResourceImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateHimtiKitResourceInput[]) => Promise<void>;
  existingTitles: string[];
  isLoading?: boolean;
}

export function ResourceImportDialog({ onSubmit, existingTitles, ...props }: ResourceImportDialogProps) {
  return (
    <KitCsvImportDialog
      {...props}
      onSubmit={(rows) => onSubmit(rows.map(toResourceInput))}
      title="Import Learning Materials"
      description="Upload or paste a CSV of materials. Review each row, fix anything marked in red, then import."
      itemLabel="Materials"
      fields={RESOURCE_IMPORT_FIELDS}
      columns={COLUMNS}
      keyField="title"
      existingKeys={existingTitles}
      validate={validateResourceRow}
      columnsHint="Title, Description, Resource Link, Image Link, Majors"
      pastePlaceholder={"Title,Description,Resource Link,Image Link,Majors\nCalculus,Rangkuman Calculus,https://drive.google.com/...,https://...png,Computer Science; Data Science"}
    />
  );
}
