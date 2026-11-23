import { FileImage, FileText } from "lucide-react";

import { ContainerSection } from "@/components/Utils";
import { useCertificateStore } from "../store";
import WizardFooter from "../components/WizardFooter";
import UploadTemplate from "./UploadTemplate";
import UploadPanel from "./UploadPanel";

interface UploadNamesProps {
  onEditingChange: (isEditing: boolean) => void;
  isEditing: boolean;
}

const UploadNames = ({ onEditingChange, isEditing }: UploadNamesProps) => {
  const { state, setStep } = useCertificateStore();

  const missing = [
    state.template === null ? "a template" : null,
    state.names.length === 0 ? "at least one name" : null,
  ].filter(Boolean);

  const canProceed = missing.length === 0 && !isEditing;

  const hint = isEditing
    ? "Save or cancel your name edits to continue."
    : missing.length > 0
      ? `Add ${missing.join(" and ")} to continue.`
      : `${state.names.length} ${state.names.length === 1 ? "name" : "names"} ready.`;

  return (
    <>
      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:gap-5">
        <ContainerSection
          icon={FileImage}
          title="Certificate Template"
          description="PNG or JPG/JPEG, maximum 15 MB."
        >
          <UploadTemplate />
        </ContainerSection>

        <ContainerSection
          icon={FileText}
          title="Name List"
          description="Use XLSX, CSV, or paste one name per line."
        >
          <UploadPanel onEditStateChange={onEditingChange} />
        </ContainerSection>
      </div>

      <WizardFooter
        hint={hint}
        nextLabel="Set Name Position"
        onNext={() => setStep(2)}
        nextDisabled={!canProceed}
      />
    </>
  );
};

export default UploadNames;
