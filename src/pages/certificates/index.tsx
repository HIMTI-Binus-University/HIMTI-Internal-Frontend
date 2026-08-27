import { Award } from "lucide-react";
import { PageLayout, Container, ContainerHeader } from "@/components/Utils";

const CertificateGeneratorPage = () => {
  return (
    <PageLayout icon={Award} title="Certificate Generator">
      <Container>
        <ContainerHeader>Batch Certificate Generator</ContainerHeader>
        <div className="p-6">
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </Container>
    </PageLayout>
  );
};

export default CertificateGeneratorPage;
