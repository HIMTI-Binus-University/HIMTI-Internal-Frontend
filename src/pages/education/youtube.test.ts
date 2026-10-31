import { describe, expect, it } from "vitest";
import { getYouTubeVideoId } from "./youtube";

describe("getYouTubeVideoId", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=20",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtu.be/dQw4w9WgXcQ",
    "https://music.youtube.com/watch?v=dQw4w9WgXcQ",
    "http://m.youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/embed/dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ/",
    "https://youtube.com/embed/dQw4w9WgXcQ/",
    "https://youtube.com/shorts/dQw4w9WgXcQ/",
  ])("extracts the video ID from %s", (url) => {
    expect(getYouTubeVideoId(url)).toBe("dQw4w9WgXcQ");
  });

  it.each([
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    "https://user@youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com:444/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&v=abcdefghijk",
    "https://youtube.com/playlist?list=abcdefghijk",
    "https://youtu.be/too-short",
    "https://youtu.be/dQw4w9WgXcQ/extra",
    "javascript:alert(1)",
  ])("rejects unsafe or invalid URL %s", (url) => {
    expect(getYouTubeVideoId(url)).toBeNull();
  });
});
