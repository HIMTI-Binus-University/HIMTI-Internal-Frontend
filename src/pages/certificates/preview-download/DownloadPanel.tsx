const DownloadPanel = () => {
  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-center text-sm text-muted-foreground">
          👤 Person 3: Implement download controls here
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          (Navigation Controls, Download Buttons: PNG.zip/PDF.zip/PDF Multi-page, Progress Bar)
        </p>
      </div>
    </div>
  );
};

export default DownloadPanel;
