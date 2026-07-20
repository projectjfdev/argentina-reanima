import { Prisma } from "@/generated/prisma";
import { cacheTags } from "@/libs/cache/cacheTags";
import { prisma } from "@/libs/db";
import { cacheLife, cacheTag } from "next/cache";

const DEFAULT_COURSES_PAGE_SIZE = 6;
const MAX_COURSES_PAGE_SIZE = 24;

type LessonRecord = {
  id: number;
  title: string;
  href: string;
  courseId: number;
};

type CourseRecord = {
  id: number;
  title: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  lessons: LessonRecord[];
};

export type PublicLesson = LessonRecord;

export type PublicCourse = Omit<CourseRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type PublicCoursesQueryInput = {
  category?: string | null;
  search?: string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
};

export type PublicCoursesQuery = {
  category: string;
  search: string;
  page: number;
  pageSize: number;
};

export type PublicCoursesResult = {
  courses: PublicCourse[];
  totalCourses: number;
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

export function normalizePublicCoursesQuery(
  input: PublicCoursesQueryInput = {},
): PublicCoursesQuery {
  return {
    category: normalizeTextFilter(input.category),
    search: normalizeTextFilter(input.search),
    page: normalizePositiveInteger(input.page, 1, Number.MAX_SAFE_INTEGER),
    pageSize: normalizePositiveInteger(
      input.pageSize,
      DEFAULT_COURSES_PAGE_SIZE,
      MAX_COURSES_PAGE_SIZE,
    ),
  };
}

export function normalizePublicCourseId(id: number | string | null | undefined) {
  return normalizePositiveInteger(id, 0, Number.MAX_SAFE_INTEGER);
}

function serializeCourse(course: CourseRecord): PublicCourse {
  return {
    ...course,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

function buildPublicCoursesWhere({
  category,
  search,
}: Pick<PublicCoursesQuery, "category" | "search">): Prisma.CourseWhereInput {
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
      ],
    }),
  };
}

async function getCachedPublicCourses(
  query: PublicCoursesQuery,
): Promise<PublicCoursesResult> {
  "use cache";

  cacheLife({ stale: 300, revalidate: 1800, expire: 7200 });
  cacheTag(cacheTags.courses.list);

  const where = buildPublicCoursesWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [courses, totalCourses] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lessons: true,
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses: courses.map(serializeCourse),
    totalCourses,
  };
}

async function getCachedPublicCourseById(id: number) {
  "use cache";

  cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  cacheTag(cacheTags.courses.detail(id));

  const course = await prisma.course.findUnique({
    where: { id },
    include: { lessons: true },
  });

  return course ? serializeCourse(course) : null;
}

export function getPublicCourses(input: PublicCoursesQueryInput = {}) {
  return getCachedPublicCourses(normalizePublicCoursesQuery(input));
}

export function getPublicCourseById(id: number | string | null | undefined) {
  return getCachedPublicCourseById(normalizePublicCourseId(id));
}
