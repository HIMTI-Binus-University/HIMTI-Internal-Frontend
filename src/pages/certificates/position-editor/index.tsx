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
      <ContainerHeader>Set Name Position</ContainerHeader>
      <div className="flex flex-col gap-4 p-4 sm:p-6 lg:h-[calc(100vh-12rem)] lg:flex-row lg:gap-6">
        <div className="w-full min-w-0 lg:w-1/2">
          <CanvasPreview />
        </div>

        <div className="w-full min-w-0 lg:w-1/2">
          <SettingsPanel />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <Button
          variant="outline"
          className="w-full justify-center sm:w-auto"
          onClick={() => setStep(1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="w-full justify-center sm:w-auto"
          onClick={() => setStep(3)}
        >
          Preview Result
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Container>
  );
};

export default PositionEditor;
