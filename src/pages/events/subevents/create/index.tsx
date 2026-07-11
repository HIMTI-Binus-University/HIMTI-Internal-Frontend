import { FormEvent, useState } from "react";
import { CalendarClock, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Container, PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockEvents } from "@/data/events";

const fieldLabelClassName = "text-sm font-semibold text-foreground";
const fieldHelpClassName = "text-sm text-muted-foreground";

const CreateSubeventPage = () => {
  const navigate = useNavigate();
  const { eventId, subeventId } = useParams();
  const parentEvent = mockEvents.find((event) => event.id === eventId);
  const subeventToEdit = parentEvent?.subevents.find((subevent) => subevent.id === subeventId);
  const isEditing = Boolean(subeventToEdit);
  const parentEventName = parentEvent?.name ?? "Selected event";
  const [isPendingIntegration, setIsPendingIntegration] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPendingIntegration(true);
  };

  return (
    <PageLayout
      icon={CalendarClock}
      title={isEditing ? "Edit sub-event" : "Create sub-event"}
      breadcrumbs={["Tools", "Events", parentEventName, isEditing ? "Edit sub-event" : "Create sub-event"]}
    >
      <div className="mx-auto w-full max-w-4xl">
        <Container className="overflow-hidden p-0">
          <div className="border-b border-border bg-muted/35 px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold text-foreground">Sub-event details</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isEditing ? "Editing" : "Creating a sub-event for"} <span className="font-semibold text-foreground">{subeventToEdit?.name ?? parentEventName}</span>{isEditing ? ` in ${parentEventName}.` : "."}
            </p>
          </div>

          <form aria-label="Create sub-event form" className="p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className={fieldLabelClassName} htmlFor="subevent-name">
                  Sub-event name
                </label>
                <Input
                  id="subevent-name"
                  name="name"
                  placeholder="e.g. TECHNO 2027 - Greater Jakarta"
                  defaultValue={subeventToEdit?.name}
                  required
                />
                <p className={fieldHelpClassName}>
                  Use the public name participants will recognize.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={fieldLabelClassName} htmlFor="subevent-public-description">
                    Public description
                  </label>
                  <textarea
                    id="subevent-public-description"
                    name="publicDescription"
                    rows={5}
                    placeholder="Tell participants what this sub-event is about."
                    className="flex w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                  />
                  <p className={fieldHelpClassName}>Visible before a participant registers.</p>
                </div>

                <div className="space-y-2">
                  <label className={fieldLabelClassName} htmlFor="subevent-private-description">
                    Private description
                  </label>
                  <textarea
                    id="subevent-private-description"
                    name="privateDescription"
                    rows={5}
                    placeholder="Share information for confirmed participants."
                    className="flex w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                  />
                  <p className={fieldHelpClassName}>Visible after a participant is confirmed.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName} htmlFor="subevent-date">
                  Date and time
                </label>
                <Input
                  id="subevent-date"
                  name="date"
                  type="datetime-local"
                  defaultValue={subeventToEdit?.date.slice(0, 16)}
                  required
                />
                <p className={fieldHelpClassName}>Set when this sub-event begins.</p>
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName} htmlFor="subevent-type">
                  Sub-event type
                </label>
                <select
                  id="subevent-type"
                  name="type"
                  required
                  defaultValue={subeventToEdit?.type ?? ""}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  <option value="" disabled>Select a type</option>
                  <option value="MAIN_EVENT">Main event</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="WELCOMING_PARTY">Welcoming party</option>
                  <option value="DOMESTIC_STUDY_TOUR">Domestic study tour</option>
                  <option value="INTERNATIONAL_STUDY_TOUR">International study tour</option>
                  <option value="COMPANY_VISIT">Company visit</option>
                  <option value="OTHER">Other</option>
                </select>
                <p className={fieldHelpClassName}>Choose the format participants will attend.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={fieldLabelClassName} htmlFor="subevent-location-address">
                    Location address
                  </label>
                  <Input
                    id="subevent-location-address"
                    name="locationAddress"
                    placeholder="e.g. BINUS Anggrek Campus"
                  />
                  <p className={fieldHelpClassName}>Where participants should go.</p>
                </div>

                <div className="space-y-2">
                  <label className={fieldLabelClassName} htmlFor="subevent-location-url">
                    Location URL
                  </label>
                  <Input
                    id="subevent-location-url"
                    name="locationUrl"
                    type="url"
                    placeholder="https://maps.google.com/..."
                  />
                  <p className={fieldHelpClassName}>Add a map or directions link.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className={fieldLabelClassName} htmlFor="subevent-price">
                  Event price
                </label>
                <Input id="subevent-price" name="price" type="number" min="0" step="1" placeholder="0" />
                <p className={fieldHelpClassName}>Enter 0 for a free sub-event.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={fieldLabelClassName} htmlFor="subevent-max-participants">
                    Maximum participants
                  </label>
                  <Input
                    id="subevent-max-participants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 120"
                  />
                  <p className={fieldHelpClassName}>Leave blank if capacity is unlimited.</p>
                </div>

                <div className="space-y-2">
                  <label className={fieldLabelClassName} htmlFor="subevent-max-tickets">
                    Maximum tickets per user
                  </label>
                  <Input
                    id="subevent-max-tickets"
                    name="maxTicketsPerUser"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 1"
                  />
                  <p className={fieldHelpClassName}>Leave blank to use the default ticket limit.</p>
                </div>
              </div>
            </div>

            {isPendingIntegration && (
              <p
                role="status"
                className="mt-6 flex items-start gap-2 rounded-lg border border-semantic-info-border bg-semantic-info-background px-3 py-2.5 text-sm leading-5 text-semantic-info"
              >
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.75]" />
                {isEditing ? "Sub-event updates" : "Sub-event creation"} will be available when the events API is connected.
              </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/events")}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save changes" : "Create sub-event"}</Button>
            </div>
          </form>
        </Container>
      </div>
    </PageLayout>
  );
};

export default CreateSubeventPage;
