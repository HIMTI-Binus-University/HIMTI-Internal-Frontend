import { ClipboardList } from "lucide-react";
import { useParams } from "react-router-dom";

import { PageLayout } from "@/components/Utils";
import { mockEvents } from "@/data/events";
import type { RegistrationForm } from "@/types/events";

import { FormBuilder } from "./components/FormBuilder";

const RegistrationFormPage = () => {
  const { eventId, subeventId } = useParams();
  const event = mockEvents.find((item) => item.id === eventId);
  const subevent = event?.subevents.find((item) => item.id === subeventId);
  const form: RegistrationForm | undefined = subevent && (
    subevent.registrationForms[0] ?? {
      id: `local-form-${subevent.id}`,
      status: "DRAFT",
      questionCount: 0,
      questions: [],
    }
  );

  return (
    <PageLayout icon={ClipboardList} title="Registration form" breadcrumbs={["Tools", "Events", event?.name ?? "Event", subevent?.name ?? "Sub-event", "Registration form"]}>
      {subevent && form && <FormBuilder form={form} subevent={subevent} />}
    </PageLayout>
  );
};

export default RegistrationFormPage;
