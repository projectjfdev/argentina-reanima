import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  course: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
}));

const cacheLifeMock = vi.hoisted(() => vi.fn());
const cacheTagMock = vi.hoisted(() => vi.fn());

vi.mock("@/libs/db", () => ({
  prisma: prismaMock,
}));

vi.mock("next/cache", () => ({
  cacheLife: cacheLifeMock,
  cacheTag: cacheTagMock,
}));

import {
  getPublicCourseById,
  getPublicCourses,
  normalizePublicCourseId,
  normalizePublicCoursesQuery,
} from "@/libs/courses/publicCourseQueries";

describe("public course queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes list arguments before using them as cache inputs", () => {
    expect(
      normalizePublicCoursesQuery({
        category: "  RCP  ",
        search: "  DEA  ",
        page: "3",
        pageSize: "999",
      }),
    ).toEqual({
      category: "RCP",
      search: "DEA",
      page: 3,
      pageSize: 24,
    });

    expect(
      normalizePublicCoursesQuery({
        page: "-1",
        pageSize: "invalid",
      }),
    ).toEqual({
      category: "",
      search: "",
      page: 1,
      pageSize: 6,
    });
  });

  it("normalizes course ids", () => {
    expect(normalizePublicCourseId("12")).toBe(12);
    expect(normalizePublicCourseId("-1")).toBe(0);
    expect(normalizePublicCourseId("invalid")).toBe(0);
  });

  it("caches and serializes public course lists", async () => {
    const createdAt = new Date("2026-07-01T10:00:00.000Z");
    const updatedAt = new Date("2026-07-02T10:00:00.000Z");

    prismaMock.course.findMany.mockResolvedValue([
      {
        id: 1,
        title: "RCP inicial",
        category: "RCP",
        createdAt,
        updatedAt,
        lessons: [
          {
            id: 10,
            title: "Introduccion",
            href: "https://example.com/video",
            courseId: 1,
          },
        ],
      },
    ]);
    prismaMock.course.count.mockResolvedValue(9);

    const result = await getPublicCourses({
      category: " RCP ",
      search: " inicial ",
      page: "2",
    });

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 300,
      revalidate: 1800,
      expire: 7200,
    });
    expect(cacheTagMock).toHaveBeenCalledWith("courses:list");
    expect(prismaMock.course.findMany).toHaveBeenCalledWith({
      where: {
        category: "RCP",
        OR: [
          {
            title: {
              contains: "inicial",
              mode: "insensitive",
            },
          },
        ],
      },
      skip: 6,
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lessons: true,
      },
    });
    expect(prismaMock.course.count).toHaveBeenCalledWith({
      where: {
        category: "RCP",
        OR: [
          {
            title: {
              contains: "inicial",
              mode: "insensitive",
            },
          },
        ],
      },
    });
    expect(result).toEqual({
      courses: [
        {
          id: 1,
          title: "RCP inicial",
          category: "RCP",
          createdAt: "2026-07-01T10:00:00.000Z",
          updatedAt: "2026-07-02T10:00:00.000Z",
          lessons: [
            {
              id: 10,
              title: "Introduccion",
              href: "https://example.com/video",
              courseId: 1,
            },
          ],
        },
      ],
      totalCourses: 9,
    });
  });

  it("caches and serializes public course details", async () => {
    prismaMock.course.findUnique.mockResolvedValue({
      id: 2,
      title: "DEA",
      category: "Capacitacion",
      createdAt: new Date("2026-07-03T10:00:00.000Z"),
      updatedAt: new Date("2026-07-04T10:00:00.000Z"),
      lessons: [],
    });

    const course = await getPublicCourseById("2");

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 300,
      revalidate: 1800,
      expire: 86400,
    });
    expect(cacheTagMock).toHaveBeenCalledWith("courses:detail:2");
    expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      include: { lessons: true },
    });
    expect(course).toEqual({
      id: 2,
      title: "DEA",
      category: "Capacitacion",
      createdAt: "2026-07-03T10:00:00.000Z",
      updatedAt: "2026-07-04T10:00:00.000Z",
      lessons: [],
    });
  });

  it("returns null for missing public course details", async () => {
    prismaMock.course.findUnique.mockResolvedValue(null);

    await expect(getPublicCourseById("99")).resolves.toBeNull();
  });
});
