const UploadPanel = () => {
  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          👤 Person 1: Implement upload & input panel here
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          (Template Uploader, Name Input: XLSX/CSV/Manual, Name List Dialog)
        </p>
      </div>
    </div>
  );
};

export default UploadPanel;
