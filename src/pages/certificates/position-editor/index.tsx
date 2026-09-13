import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import CanvasPreview from "./CanvasPreview";
import SettingsPanel from "./SettingsPanel";

const PositionEditor = () => {
  const { setStep } = useCertificateStore();

  return (
    <Container>
      <ContainerHeader>Atur Posisi Nama</ContainerHeader>
      <div className="flex h-[calc(100vh-12rem)] gap-6 p-6">
        <div className="w-1/2">
          <CanvasPreview />
        </div>

        <div className="w-1/2">
          <SettingsPanel />
        </div>
      </div>

      <div className="flex justify-between border-t border-border px-6 py-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button onClick={() => setStep(3)}>
          Preview Hasil
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Container>
  );
};

export default PositionEditor;
