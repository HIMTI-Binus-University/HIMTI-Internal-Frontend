import { ArrowLeft } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import CertificatePreview from "./CertificatePreview";
import ResultInspection from './components/result-inspection';
import OutputFormat from './components/output-format';
import { useState } from "react";
import { generateCertificates } from "../utils/generateCertificates";

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
  const { state, setStep } = useCertificateStore();
  const { template, names, textSettings } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const stats: StatItem[] = [
    { label: 'Certificates ready', value: names.length, type: 'positive' },
    { label: 'Using full name', value: names.length, type: 'positive' },
    { label: 'Using smaller size', value: 0, type: 'info' },
    { label: 'Using abbreviated name', value: 0, type: 'info' },
    { label: 'Manual override', value: 0, type: 'info' },
    { label: 'Reached minimum size', value: 0, type: 'info' },
    { label: 'Needs review', value: 0, type: 'info' },
    { label: 'Duplicate names', value: 0, type: 'info' },
    { label: 'Estimated files', value: names.length, type: 'positive' },
  ];

  const highlightedStats: StatItem[] = [
    { label: 'Abbreviated names', value: 0, type: 'info' },
    { label: 'Names at minimum font', value: 0, type: 'info' },
    { label: 'Names still overflow', value: 0, type: 'info' },
    { label: 'Names with manual override', value: 0, type: 'info' },
  ];

  const outputOptions: OutputOption[] = [
    { 
      id: 'png-zip', 
      label: 'PNG per participant in ZIP',
      description: 'Original template resolution.'
    },
    { 
      id: 'pdf-zip', 
      label: 'PDF per participant in ZIP',
      description: 'One page per file.'
    },
    { 
      id: 'pdf-multi', 
      label: 'Single multi-page PDF',
      description: 'One participant per page.'
    },
  ];

  const handleDownload = async (optionId: string) => {
    if (!template) {
      alert("No template loaded");
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: names.length });

    try {
      await generateCertificates({
        template,
        names,
        textSettings,
        format: optionId as "png-zip" | "pdf-zip" | "pdf-multi",
        onProgress: (current, total) => {
          setProgress({ current, total });
        },
      });
    } catch (error) {
      console.error("Failed to generate certificates:", error);
      alert("Failed to generate certificates. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Container>
      <ContainerHeader>Preview & Download</ContainerHeader>
      
      <div className="flex gap-6 p-6">
        <div className="flex-1 flex flex-col gap-6">
          <CertificatePreview />
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
            totalCertificates={names.length}
            progress={progress}
          />
        </div>
      </div>

      <div className="flex justify-start border-t border-border px-6 py-4">
        <Button variant="outline" onClick={() => setStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </Container>
  );
};

export default PreviewDownload;