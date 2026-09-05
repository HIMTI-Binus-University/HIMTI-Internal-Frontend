import { ArrowLeft } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import CertificatePreview from "./CertificatePreview";
import DownloadPanel from "./DownloadPanel";

const PreviewDownload = () => {
  const { setStep } = useCertificateStore();

  return (
    <Container>
      <ContainerHeader>Preview & Download</ContainerHeader>
      <div className="flex h-[calc(100vh-12rem)] gap-6 p-6">
        <div className="w-1/2">
          <CertificatePreview />
        </div>

        <div className="w-1/2">
          <DownloadPanel />
        </div>
      </div>

      <div className="flex justify-start border-t border-border px-6 py-4">
        <Button variant="outline" onClick={() => setStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    </Container>
  );
};

export default PreviewDownload;
