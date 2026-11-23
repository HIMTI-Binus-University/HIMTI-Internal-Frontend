import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudyClubsTab from "./study-clubs-tab";
import {
  sessionStatus,
  studyClubLinkError,
  toWibInput,
  type StudyClubSession,
} from "./study-clubs";

const mocks = vi.hoisted(() => ({
  courses: {
    data: [
      {
        id: "algorithms",
        name: "Algorithm & Programming",
        code: null,
        status: "ACTIVE",
      },
      { id: "calculus", name: "Calculus", code: null, status: "ACTIVE" },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@/api/education/queries", () => ({
  useGetCourseGroups: () => mocks.courses,
}));
vi.mock("@/api/study-clubs/queries", () => ({
  useGetStudyClubs: mocks.list,
  useCreateStudyClub: () => ({ mutateAsync: mocks.create }),
  useUpdateStudyClub: () => ({ mutateAsync: mocks.update }),
}));
const session: StudyClubSession = {
  id: "session-1",
  title: "Algorithm practice",
  type: "Study Club",
  courseId: "algorithms",
  course: "Algorithm & Programming",
  description: "Bring your notes.",
  startsAt: "2099-11-04T03:00:00.000Z",
  endsAt: "2099-11-04T05:00:00.000Z",
  location: "Room 301",
  meetingUrl: "",
  registrationUrl: "",
  capacity: 30,
  isDemo: false,
  createdAt: "2026-11-02T03:00:00.000Z",
  updatedAt: "2026-11-02T03:00:00.000Z",
};
const listResult = (rows: StudyClubSession[] = [], total = rows.length) => ({
  data: {
    data: rows,
    pagination: {
      page: 1,
      limit: 6,
      total,
      totalPages: Math.max(1, Math.ceil(total / 6)),
    },
  },
  isLoading: false,
  isError: false,
  refetch: mocks.refetch,
});
const renderTab = (url = "/education?tab=schedules") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <StudyClubsTab />
    </MemoryRouter>,
  );
const selectOption = async (label: string, option: string) => {
  const trigger = screen.getByRole("combobox", { name: label });
  fireEvent.click(trigger);
  const item = await screen.findByRole("option", { name: option });
  fireEvent.mouseMove(item);
  fireEvent.click(item);
  await waitFor(() =>
    expect(trigger).toHaveAttribute("aria-expanded", "false"),
  );
};
const fillForm = async () => {
  fireEvent.change(screen.getByLabelText("Session title"), {
    target: { value: "Calculus review" },
  });
  await selectOption("Course", "Calculus");
  fireEvent.change(screen.getByLabelText("Start date"), {
    target: { value: "2099-11-04" },
  });
  fireEvent.change(screen.getByLabelText("Start time"), {
    target: { value: "10:00" },
  });
  fireEvent.change(screen.getByLabelText("End date"), {
    target: { value: "2099-11-04" },
  });
  fireEvent.change(screen.getByLabelText("End time"), {
    target: { value: "12:00" },
  });
  fireEvent.change(screen.getByLabelText("Location"), {
    target: { value: "Room 302" },
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.courses.isLoading = false;
  mocks.courses.isError = false;
  mocks.list.mockReturnValue(listResult());
  mocks.create.mockReset().mockResolvedValue(session);
  mocks.update.mockReset().mockResolvedValue(session);
});

describe("Schedules API integration", () => {
  it("creates through the API with WIB converted to UTC and server-controlled fields omitted", async () => {
    renderTab();
    expect(
      screen.getByText("Your next session starts here"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    expect(
      screen.getByRole("combobox", { name: "Session type" }),
    ).toHaveTextContent("Study Club");
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.create).toHaveBeenCalledWith({
      title: "Calculus review",
      type: "Study Club",
      courseId: "calculus",
      description: "",
      startsAt: "2099-11-04T03:00:00.000Z",
      endsAt: "2099-11-04T05:00:00.000Z",
      location: "Room 302",
      meetingUrl: "",
      registrationUrl: "",
      capacity: null,
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Session saved successfully",
    );
  });

  it("creates a Responsi schedule using the selected session type", async () => {
    renderTab();
    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    await fillForm();
    await selectOption("Session type", "Responsi");
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "Responsi" }),
    );
  });

  it("previews and edits an existing server session", async () => {
    mocks.list.mockReturnValue(listResult([{ ...session, type: "Responsi" }]));
    renderTab();
    fireEvent.click(
      screen.getByRole("button", { name: "Preview Algorithm practice" }),
    );
    expect(
      within(screen.getByRole("dialog")).getByText("Room 301"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit session" }));
    expect(screen.getByLabelText("Start date")).toHaveValue("2099-11-04");
    expect(screen.getByLabelText("Start time")).toHaveValue("10:00");
    fireEvent.change(screen.getByLabelText("Session title"), {
      target: { value: "Updated session" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.update).toHaveBeenCalledWith({
      id: "session-1",
      payload: expect.objectContaining({
        title: "Updated session",
        courseId: "algorithms",
        type: "Responsi",
      }),
    });
  });

  it("rejects invalid schedules and unsafe links before sending a mutation", async () => {
    renderTab();
    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    await fillForm();
    const form = screen
      .getByRole("button", { name: "Save session" })
      .closest("form")!;
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "09:00" },
    });
    fireEvent.submit(form);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "End date and time must be after",
    );
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText("Meeting URL (optional)"), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.submit(form);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a complete link",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("validates both links on blur and clears errors when corrected", async () => {
    renderTab();
    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    await fillForm();
    for (const label of [
      "Meeting URL (optional)",
      "Registration URL (optional)",
    ]) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value: "not a link" } });
      fireEvent.blur(input);
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toBeInvalid();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "http:// or https://",
      );
      fireEvent.change(input, {
        target: { value: "https://example.com/session" },
      });
      expect(input).toHaveAttribute("aria-invalid", "false");
      expect(input).toBeValid();
    }
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));
    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          meetingUrl: "https://example.com/session",
          registrationUrl: "https://example.com/session",
        }),
      ),
    );
  });

  it("accepts optional HTTP(S) links and rejects text, malformed schemes and credentials", () => {
    for (const value of [
      "",
      "https://example.com/path?q=1",
      "http://localhost:3000/meeting",
    ]) {
      expect(studyClubLinkError(value)).toBe("");
    }
    for (const value of [
      "not a link",
      "example.com",
      "https:example.com",
      "https:///example.com",
      "ftp://example.com",
      "javascript:alert(1)",
      "https://example.com/a b",
      "https://user:password@example.com",
    ]) {
      expect(studyClubLinkError(value)).not.toBe("");
    }
  });

  it("keeps the form and entered data when the API fails, then permits a retry", async () => {
    mocks.create.mockRejectedValueOnce(new Error("Offline"));
    renderTab();
    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save this session",
    );
    expect(screen.getByLabelText("Session title")).toHaveValue(
      "Calculus review",
    );
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.create).toHaveBeenCalledTimes(2);
  });

  it("sends course, schedule, type, search and pagination filters to the server", async () => {
    mocks.list.mockReturnValue(listResult([session], 7));
    renderTab();
    fireEvent.click(screen.getByRole("button", { name: "Next sessions page" }));
    expect(mocks.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, limit: 6 }),
    );
    await selectOption("Filter by schedule", "Past Sessions");
    await selectOption("Filter by course", "Calculus");
    await selectOption("Filter by session type", "Responsi");
    fireEvent.change(screen.getByLabelText("Search sessions"), {
      target: { value: "review" },
    });
    expect(mocks.list).toHaveBeenLastCalledWith({
      page: 1,
      limit: 6,
      search: "review",
      course: "Calculus",
      type: "Responsi",
      schedule: "past",
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(mocks.list).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        schedule: "upcoming",
        search: undefined,
        course: undefined,
        type: undefined,
      }),
    );
  });

  it("honors course deep links and cancels without sending a mutation", async () => {
    renderTab("/education?tab=study-clubs&course=Calculus");
    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    expect(screen.getByRole("combobox", { name: "Course" })).toHaveTextContent(
      "Calculus",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("shows API loading/errors without invented fallback rows and retries both queries", () => {
    mocks.list.mockReturnValue({ ...listResult(), isLoading: true });
    const view = renderTab();
    expect(
      screen.getByText("Loading courses and sessions..."),
    ).toBeInTheDocument();
    mocks.list.mockReturnValue({ ...listResult(), isError: true });
    view.rerender(
      <MemoryRouter>
        <StudyClubsTab />
      </MemoryRouter>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load courses or sessions",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mocks.refetch).toHaveBeenCalled();
    expect(mocks.courses.refetch).toHaveBeenCalled();
  });

  it("derives schedule status and round-trips WIB across date boundaries", () => {
    expect(sessionStatus(session, Date.parse(session.startsAt) - 1)).toBe(
      "Upcoming",
    );
    expect(sessionStatus(session, Date.parse(session.startsAt))).toBe(
      "Ongoing",
    );
    expect(sessionStatus(session, Date.parse(session.endsAt))).toBe("Past");
    expect(toWibInput("2099-11-03T18:00:00Z")).toBe("2099-11-04T01:00");
  });
});
