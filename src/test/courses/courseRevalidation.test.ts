import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}));

import {
  invalidateCourse,
  revalidateCourseViews,
} from "@/libs/cache/revalidation";

describe("course cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates tagged public course cache", () => {
    invalidateCourse(4);

    expect(revalidateTagMock).toHaveBeenCalledWith("courses:list", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("courses:detail:4", "max");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("keeps existing path revalidation for public shells and API compatibility", () => {
    revalidateCourseViews(4);

    expect(revalidateTagMock).toHaveBeenCalledWith("courses:list", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("courses:detail:4", "max");
    expect(revalidatePathMock).toHaveBeenCalledWith("/capacitaciones");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/courses");
    expect(revalidatePathMock).toHaveBeenCalledWith("/capacitaciones/4");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/courses/4");
  });
});
