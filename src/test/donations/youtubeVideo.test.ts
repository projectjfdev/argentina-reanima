import {
  getCanonicalYouTubeVideoUrl,
  isValidYouTubeUrl,
  validateOptionalYouTubeUrl,
} from "@/libs/donations";
import { describe, expect, it } from "vitest";

describe("youtube video URL validation", () => {
  it.each([
    "https://www.youtube.com/watch?v=AlHi-wLbz1M",
    "https://youtu.be/AlHi-wLbz1M",
    "https://www.youtube.com/shorts/GQo_ylWwC2c",
    "https://www.youtube.com/embed/AlHi-wLbz1M",
    "https://www.youtube.com/live/32x3rVsXgkI",
    "https://www.youtube-nocookie.com/embed/AlHi-wLbz1M",
  ])("accepts %s", (url) => {
    expect(isValidYouTubeUrl(url)).toBe(true);
  });

  it.each([
    "",
    "nota-url",
    "https://example.com/watch?v=AlHi-wLbz1M",
    "https://www.youtube.com/channel/UCUe7YAlQawPP9VHg_1B172w",
    "https://www.youtube.com/watch",
    "ftp://www.youtube.com/watch?v=AlHi-wLbz1M",
  ])("rejects %s", (url) => {
    expect(isValidYouTubeUrl(url)).toBe(false);
  });

  it("normalizes empty optional values to null", () => {
    expect(validateOptionalYouTubeUrl("   ")).toEqual({
      success: true,
      data: null,
    });
  });

  it("strips playlist parameters from watch URLs", () => {
    const url = "https://www.youtube.com/watch?v=htgr3pvBr-I&list=RDaGCdLKXNF3w";

    expect(getCanonicalYouTubeVideoUrl(url)).toBe(
      "https://www.youtube.com/watch?v=htgr3pvBr-I",
    );
    expect(validateOptionalYouTubeUrl(url)).toEqual({
      success: true,
      data: "https://www.youtube.com/watch?v=htgr3pvBr-I",
    });
  });
});
