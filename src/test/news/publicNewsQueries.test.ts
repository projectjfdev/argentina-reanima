import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  news: {
    findMany: vi.fn(),
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
  getLatestPublicNews,
  getPublicNews,
  normalizeLatestNewsLimit,
  normalizePublicNewsQuery,
} from "@/libs/news/publicNewsQueries";

describe("public news queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes list arguments before using them as cache inputs", () => {
    expect(
      normalizePublicNewsQuery({
        category: "  Cursos  ",
        search: "  RCP  ",
        page: "2",
        pageSize: "999",
      }),
    ).toEqual({
      category: "Cursos",
      search: "RCP",
      page: 2,
      pageSize: 24,
    });

    expect(
      normalizePublicNewsQuery({
        page: "-10",
        pageSize: "invalid",
      }),
    ).toEqual({
      category: "",
      search: "",
      page: 1,
      pageSize: 6,
    });
  });

  it("normalizes latest news limits", () => {
    expect(normalizeLatestNewsLimit("4")).toBe(4);
    expect(normalizeLatestNewsLimit("100")).toBe(6);
    expect(normalizeLatestNewsLimit("invalid")).toBe(3);
  });

  it("caches and serializes public news lists", async () => {
    const createdAt = new Date("2026-07-01T10:00:00.000Z");
    const updatedAt = new Date("2026-07-02T10:00:00.000Z");
    const dateNew = new Date("2026-07-03T10:00:00.000Z");

    prismaMock.news.findMany.mockResolvedValue([
      {
        id: 1,
        title: "RCP",
        imageUrl: null,
        imagePublicId: null,
        description: "Descripcion",
        redirect: "https://example.com",
        category: "Cursos",
        dateNew,
        createdAt,
        updatedAt,
      },
    ]);
    prismaMock.news.count.mockResolvedValue(7);

    const result = await getPublicNews({
      category: " Cursos ",
      search: " RCP ",
      page: "2",
    });

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 300,
      revalidate: 900,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledWith("news:list");
    expect(prismaMock.news.findMany).toHaveBeenCalledWith({
      where: {
        category: "Cursos",
        OR: [
          {
            title: {
              contains: "RCP",
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: "RCP",
              mode: "insensitive",
            },
          },
        ],
      },
      skip: 6,
      take: 6,
      orderBy: {
        dateNew: "desc",
      },
    });
    expect(prismaMock.news.count).toHaveBeenCalledWith({
      where: {
        category: "Cursos",
        OR: [
          {
            title: {
              contains: "RCP",
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: "RCP",
              mode: "insensitive",
            },
          },
        ],
      },
    });
    expect(result).toEqual({
      news: [
        {
          id: 1,
          title: "RCP",
          imageUrl: null,
          imagePublicId: null,
          description: "Descripcion",
          redirect: "https://example.com",
          category: "Cursos",
          dateNew: "2026-07-03T10:00:00.000Z",
          createdAt: "2026-07-01T10:00:00.000Z",
          updatedAt: "2026-07-02T10:00:00.000Z",
        },
      ],
      totalNews: 7,
      currentPage: 2,
    });
  });

  it("caches and serializes latest public news", async () => {
    prismaMock.news.findMany.mockResolvedValue([
      {
        id: 2,
        title: "Ultima",
        imageUrl: "https://example.com/image.jpg",
        imagePublicId: "image-id",
        description: "Descripcion",
        redirect: "https://example.com",
        category: "Novedades",
        dateNew: null,
        createdAt: new Date("2026-07-01T10:00:00.000Z"),
        updatedAt: new Date("2026-07-02T10:00:00.000Z"),
      },
    ]);

    const news = await getLatestPublicNews("9");

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 300,
      revalidate: 300,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledWith("news:latest");
    expect(prismaMock.news.findMany).toHaveBeenCalledWith({
      orderBy: {
        dateNew: "desc",
      },
      take: 6,
    });
    expect(news[0].createdAt).toBe("2026-07-01T10:00:00.000Z");
    expect(news[0].updatedAt).toBe("2026-07-02T10:00:00.000Z");
    expect(news[0].dateNew).toBeNull();
  });
});
