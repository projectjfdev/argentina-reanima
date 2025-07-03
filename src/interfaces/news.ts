import { News } from "@/generated/prisma";

export type ICreateNews = Omit<News, "id" | "createdAt" | "updatedAt">;

export interface ICreateNewsBase64 {
  title: string;
  imageBase64: string;
  description: string;
  redirect: string;
  category: string;
  dateNew?: Date;
}

export type IUpdateNote = Partial<ICreateNewsBase64>;
