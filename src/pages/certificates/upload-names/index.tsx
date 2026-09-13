import { ArrowRight } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import TemplatePreview from "./TemplatePreview";
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
      <div className="flex h-[calc(100vh-12rem)] gap-6 p-6">
        <div className="w-1/2">
          <TemplatePreview />
        </div>

        <div className="w-1/2">
          <UploadPanel />
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
