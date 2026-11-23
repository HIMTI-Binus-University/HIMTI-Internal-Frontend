import { useEffect, useMemo, useState } from "react";

import { useCertificateStore } from "../store";
import WizardFooter from "../components/WizardFooter";
import CertificatePreview from "./CertificatePreview";
import ResultInspection from "./components/result-inspection";
import OutputFormat, { type OutputOption } from "./components/output-format";
import { generateCertificates, type CertificateFormat } from "../utils/generateCertificates";
import {
  createCanvasMeasure,
  ensureFontReady,
  fitName,
  getBoxWidth,
  summarizeFits,
  type FitResult,
} from "../utils/fitName";

const OUTPUT_OPTIONS: Array<OutputOption & { id: CertificateFormat; file: string }> = [
  {
    id: "png-zip",
    label: "PNG per participant in ZIP",
    shortLabel: "PNG ZIP",
    description: "One PNG per participant, original size.",
    file: "certificates.zip",
  },
  {
    id: "pdf-zip",
    label: "PDF per participant in ZIP",
    shortLabel: "PDF ZIP",
    description: "One single-page PDF per participant.",
    file: "certificates.zip",
  },
  {
    id: "pdf-multi",
    label: "Single multi-page PDF",
    shortLabel: "One PDF",
    description: "One PDF, one participant per page.",
    file: "certificates.pdf",
  },
];

const PreviewDownload = () => {
  const { state, setStep } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  // Measuring needs the font; bump this once it has loaded to re-measure.
  const [fontVersion, setFontVersion] = useState(0);

  const { fontFamily, fontWeight } = textSettings;

  useEffect(() => {
    let cancelled = false;
    void ensureFontReady({ fontFamily, fontWeight }).then(() => {
      if (!cancelled) setFontVersion((version) => version + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontWeight]);

  // One fit result per name, shared by the preview, the stats and the export.
  const fits = useMemo<FitResult[]>(() => {
    if (!template) return [];

    const measure = createCanvasMeasure(textSettings);
    const boxWidth = getBoxWidth(textSettings, template.width);

    return names.map((entry) => fitName(entry.name, textSettings, boxWidth, measure));
    // fontVersion forces a re-measure once the font has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names, textSettings, template, fontVersion]);

  const summary = useMemo(() => summarizeFits(fits), [fits]);
  const reviewIndexes = useMemo(
    () => fits.flatMap((fit, index) => (fit.status === "overflow" ? [index] : [])),
    [fits],
  );

  const handleReviewNext = () => {
    if (reviewIndexes.length === 0) return;
    const next = reviewIndexes.find((index) => index > currentIndex) ?? reviewIndexes[0];
    setCurrentIndex(next);
  };

  const handleDownload = async (optionId: string) => {
    if (!template) return;

    const option = OUTPUT_OPTIONS.find((entry) => entry.id === optionId);
    setResult(null);
    setIsGenerating(true);
    setProgress({ current: 0, total: names.length });

    try {
      await generateCertificates({
        template,
        names,
        textSettings,
        format: optionId as CertificateFormat,
        onProgress: (current, total) => setProgress({ current, total }),
      });
      setResult({
        tone: "success",
        message: `Downloaded ${option?.file ?? "your certificates"} (${names.length} ${names.length === 1 ? "certificate" : "certificates"}).`,
      });
    } catch (error) {
      console.error("Failed to generate certificates:", error);
      setResult({
        tone: "error",
        message: "Could not generate the certificates. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <>
      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)] lg:gap-5">
        <CertificatePreview
          fits={fits}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
        />

        <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:gap-5 lg:overflow-y-auto">
          <ResultInspection
            summary={summary}
            reviewCount={reviewIndexes.length}
            onReviewNext={handleReviewNext}
          />
          <OutputFormat
            options={OUTPUT_OPTIONS}
            onDownload={handleDownload}
            isGenerating={isGenerating}
            totalCertificates={names.length}
            progress={progress}
            result={result}
            reviewCount={reviewIndexes.length}
          />
        </div>
      </div>

      <WizardFooter onBack={() => setStep(2)} backDisabled={isGenerating} />
    </>
  );
};

export default PreviewDownload;
