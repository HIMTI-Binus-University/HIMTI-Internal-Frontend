import { FileText, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";

const TemplatePreview = () => {
  const { state, setTemplate } = useCertificateStore();
  const { template } = state;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus template ini?")) {
      setTemplate(null);
    }
  };

  const handleReplace = () => {
    // TODO: Person 1 will implement file upload logic here
    alert("Person 1: Implement file upload logic");
  };

  if (!template) {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-blue-900">
              Template sertifikat
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              PNG atau JPG/JPEG, maksimal 15 MB.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
          <p className="text-sm text-muted-foreground">
            Belum ada template. Silakan upload template PNG atau JPG/JPEG.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-blue-900">
            Template sertifikat
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            PNG atau JPG/JPEG, maksimal 15 MB.
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-center rounded-lg border border-border bg-muted/10 p-2">
        <img
          src={template.url}
          alt="Certificate Template"
          className="max-h-[calc(100vh-28rem)] max-w-full object-contain"
        />
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">File:</span>
            <span className="font-medium text-foreground">
              {template.file.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dimensi:</span>
            <span className="font-medium text-foreground">
              {template.width} x {template.height} px
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ukuran:</span>
            <span className="font-medium text-foreground">
              {formatFileSize(template.file.size)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleReplace}
          className="flex-1 text-blue-900"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Ganti
        </Button>
        <Button
          variant="ghost"
          onClick={handleDelete}
          className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
      </div>
    </div>
  );
};

export default TemplatePreview;
