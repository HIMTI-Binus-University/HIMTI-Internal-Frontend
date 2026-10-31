import { CirclePlay, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  useCreateEducationVideo,
  useDeleteEducationVideo,
  useGetCourseGroups,
  useGetEducationSessions,
  useGetEducationVideos,
  useUpdateEducationVideo,
} from "@/api/education/queries";
import { ConfirmAction } from "@/components/events/ConfirmAction";
import { backendMessage, useNotification } from "@/components/notification";
import { Container } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { EducationVideo, EducationVideoStatus } from "@/types/education";
import { getYouTubeVideoId } from "./youtube";

const PAGE_SIZE = 10;
const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const VideosTab = () => {
  const notify = useNotification();
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState<"" | EducationVideoStatus>("");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<EducationVideo | null>(null);
  const [title, setTitle] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formError, setFormError] = useState("");
  const videos = useGetEducationVideos({
    search: search.trim() || undefined,
    courseId: courseId || undefined,
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const courses = useGetCourseGroups();
  const sessions = useGetEducationSessions(sheetOpen);
  const createVideo = useCreateEducationVideo();
  const updateVideo = useUpdateEducationVideo();
  const deleteVideo = useDeleteEducationVideo();
  const isSaving = createVideo.isPending || updateVideo.isPending;
  const videoId = getYouTubeVideoId(youtubeUrl);
  const totalPages = Math.max(1, videos.data?.pagination.totalPages ?? 1);
  const total = videos.data?.pagination.total ?? 0;

  useEffect(() => {
    const pagination = videos.data?.pagination;
    if (pagination?.page === page && page > Math.max(1, pagination.totalPages)) {
      setPage(Math.max(1, pagination.totalPages));
    }
  }, [page, videos.data?.pagination]);

  const openEditor = (video: EducationVideo | null) => {
    setEditing(video);
    setTitle(video?.title ?? "");
    setSessionId(video?.sessionId ?? "");
    setYoutubeUrl(video?.youtubeUrl ?? "");
    setFormError("");
    setSheetOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !sessionId || !videoId) {
      setFormError("Enter a title, select a session, and provide a valid YouTube video URL.");
      return;
    }
    if (!sessions.data?.some((session) => session.id === sessionId)) {
      setFormError("The selected session is unavailable. Refresh the session list and try again.");
      return;
    }
    setFormError("");
    try {
      const payload = { title: title.trim(), sessionId, youtubeUrl: youtubeUrl.trim() };
      if (editing) await updateVideo.mutateAsync({ id: editing.id, ...payload });
      else await createVideo.mutateAsync(payload);
      notify(editing ? "Video updated." : "Video added as a draft.", "success");
      setSheetOpen(false);
    } catch (cause) {
      setFormError(backendMessage(cause, "Could not save this video. Please try again."));
    }
  };

  const changeStatus = async (video: EducationVideo) => {
    try {
      await updateVideo.mutateAsync({
        id: video.id,
        status: video.status === "DRAFT" ? "PUBLISHED" : "DRAFT",
      });
      notify(video.status === "DRAFT" ? "Video published." : "Video returned to draft.", "success");
    } catch (cause) {
      notify(backendMessage(cause, "Could not change video status. Please try again."), "error");
    }
  };

  return (
    <Container className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Videos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage YouTube recordings for Study Club and Responsi sessions.
          </p>
        </div>
        <Button type="button" onClick={() => openEditor(null)}><Plus aria-hidden="true" /> Add video</Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_minmax(9rem,12rem)]">
        <div className="relative">
          <Label htmlFor="video-search" className="sr-only">Search videos</Label>
          <Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input id="video-search" className="pl-9" placeholder="Search video titles..." value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <div>
          <Label htmlFor="video-course-filter" className="sr-only">Filter videos by course</Label>
          <select id="video-course-filter" className={selectClass} value={courseId}
            onChange={(event) => { setCourseId(event.target.value); setPage(1); }}>
            <option value="">All courses</option>
            {(courses.data ?? []).map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
          {courses.isError && <p className="mt-1 text-xs text-destructive">Courses unavailable. <button type="button" className="underline" onClick={() => void courses.refetch()}>Retry</button></p>}
        </div>
        <div>
          <Label htmlFor="video-status-filter" className="sr-only">Filter videos by status</Label>
          <select id="video-status-filter" className={selectClass} value={status}
            onChange={(event) => { setStatus(event.target.value as "" | EducationVideoStatus); setPage(1); }}>
            <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Education video recordings</caption>
          <thead className="bg-muted/50 text-xs text-muted-foreground"><tr>
            <th scope="col" className="px-4 py-3 font-medium">Video</th>
            <th scope="col" className="px-4 py-3 font-medium">Session</th>
            <th scope="col" className="px-4 py-3 font-medium">Course</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {videos.isLoading && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground" role="status">Loading videos...</td></tr>}
            {videos.isError && <tr><td colSpan={5} className="px-4 py-10 text-center text-destructive" role="alert">Could not load videos. <button type="button" className="underline" onClick={() => void videos.refetch()}>Retry</button></td></tr>}
            {!videos.isLoading && !videos.isError && videos.data?.data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No videos found. Add a video or adjust the filters.</td></tr>}
            {!videos.isError && videos.data?.data.map((video) => {
              const safeId = /^[A-Za-z0-9_-]{11}$/.test(video.youtubeVideoId) ? video.youtubeVideoId : null;
              return <tr key={video.id}>
                <td className="px-4 py-3"><div className="flex items-center gap-3">
                  {safeId ? <img src={`https://i.ytimg.com/vi/${safeId}/default.jpg`} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-12 w-20 shrink-0 rounded-md bg-muted object-cover" /> : <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-muted"><CirclePlay aria-hidden="true" className="size-5" /></span>}
                  <span className="font-semibold text-foreground">{video.title}</span>
                </div></td>
                <td className="px-4 py-3"><span className="block">{video.session.title}</span><span className="text-xs text-muted-foreground">{video.session.type === "STUDY_CLUB" ? "Study Club" : "Responsi"}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{video.session.course.name}</td>
                <td className="px-4 py-3"><span className={video.status === "PUBLISHED" ? "rounded-md bg-semantic-success-background px-2 py-1 text-xs font-medium text-semantic-success" : "rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"}>{video.status === "PUBLISHED" ? "Published" : "Draft"}</span></td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEditor(video)} aria-label={`Edit ${video.title}`}><Pencil aria-hidden="true" /> Edit</Button>
                  <Button type="button" size="sm" variant="outline" disabled={updateVideo.isPending} onClick={() => void changeStatus(video)} aria-label={`${video.status === "DRAFT" ? "Publish" : "Unpublish"} ${video.title}`}>{video.status === "DRAFT" ? "Publish" : "Unpublish"}</Button>
                  <ConfirmAction label="Delete video" description={`Delete “${video.title}”? This removes the video record, not the YouTube upload.`} onConfirm={() => deleteVideo.mutateAsync(video.id)} successMessage="Video deleted.">
                    <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${video.title}`}><Trash2 aria-hidden="true" /></Button>
                  </ConfirmAction>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {!videos.isLoading && !videos.isError && total > 0 && <nav aria-label="Video pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{total} {total === 1 ? "video" : "videos"} · Page {page} of {totalPages}</span>
        <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
      </nav>}

      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!isSaving) setSheetOpen(open); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>{editing ? "Edit video" : "Add video"}</SheetTitle><SheetDescription>Connect a YouTube recording to an Education session. New videos start as drafts.</SheetDescription></SheetHeader>
          <form onSubmit={(event) => void save(event)} className="mt-6 space-y-5">
            <div className="space-y-2"><Label htmlFor="video-title">Title</Label><Input id="video-title" value={title} maxLength={255} onChange={(event) => setTitle(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="video-session">Session</Label>
              <select id="video-session" className={selectClass} value={sessionId} onChange={(event) => setSessionId(event.target.value)} required disabled={sessions.isLoading || sessions.isError}>
                <option value="">Select a session</option>
                {(sessions.data ?? []).map((session) => <option key={session.id} value={session.id}>{session.title} — {session.type === "STUDY_CLUB" ? "Study Club" : "Responsi"} — {session.course.name}</option>)}
              </select>
              {sessions.isLoading && <p role="status" className="text-sm text-muted-foreground">Loading sessions...</p>}
              {sessions.isError && <p role="alert" className="text-sm text-destructive">Could not load sessions. <button type="button" className="underline" onClick={() => void sessions.refetch()}>Retry</button></p>}
              {!sessions.isLoading && !sessions.isError && sessions.data?.length === 0 && <p className="text-sm text-muted-foreground">No Education sessions are available. Create a session first, then add its recording.</p>}
              <p className="text-xs text-muted-foreground">The course is taken from the selected session.</p>
            </div>
            <div className="space-y-2"><Label htmlFor="video-url">YouTube video URL</Label><Input id="video-url" type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." required aria-describedby="video-url-help" /><p id="video-url-help" className="text-xs text-muted-foreground">Use a YouTube video link. Playlists and other sites are not supported.</p></div>
            {youtubeUrl.trim() && !videoId && <p className="text-sm text-destructive" role="alert">Enter a valid YouTube video URL.</p>}
            {videoId && <div className="space-y-2"><p className="text-sm font-medium text-foreground">Preview</p><iframe title="YouTube video preview" src={`https://www.youtube-nocookie.com/embed/${videoId}`} className="aspect-video w-full rounded-lg border border-border" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={isSaving} onClick={() => setSheetOpen(false)}>Cancel</Button><Button type="submit" disabled={isSaving || sessions.isLoading || sessions.isError || !sessions.data?.length}>{isSaving ? "Saving..." : editing ? "Save changes" : "Add draft"}</Button></div>
          </form>
        </SheetContent>
      </Sheet>
    </Container>
  );
};

export default VideosTab;
