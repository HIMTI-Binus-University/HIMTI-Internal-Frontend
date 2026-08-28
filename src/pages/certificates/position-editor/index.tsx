import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";

const PositionEditor = () => {
  const { setStep } = useCertificateStore();

  return (
    <Container>
      <ContainerHeader>Atur Posisi Nama</ContainerHeader>
      <div className="p-6">
        <p className="text-muted-foreground">
          👤 Person 2: Implement canvas editor and settings panel here
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Features to implement:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            <li>• Canvas editor with Fabric.js (drag & drop text)</li>
            <li>• Zoom controls (Plus/Minus buttons)</li>
            <li>• Settings panel (position, typography, advanced settings)</li>
            <li>• Navigation to Step 1 & Step 3</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button onClick={() => setStep(3)}>
            Preview Hasil
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default PositionEditor;
