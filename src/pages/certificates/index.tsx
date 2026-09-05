import { Award } from "lucide-react";
import { PageLayout } from "@/components/Utils";
import { CertificateProvider, useCertificateStore } from "./store";
import UploadNames from "./upload-names";
import PositionEditor from "./position-editor";
import PreviewDownload from "./preview-download";

const CertificateWizard = () => {
  const { state } = useCertificateStore();

  const breadcrumbs = [
    "Tools",
    "Certificate Generator",
    state.currentStep === 1
      ? "Data & Template"
      : state.currentStep === 2
      ? "Atur Posisi"
      : "Preview & Download",
  ];

  return (
    <PageLayout
      icon={Award}
      title="Certificate Generator"
      breadcrumbs={breadcrumbs}
    >
      {state.currentStep === 1 && <UploadNames />}
      {state.currentStep === 2 && <PositionEditor />}
      {state.currentStep === 3 && <PreviewDownload />}
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
