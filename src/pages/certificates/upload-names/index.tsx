import { ArrowRight, FileText, FileImage } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";

// import TemplatePreview from "./TemplatePreview";
import UploadTemplate from "./UploadTemplate";
import UploadPanel from "./UploadPanel";

const UploadNames = () => {
  const { state, setStep } = useCertificateStore();

  const canProceed = state.template !== null && state.names.length > 0;

  const handleNext = () => {
    if (canProceed) {
      setStep(2);
    }
  };

  return (
    <Container>
      <ContainerHeader>Upload Template & Input Nama</ContainerHeader>
      <div className="flex min-h-[calc(100vh-12rem)] gap-6 p-6">
        <div className="w-1/2">
          <div className="mb-4 flex items-start gap-3 border border-border rounded-lg p-4 flex flex-col justify-center">

            <div className="flex w-full items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <FileImage className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-blue-900">Template sertifikat</h3>
                <p className="mt-1 text-sm text-gray-500">PNG atau JPG/JPEG, maksimal 15 MB.</p>
              </div>
            </div>

            <UploadTemplate />
          </div>

        </div>

        <div className="w-1/2">
           <div className="mb-4 flex flex-col items-center rounded-lg border border-border p-4">  

            <div className="flex w-full items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col ml-5">
                <h3 className="text-base font-semibold text-blue-900">Daftar Nama</h3>
                <p className="mt-1 text-sm text-gray-500">Gunakan XLSX, CSV, atau tempel satu nama per baris.</p>
              </div>
            </div>

            <UploadPanel />
          </div>
        </div>

      </div>

      <div className="flex justify-end border-t border-border px-6 py-4">
        <Button onClick={handleNext} disabled={!canProceed}>
          Atur Posisi Nama
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Container>
  );
};

export default UploadNames;
