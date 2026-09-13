import { ArrowLeft } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import CertificatePreview from "./CertificatePreview";
import DownloadPanel from "./DownloadPanel";
import ResultInspection from './components/result-inspection';
import OutputFormat from './components/output-format';
import { useState } from "react";

// Add these interfaces
interface StatItem {
  label: string;
  value: number;
  type?: 'positive' | 'warning' | 'danger' | 'info';
}

interface OutputOption {
  id: string;
  label: string;
  description?: string;
}

const PreviewDownload = () => {
  const { setStep } = useCertificateStore();
  
  // Add state for generation
  const [isGenerating, setIsGenerating] = useState(false);

  // Add your stats data
  const stats: StatItem[] = [
    { label: 'Sertifikat siap', value: 1, type: 'positive' },
    { label: 'Menggunakan nama lengkap', value: 1, type: 'positive' },
    { label: 'Menggunakan ukuran lebih kecil', value: 0, type: 'info' },
    { label: 'Menggunakan nama dipersingkat', value: 0, type: 'info' },
    { label: 'Override manual', value: 0, type: 'info' },
    { label: 'Mencapai ukuran minimum', value: 0, type: 'info' },
    { label: 'Perlu ditinjau', value: 0, type: 'info' },
    { label: 'Nama duplikat', value: 0, type: 'info' },
    { label: 'Estimasi file', value: 1, type: 'positive' },
  ];

  const highlightedStats: StatItem[] = [
    { label: 'Nama dipersingkat', value: 0, type: 'info' },
    { label: 'Nama mencapai font minimum', value: 0, type: 'info' },
    { label: 'Nama masih overflow', value: 0, type: 'info' },
    { label: 'Nama dengan override manual', value: 0, type: 'info' },
  ];

  const outputOptions: OutputOption[] = [
    { 
      id: 'png-zip', 
      label: 'PNG per peserta dalam ZIP',
      description: 'Resolusi asli template.'
    },
    { 
      id: 'pdf-zip', 
      label: 'PDF per peserta dalam ZIP',
      description: 'Satu halaman per file.'
    },
    { 
      id: 'pdf-multi', 
      label: 'Satu PDF multi-halaman',
      description: 'Satu peserta per halaman.'
    },
  ];

  const handleDownload = (optionId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Downloading: ${optionId}`);
    }, 2000);
  };

  return (
    <Container>
      <ContainerHeader>Preview & Download</ContainerHeader>
      
      <div className="flex gap-6 p-6">
        <div className="flex-1 flex flex-col gap-6">
          <CertificatePreview />
          <DownloadPanel />
        </div>

        <div className="w-[400px] flex flex-col gap-6">
          <ResultInspection 
            stats={stats}
            highlightedStats={highlightedStats}
          />
          <OutputFormat 
            options={outputOptions}
            onDownload={handleDownload}
            isGenerating={isGenerating}
          />
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