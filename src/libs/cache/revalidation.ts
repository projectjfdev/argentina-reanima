import { cacheTags } from "@/libs/cache/cacheTags";
import { revalidatePath, revalidateTag } from "next/cache";

export function invalidateNews(newsId?: number) {
  revalidateTag(cacheTags.news.list, "max");
  revalidateTag(cacheTags.news.latest, "max");

  if (newsId) {
    revalidateTag(cacheTags.news.detail(newsId), "max");
  }
}

export function revalidateNewsViews(newsId?: number) {
  invalidateNews(newsId);

  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/api/news");
  revalidatePath("/api/news/lastThreeNews");

  if (newsId) {
    revalidatePath(`/api/news/${newsId}`);
  }
}

export function invalidateCourse(courseId?: number) {
  revalidateTag(cacheTags.courses.list, "max");

  if (courseId) {
    revalidateTag(cacheTags.courses.detail(courseId), "max");
  }
}

export function revalidateCourseViews(courseId?: number) {
  invalidateCourse(courseId);

  revalidatePath("/capacitaciones");
  revalidatePath("/api/courses");

  if (courseId) {
    revalidatePath(`/capacitaciones/${courseId}`);
    revalidatePath(`/api/courses/${courseId}`);
  }
}

export function revalidateDonationCampaignViews(campaignId?: number) {
  revalidatePath("/quiero-ser-parte");
  revalidatePath("/campanas-dea");
  revalidatePath("/api/donation-campaigns");
  revalidatePath("/api/donation-campaigns/current");

  if (campaignId) {
    revalidatePath(`/api/donation-campaigns/${campaignId}/donors`);
  }
}
