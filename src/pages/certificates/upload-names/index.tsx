import { Container, ContainerHeader } from "@/components/Utils";

const UploadNames = () => {
  return (
    <Container>
      <ContainerHeader>Upload Template & Input Nama</ContainerHeader>
      <div className="p-6">
        <p className="text-muted-foreground">
          👤 Person 1: Implement template upload and name input here
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Features to implement:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            <li>• Template uploader (PNG only)</li>
            <li>• Name input (XLSX/CSV/Manual textarea)</li>
            <li>• Name list dialog (view/edit)</li>
            <li>• Validation & navigation to Step 2</li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default UploadNames;
