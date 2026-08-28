import { Container, ContainerHeader } from "@/components/Utils";

const PreviewDownload = () => {
  return (
    <Container>
      <ContainerHeader>Preview & Download</ContainerHeader>
      <div className="p-6">
        <p className="text-muted-foreground">
          👤 Person 3: Implement certificate preview and download options here
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Features to implement:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            <li>• Certificate preview (read-only canvas)</li>
            <li>• Navigation controls (prev/next/longest name)</li>
            <li>• Download buttons (PNG.zip, PDF.zip, PDF multi-page)</li>
            <li>• Progress bar for generation (display in footer area)</li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default PreviewDownload;
