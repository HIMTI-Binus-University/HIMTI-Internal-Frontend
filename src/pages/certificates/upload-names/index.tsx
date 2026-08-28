import { ArrowRight } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";

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
      <div className="p-6">
        <p className="text-muted-foreground">
          👤 Person 1: Implement template upload and name input here
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Features to implement:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            <li>• Template uploader (PNG only)</li>
            <li>• Name input (XLSX/CSV/Manual textarea)</li>
            <li>• Name list dialog (view/edit)</li>
            <li>• Validation & navigation to Step 2</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext} disabled={!canProceed}>
            Atur Posisi Nama
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default UploadNames;
