import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { RegistrationFormBuilder } from "./RegistrationFormBuilder";

const { save, action, form } = vi.hoisted(() => ({
  save: vi.fn(),
  action: vi.fn(),
  form: {
    revision: 7,
    name: "Workshop RSVP",
    status: "DRAFT",
    sections: [
      {
        title: "Preferences",
        questions: [
          {
            logicalId: "stable-track",
            fieldKey: "track",
            label: "Choose track",
            type: "SELECT",
            options: [
              { label: "Web", value: "web" },
              { label: "Mobile", value: "mobile" },
            ],
          },
        ],
      },
    ],
  },
}));
vi.mock("@/api/event-registration/queries", () => ({
  useRegistrationForm: () => ({ data: form }),
  useSaveRegistrationForm: () => ({ mutate: save }),
  useRegistrationFormAction: () => ({ mutate: action, mutateAsync: action }),
}));

test.each([
  ["section", "Preferences", "Section 1 title"],
  ["question", "Choose track", "Question label"],
  ["option", "Web", "Option label"],
])(
  "removing a %s requires confirmation and stays local until saved",
  async (kind, target, field) => {
    save.mockClear();
    action.mockClear();
    render(<RegistrationFormBuilder eventId="event-1" canEdit />);
    const before = screen.getAllByRole("textbox", { name: field }).length;
    fireEvent.click(
      screen.getAllByRole("button", { name: `Remove ${kind}` })[0],
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(target);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getAllByRole("textbox", { name: field })).toHaveLength(
      before,
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: `Remove ${kind}` })[0],
    );
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: `Remove ${kind}`,
      }),
    );
    await waitFor(() =>
      expect(screen.queryAllByRole("textbox", { name: field })).toHaveLength(
        before - 1,
      ),
    );
    expect(save).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  },
);

test("publishing names the saved form and runs only on confirmation", async () => {
  action.mockClear().mockResolvedValue(undefined);
  render(<RegistrationFormBuilder eventId="event-1" canEdit />);
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Workshop RSVP");
  expect(screen.getByRole("alertdialog")).toHaveTextContent(
    "Unsaved edits are not included",
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(action).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  fireEvent.click(screen.getByRole("button", { name: "Publish form" }));
  await waitFor(() =>
    expect(action).toHaveBeenCalledExactlyOnceWith("publish"),
  );
});

test("published edits warn about manual communication and preserve question identity", async () => {
  form.status = "PUBLISHED";
  save.mockClear();
  render(<RegistrationFormBuilder eventId="event-1" canEdit />);
  expect(screen.queryByText(/Duplicate to draft/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox", { name: "Question label" }), {
    target: { value: "Renamed track" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  const dialog = screen.getByRole("alertdialog");
  expect(dialog).toHaveTextContent("No notifications are sent");
  expect(dialog).toHaveTextContent("every existing active participant");
  expect(save).not.toHaveBeenCalled();
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Save and publish changes" }),
  );
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0]).toMatchObject({
    expectedRevision: 7,
    sections: [
      { questions: [{ logicalId: "stable-track", label: "Renamed track" }] },
    ],
  });
  form.status = "DRAFT";
});
