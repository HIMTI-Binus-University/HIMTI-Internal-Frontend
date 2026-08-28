import { Container, ContainerHeader } from "@/components/Utils";

const PositionEditor = () => {
  return (
    <Container>
      <ContainerHeader>Atur Posisi Nama</ContainerHeader>
      <div className="p-6">
        <p className="text-muted-foreground">
          👤 Person 2: Implement canvas editor and settings panel here
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Features to implement:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            <li>• Canvas editor with Fabric.js (drag & drop text)</li>
            <li>• Zoom controls (Plus/Minus buttons)</li>
            <li>• Settings panel (position, typography, advanced settings)</li>
            <li>• Navigation to Step 1 & Step 3</li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default PositionEditor;
