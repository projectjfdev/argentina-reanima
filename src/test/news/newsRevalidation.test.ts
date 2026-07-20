import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}));

import {
  invalidateNews,
  revalidateNewsViews,
} from "@/libs/cache/revalidation";

describe("news cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates tagged public news cache", () => {
    invalidateNews(12);

    expect(revalidateTagMock).toHaveBeenCalledWith("news:list", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("news:latest", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("news:detail:12", "max");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("keeps existing path revalidation for public shells and API compatibility", () => {
    revalidateNewsViews(12);

    expect(revalidateTagMock).toHaveBeenCalledWith("news:list", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("news:latest", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("news:detail:12", "max");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/noticias");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/news");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/news/lastThreeNews");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/news/12");
  });
});
