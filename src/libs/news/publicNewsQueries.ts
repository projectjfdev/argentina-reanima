import { Prisma } from "@/generated/prisma";
import { cacheTags } from "@/libs/cache/cacheTags";
import { prisma } from "@/libs/db";
import { cacheLife, cacheTag } from "next/cache";

const DEFAULT_NEWS_PAGE_SIZE = 6;
const DEFAULT_LATEST_NEWS_LIMIT = 3;
const MAX_NEWS_PAGE_SIZE = 24;
const MAX_LATEST_NEWS_LIMIT = 6;

type NewsRecord = {
  id: number;
  title: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  description: string;
  redirect: string;
  category: string;
  dateNew: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicNewsItem = Omit<
  NewsRecord,
  "dateNew" | "createdAt" | "updatedAt"
> & {
  dateNew: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicNewsQueryInput = {
  category?: string | null;
  search?: string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
};

export type PublicNewsQuery = {
  category: string;
  search: string;
  page: number;
  pageSize: number;
};

export type PublicNewsResult = {
  news: PublicNewsItem[];
  totalNews: number;
  currentPage: number;
};

function normalizeTextFilter(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizePositiveInteger(
  value: number | string | null | undefined,
  fallback: number,
  max: number,
) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return fallback;
  }

  return Math.min(numericValue, max);
}

export function normalizePublicNewsQuery(
  input: PublicNewsQueryInput = {},
): PublicNewsQuery {
  return {
    category: normalizeTextFilter(input.category),
    search: normalizeTextFilter(input.search),
    page: normalizePositiveInteger(input.page, 1, Number.MAX_SAFE_INTEGER),
    pageSize: normalizePositiveInteger(
      input.pageSize,
      DEFAULT_NEWS_PAGE_SIZE,
      MAX_NEWS_PAGE_SIZE,
    ),
  };
}

export function normalizeLatestNewsLimit(limit?: number | string | null) {
  return normalizePositiveInteger(
    limit,
    DEFAULT_LATEST_NEWS_LIMIT,
    MAX_LATEST_NEWS_LIMIT,
  );
}

function serializeNews(news: NewsRecord): PublicNewsItem {
  return {
    ...news,
    dateNew: news.dateNew?.toISOString() ?? null,
    createdAt: news.createdAt.toISOString(),
    updatedAt: news.updatedAt.toISOString(),
  };
}

function buildPublicNewsWhere({
  category,
  search,
}: Pick<PublicNewsQuery, "category" | "search">): Prisma.NewsWhereInput {
  return {
    ...(category && { category }),
    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    }),
  };
}

async function getCachedPublicNews(
  query: PublicNewsQuery,
): Promise<PublicNewsResult> {
  "use cache";

  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });
  cacheTag(cacheTags.news.list);

  const where = buildPublicNewsWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [news, totalNews] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: {
        dateNew: "desc",
      },
    }),
    prisma.news.count({
      where,
    }),
  ]);

  return {
    news: news.map(serializeNews),
    totalNews,
    currentPage: query.page,
  };
}

async function getCachedLatestPublicNews(
  limit: number,
): Promise<PublicNewsItem[]> {
  "use cache";

  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  cacheTag(cacheTags.news.latest);

  const news = await prisma.news.findMany({
    orderBy: {
      dateNew: "desc",
    },
    take: limit,
  });

  return news.map(serializeNews);
}

export function getPublicNews(input: PublicNewsQueryInput = {}) {
  return getCachedPublicNews(normalizePublicNewsQuery(input));
}

export function getLatestPublicNews(limit?: number | string | null) {
  return getCachedLatestPublicNews(normalizeLatestNewsLimit(limit));
}
