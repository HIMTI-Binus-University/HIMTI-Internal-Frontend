import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VideosTab from "./videos-tab";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  videos: vi.fn(),
  sessions: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/api/education/queries", () => ({
  useGetEducationVideos: mocks.videos,
  useGetEducationSessions: mocks.sessions,
  useGetCourseGroups: () => ({ data: [{ id: "course-1", name: "Calculus" }], isError: false, refetch: mocks.refetch }),
  useCreateEducationVideo: () => ({ mutateAsync: mocks.create, isPending: false }),
  useUpdateEducationVideo: () => ({ mutateAsync: mocks.update, isPending: false }),
  useDeleteEducationVideo: () => ({ mutateAsync: mocks.remove, isPending: false }),
}));

const session = {
  id: "session-1",
  title: "Limits review",
  type: "RESPONSI",
  courseId: "course-1",
  course: { id: "course-1", name: "Calculus" },
  startsAt: null,
};
const video = {
  id: "video-1",
  title: "Limits recording",
  sessionId: "session-1",
  session,
  youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
  youtubeVideoId: "dQw4w9WgXcQ",
  status: "DRAFT",
  createdAt: "2026-10-31T00:00:00.000Z",
  updatedAt: "2026-10-31T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue(video);
  mocks.update.mockResolvedValue(video);
  mocks.remove.mockResolvedValue(undefined);
  mocks.sessions.mockReturnValue({ data: [session], isLoading: false, isError: false, refetch: mocks.refetch });
  mocks.videos.mockReturnValue({ data: { data: [video], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } }, isLoading: false, isError: false, refetch: mocks.refetch });
});

describe("VideosTab", () => {
  it("waits for typing to stop before searching and matches API input limits", async () => {
    render(<VideosTab />);
    const search = screen.getByLabelText("Search videos");
    expect(search).toHaveAttribute("maxLength", "255");
    fireEvent.change(search, { target: { value: "Limi" } });
    fireEvent.change(search, { target: { value: "Limits" } });
    expect(mocks.videos).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined }));
    await waitFor(() => expect(mocks.videos).toHaveBeenLastCalledWith(expect.objectContaining({ search: "Limits" })));
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    expect(screen.getByLabelText("YouTube video URL")).toHaveAttribute("maxLength", "2048");
  });

  it("renders session type, course, status and sends filters to the list", () => {
    render(<VideosTab />);
    expect(screen.getByText("Limits recording")).toBeInTheDocument();
    expect(screen.getByText("Limits review")).toBeInTheDocument();
    expect(screen.getByText("Responsi")).toBeInTheDocument();
    expect(screen.getByText("Draft", { selector: "span" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter videos by course"), { target: { value: "course-1" } });
    fireEvent.change(screen.getByLabelText("Filter videos by status"), { target: { value: "PUBLISHED" } });
    expect(mocks.videos).toHaveBeenLastCalledWith(expect.objectContaining({ courseId: "course-1", status: "PUBLISHED", page: 1 }));
  });

  it("creates a draft tied only to the selected session and safely embeds the YouTube ID", async () => {
    render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "  Limits recording  " } });
    fireEvent.change(screen.getByLabelText("Session"), { target: { value: "session-1" } });
    fireEvent.change(screen.getByLabelText("YouTube video URL"), { target: { value: "https://youtu.be/dQw4w9WgXcQ?t=20" } });
    expect(screen.getByTitle("YouTube video preview")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    fireEvent.click(screen.getByRole("button", { name: "Add draft" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ title: "Limits recording", sessionId: "session-1", youtubeUrl: "https://youtu.be/dQw4w9WgXcQ?t=20" }));
  });

  it("distinguishes sessions by date and identifies missing dates", () => {
    mocks.sessions.mockReturnValue({
      data: [session, { ...session, id: "session-2", startsAt: "2026-10-31T03:00:00.000Z" }],
      isLoading: false, isError: false, refetch: mocks.refetch,
    });
    render(<VideosTab />);
    expect(screen.getByText("Date unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    expect(screen.getByRole("option", { name: /Limits review.*Date unavailable/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Limits review.*31 Oct 2026, 10:00 WIB/ })).toBeInTheDocument();
  });

  it("shows a useful empty-session state and prevents creating a video", () => {
    mocks.sessions.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: mocks.refetch });
    render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    expect(screen.getByText(/No Education sessions are available/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add draft" })).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("offers a retry and prevents saving when sessions cannot be loaded", () => {
    mocks.sessions.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mocks.refetch });
    render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load sessions.");
    expect(screen.getByLabelText("Session")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add draft" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mocks.refetch).toHaveBeenCalled();
  });

  it("keeps the form open when saving fails", async () => {
    mocks.create.mockRejectedValueOnce(new Error("network unavailable"));
    render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: video.title } });
    fireEvent.change(screen.getByLabelText("Session"), { target: { value: session.id } });
    fireEvent.change(screen.getByLabelText("YouTube video URL"), { target: { value: video.youtubeUrl } });
    fireEvent.click(screen.getByRole("button", { name: "Add draft" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save this video.");
    expect(screen.getByLabelText("Title")).toHaveValue(video.title);
    expect(screen.getByLabelText("Session")).toHaveValue(session.id);
  });

  it("does not preview an attacker-controlled URL", () => {
    render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Add video" }));
    fireEvent.change(screen.getByLabelText("YouTube video URL"), { target: { value: "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ" } });
    expect(screen.getByText("Enter a valid YouTube video URL.")).toBeInTheDocument();
    expect(screen.queryByTitle("YouTube video preview")).not.toBeInTheDocument();
  });

  it("publishes a draft and requests confirmation before deletion", async () => {
    render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Publish Limits recording" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ id: "video-1", status: "PUBLISHED" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Limits recording" }));
    expect(mocks.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete video" }));
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith("video-1"));
  });

  it("returns to the previous page when the last video on a page is removed", async () => {
    let removed = false;
    mocks.videos.mockImplementation(({ page }: { page: number }) => ({
      data: { data: page === 2 && removed ? [] : [video], pagination: { page, limit: 10, total: removed ? 10 : 11, totalPages: removed ? 1 : 2 } },
      isLoading: false, isError: false, refetch: mocks.refetch,
    }));
    mocks.remove.mockImplementation(async () => { removed = true; });
    const { rerender } = render(<VideosTab />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Limits recording" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete video" }));
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith("video-1"));
    rerender(<VideosTab />);
    await waitFor(() => expect(mocks.videos).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })));
    expect(screen.getByText("Limits recording")).toBeInTheDocument();
  });

  it("shows list failure without displaying fabricated videos", () => {
    mocks.videos.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mocks.refetch });
    render(<VideosTab />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load videos.");
    expect(screen.queryByText("Limits recording")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mocks.refetch).toHaveBeenCalled();
  });
});
