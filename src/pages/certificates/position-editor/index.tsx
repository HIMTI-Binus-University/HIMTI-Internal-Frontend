import { useCertificateStore } from "../store";
import WizardFooter from "../components/WizardFooter";
import CanvasPreview from "./CanvasPreview";
import SettingsPanel from "./SettingsPanel";

const PositionEditor = () => {
  const { setStep } = useCertificateStore();

  return (
    <>
      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-5">
        <CanvasPreview />
        <SettingsPanel />
      </div>

      <WizardFooter
        onBack={() => setStep(1)}
        nextLabel="Preview Result"
        onNext={() => setStep(3)}
        hint="Changes are applied to every certificate."
      />
    </>
  );
};

export default PositionEditor;
