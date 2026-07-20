"use client";

import { ICreateNewsBase64, IUpdateNote } from "@/interfaces/news";
import { createContext, useState, useContext, useCallback } from "react";
import { News } from "@/generated/prisma";

function assertOkResponse(res: Response, data: any) {
  if (res.ok) return;

  throw new Error(data?.error || data?.message || "Error en la solicitud");
}

export const NewsContext = createContext<{
  news: News[];
  loadNews: (category: string, search: string, page: number) => Promise<void>;
  loadAdminNews: (page: number) => Promise<void>;
  createNews: (singleNew: ICreateNewsBase64) => Promise<void>;
  deleteNews: (id: number) => Promise<void>;
  selectedNews: News | null;
  total: number;
  setSelectedNews: (singleNew: News | null) => void;
  updateNews: (id: number, singleNews: IUpdateNote) => Promise<void>;
}>({
  news: [],
  loadNews: async (category: string, search: string, page: number) => {},
  loadAdminNews: async (page: number) => {},
  createNews: async (singleNew: ICreateNewsBase64) => {},
  deleteNews: async (id: number) => {},
  selectedNews: null,
  total: 0,
  setSelectedNews: (singleNew: News | null) => {},
  updateNews: async (id: number, singleNews: IUpdateNote) => {},
});

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews debe ser usado dentro de un NewsProvider");
  }
  return context;
};

export const NewsProvider = ({ children }: { children: React.ReactNode }) => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [total, setTotal] = useState<number>(0);
  const adminPageSize = 6;

  const loadNews = useCallback(
    async (category: string, search: string, page: number) => {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (page) params.append("page", page.toString());

      const url = `/api/news?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      assertOkResponse(res, data);
      setTotal(data.totalNews);
      setNews(data.news);
    },
    []
  );

  const loadAdminNews = useCallback(async (page: number) => {
    const res = await fetch("/api/news/get-all", { cache: "no-store" });
    const data = await res.json();
    assertOkResponse(res, data);

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const start = (safePage - 1) * adminPageSize;

    setTotal(data.total);
    setNews(data.news.slice(start, start + adminPageSize));
  }, []);

  async function createNews(singleNews: ICreateNewsBase64) {
    const res = await fetch("/api/news", {
      method: "POST",
      body: JSON.stringify(singleNews),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const newNews = await res.json();
    assertOkResponse(res, newNews);
    setNews((currentNews) => [newNews.news, ...currentNews]);
    setTotal((currentTotal) => currentTotal + 1);
  }

  async function deleteNews(id: number) {
    // si esto es backend le colocamos la ruta completa
    const res = await fetch(`/api/news/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    assertOkResponse(res, data);
    setNews((currentNews) => currentNews.filter((n) => n.id !== id));
    setSelectedNews((currentSelectedNews) =>
      currentSelectedNews?.id === id ? null : currentSelectedNews
    );
    setTotal((currentTotal) => Math.max(0, currentTotal - 1));
  }

  async function updateNews(id: number, singleNews: IUpdateNote) {
    const res = await fetch(`/api/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(singleNews),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const editedNews = await res.json();
    assertOkResponse(res, editedNews);
    setNews((currentNews) =>
      currentNews.map((singleNews) =>
        singleNews.id === id ? editedNews.updatedNews : singleNews
      )
    );
    setSelectedNews((currentSelectedNews) =>
      currentSelectedNews?.id === id ? editedNews.updatedNews : currentSelectedNews
    );
  }

  return (
    <NewsContext.Provider
      value={{
        news,
        loadNews,
        loadAdminNews,
        createNews,
        deleteNews,
        selectedNews,
        total,
        setSelectedNews,
        updateNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};
