import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewsProvider, useNews } from "@/context/NewsContext";

const fetchMock = vi.fn();

function NewsConsumer() {
  const { news, total, loadAdminNews, createNews, deleteNews, updateNews } =
    useNews();

  return (
    <div>
      <p data-testid="total">{total}</p>
      <p data-testid="titles">{news.map((n) => n.title).join("|")}</p>
      <button type="button" onClick={() => void loadAdminNews(1)}>
        load admin
      </button>
      <button type="button" onClick={() => void loadAdminNews(2)}>
        load admin page 2
      </button>
      <button
        type="button"
        onClick={() =>
          void createNews({
            title: "Nueva",
            description: "Descripcion",
            redirect: "https://example.com",
            category: "Medios",
            imageBase64: "data:image/png;base64,abc",
          }).catch(() => {})
        }
      >
        create
      </button>
      <button type="button" onClick={() => void deleteNews(1).catch(() => {})}>
        delete
      </button>
      <button
        type="button"
        onClick={() =>
          void updateNews(1, { title: "Editada" }).catch(() => {})
        }
      >
        update
      </button>
    </div>
  );
}

function renderNewsProvider() {
  return render(
    <NewsProvider>
      <NewsConsumer />
    </NewsProvider>,
  );
}

describe("NewsContext admin cache integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  it("loads admin news from the uncached administrative endpoint", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 7,
        news: Array.from({ length: 7 }, (_, index) => ({
          id: index + 1,
          title: `Noticia ${index + 1}`,
        })),
      }),
    });

    renderNewsProvider();
    fireEvent.click(screen.getByText("load admin page 2"));

    await waitFor(() => {
      expect(screen.getByTestId("total")).toHaveTextContent("7");
      expect(screen.getByTestId("titles")).toHaveTextContent("Noticia 7");
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/news/get-all", {
      cache: "no-store",
    });
  });

  it("does not change local news state when a mutation fails", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          news: [{ id: 1, title: "Original" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "No autorizado" }),
      });

    renderNewsProvider();
    fireEvent.click(screen.getByText("load admin"));

    await screen.findByText("Original");
    fireEvent.click(screen.getByText("delete"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("titles")).toHaveTextContent("Original");
      expect(screen.getByTestId("total")).toHaveTextContent("1");
    });
  });

  it("updates local news state only after a successful mutation", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          news: [{ id: 1, title: "Original" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          updatedNews: { id: 1, title: "Editada" },
        }),
      });

    renderNewsProvider();
    fireEvent.click(screen.getByText("load admin"));

    await screen.findByText("Original");
    fireEvent.click(screen.getByText("update"));

    await waitFor(() => {
      expect(screen.getByTestId("titles")).toHaveTextContent("Editada");
    });
  });
});
