import { FormEvent, useState } from "react";
import { ImagePlus, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Container, PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockEvents } from "@/data/events";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const eventToEdit = mockEvents.find((event) => event.id === eventId);
  const isEditing = Boolean(eventToEdit);
  const [isPendingIntegration, setIsPendingIntegration] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPendingIntegration(true);
  };

  return (
    <PageLayout icon={ImagePlus} title={isEditing ? "Edit event" : "Create event"}>
      <div className="mx-auto w-full max-w-3xl">
        <Container className="overflow-hidden p-0">
          <div className="border-b border-border bg-muted/35 px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold text-foreground">Event details</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isEditing
                ? "Update the information participants see when they discover this event."
                : "Add the information participants will see when they discover this event."}
            </p>
          </div>

          <form className="p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="event-name">
                  Event name
                </label>
                <Input
                  id="event-name"
                  name="name"
                  placeholder="e.g. TECHNO 2027: Wondrous Wonderland"
                  defaultValue={eventToEdit?.name}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Use the public name participants will recognize.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="event-description">
                  Public description
                </label>
                <textarea
                  id="event-description"
                  name="description"
                  rows={5}
                  placeholder="Tell participants what this event is about."
                  defaultValue={eventToEdit?.publicDescription ?? ""}
                  className="flex w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                />
                <p className="text-sm text-muted-foreground">
                  This appears alongside the event name in the participant experience.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="event-cover-image">
                  Cover image URL
                </label>
                <Input
                  id="event-cover-image"
                  name="coverImageUrl"
                  type="url"
                  placeholder="https://example.com/event-cover.jpg"
                  defaultValue={eventToEdit?.coverImageUrl ?? ""}
                />
                <p className="text-sm text-muted-foreground">
                  Use a publicly accessible image URL. You can add one later.
                </p>
              </div>
            </div>

            {isPendingIntegration && (
              <p
                role="status"
                className="mt-6 flex items-start gap-2 rounded-lg border border-semantic-info-border bg-semantic-info-background px-3 py-2.5 text-sm leading-5 text-semantic-info"
              >
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.75]" />
                {isEditing ? "Event updates" : "Event creation"} will be available when the events API is connected.
              </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/events")}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save changes" : "Create event"}</Button>
            </div>
          </form>
        </Container>
      </div>
    </PageLayout>
  );
};

export default CreateEventPage;
