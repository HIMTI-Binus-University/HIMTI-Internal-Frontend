import { useState, useRef, useLayoutEffect } from "react";
import { ArrowRight, FileText, FileImage } from "lucide-react";
import { Container, ContainerHeader } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";

// import TemplatePreview from "./TemplatePreview";
import UploadTemplate from "./UploadTemplate";
import UploadPanel from "./UploadPanel";

const MAX_ROW_HEIGHT = 640;

const UploadNames = () => {
  const { state, setStep } = useCertificateStore();
  const [isEditing, setIsEditing] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  const canProceed = state.template !== null && state.names.length > 0 && !isEditing;

  const handleNext = () => {
    if (canProceed) {
      setStep(2);
    }
  };

  useLayoutEffect(() => {
    const recalc = () => {
      if (!rowRef.current || !footerRef.current) return;

      const top = rowRef.current.getBoundingClientRect().top;
      const footerHeight = footerRef.current.getBoundingClientRect().height;
      const available = window.innerHeight - top - footerHeight;

      setRowHeight(Math.max(available, MAX_ROW_HEIGHT));
    };

    recalc();

    window.addEventListener("resize", recalc);

    const resizeObserver = new ResizeObserver(recalc);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    return () => {
      window.removeEventListener("resize", recalc);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Container>
      <ContainerHeader>Upload Template & Input Names</ContainerHeader>
      <div
        ref={rowRef}
        className="flex items-stretch gap-6 p-6"
        style={{ height: rowHeight ? `${rowHeight}px` : undefined }}
      >
        <div className="flex h-full w-1/2 min-h-0">
          <div className="flex h-full w-full min-h-0 flex-col overflow-y-auto rounded-lg border border-border gap-3 p-4">
            <div className="flex w-full items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <FileImage className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col ml-5">
                <h3 className="text-base font-semibold text-blue-900">Certificate template</h3>
                <p className="mt-1 text-sm text-gray-500">PNG or JPG/JPEG, maximum 15 MB.</p>
              </div>
            </div>

            <UploadTemplate />
          </div>

        </div>

        <div className="flex h-full w-1/2 min-h-0">
           <div className="flex h-full w-full min-h-0 flex-col overflow-y-auto rounded-lg border border-border p-4">
            <div className="flex w-full items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col ml-5">
                <h3 className="text-base font-semibold text-blue-900">Name List</h3>
                <p className="mt-1 text-sm text-gray-500">Use XLSX, CSV, or paste one name per line.</p>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <UploadPanel onEditStateChange={setIsEditing} />
            </div>
          </div>
        </div>

      </div>

      <div ref={footerRef} className="flex justify-end border-t border-border px-6 py-4">
        <Button onClick={handleNext} disabled={!canProceed}>
          Set Name Position
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Container>
  );
};

export default UploadNames;
