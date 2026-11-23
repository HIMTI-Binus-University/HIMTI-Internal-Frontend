import { useState } from "react";
import { Award } from "lucide-react";
import { PageLayout } from "@/components/Utils";
import { CertificateProvider, useCertificateStore } from "./store";
import UploadNames from "./upload-names";
import PositionEditor from "./position-editor";
import PreviewDownload from "./preview-download";
import Stepper from "./components/Stepper";
import SessionNotice from "./components/SessionNotice";
import { WIZARD_STEPS, type WizardStep } from "./components/steps";

const CertificateWizard = () => {
  const { state, setStep, isRestoring } = useCertificateStore();
  const [isEditingNames, setIsEditingNames] = useState(false);

  const stepLabel =
    WIZARD_STEPS.find((entry) => entry.step === state.currentStep)?.label ?? "";

  // Steps 2 and 3 need a template and a name list, and no half-finished edit.
  const hasData = state.template !== null && state.names.length > 0;
  const maxReachable: WizardStep = hasData && !isEditingNames ? 3 : 1;

  return (
    <PageLayout
      icon={Award}
      title="Certificate Generator"
      breadcrumbs={["Tools", "Certificate Generator", stepLabel]}
      fullHeight
    >
      <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:gap-5">
        {/* Heading and steps share a row on large screens to leave room for the work area. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <section aria-labelledby="certificate-heading" className="min-w-0">
            <h2
              id="certificate-heading"
              className="text-ds-h2 font-bold tracking-tight text-foreground"
            >
              Certificate Generator
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Upload, position, then export certificates.
            </p>
          </section>

          <div className="lg:w-[34rem] lg:shrink-0">
            <Stepper
              current={state.currentStep}
              maxReachable={maxReachable}
              onSelect={setStep}
            />
          </div>
        </div>

        <SessionNotice />

        <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:gap-5">
          {isRestoring && (
            <p role="status" className="text-sm text-muted-foreground">
              Looking for saved work…
            </p>
          )}
          {!isRestoring && state.currentStep === 1 && (
            <UploadNames
              isEditing={isEditingNames}
              onEditingChange={setIsEditingNames}
            />
          )}
          {!isRestoring && state.currentStep === 2 && <PositionEditor />}
          {!isRestoring && state.currentStep === 3 && <PreviewDownload />}
        </div>
      </div>
    </PageLayout>
  );
};

const CertificateGeneratorPage = () => {
  return (
    <CertificateProvider>
      <CertificateWizard />
    </CertificateProvider>
  );
};

export default CertificateGeneratorPage;
