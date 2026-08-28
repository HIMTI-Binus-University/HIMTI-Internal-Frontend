import { useCertificateStore } from "../store";

const TemplatePreview = () => {
  const { state } = useCertificateStore();
  const { template } = state;

  if (!template) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
        <p className="text-sm text-muted-foreground">
          No template uploaded yet. Please upload a PNG template.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-lg border border-border bg-muted/10 p-2">
        <img
          src={template.url}
          alt="Certificate Template"
          className="max-h-[calc(100vh-16rem)] max-w-full object-contain"
        />
      </div>
    </div>
  );
};

export default TemplatePreview;
