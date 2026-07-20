import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseProvider, useCourse } from "@/context/CourseContext";

const fetchMock = vi.fn();

function CourseConsumer() {
  const { courses, total, loadAdminCourses, createCourse, deleteCourse } =
    useCourse();

  return (
    <div>
      <p data-testid="total">{total}</p>
      <p data-testid="titles">{courses.map((course) => course.title).join("|")}</p>
      <button type="button" onClick={() => void loadAdminCourses()}>
        load admin
      </button>
      <button
        type="button"
        onClick={() =>
          void createCourse({
            title: "Nuevo",
            category: "RCP",
            lessons: [{ title: "Video", href: "https://example.com" }],
          }).catch(() => {})
        }
      >
        create
      </button>
      <button type="button" onClick={() => void deleteCourse(1).catch(() => {})}>
        delete
      </button>
    </div>
  );
}

function renderCourseProvider() {
  return render(
    <CourseProvider>
      <CourseConsumer />
    </CourseProvider>,
  );
}

describe("CourseContext admin cache integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  it("loads admin courses from the uncached administrative endpoint", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 2,
        courses: [
          { id: 1, title: "Curso 1", lessons: [] },
          { id: 2, title: "Curso 2", lessons: [] },
        ],
      }),
    });

    renderCourseProvider();
    fireEvent.click(screen.getByText("load admin"));

    await waitFor(() => {
      expect(screen.getByTestId("total")).toHaveTextContent("2");
      expect(screen.getByTestId("titles")).toHaveTextContent(
        "Curso 1|Curso 2",
      );
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/courses/get-all", {
      cache: "no-store",
    });
  });

  it("does not change local course state when a mutation fails", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          courses: [{ id: 1, title: "Original", lessons: [] }],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "No autorizado" }),
      });

    renderCourseProvider();
    fireEvent.click(screen.getByText("load admin"));

    await screen.findByText("Original");
    fireEvent.click(screen.getByText("delete"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("titles")).toHaveTextContent("Original");
      expect(screen.getByTestId("total")).toHaveTextContent("1");
    });
  });

  it("prepends newly created courses after a successful mutation", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          courses: [{ id: 1, title: "Original", lessons: [] }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, title: "Nuevo", lessons: [] }),
      });

    renderCourseProvider();
    fireEvent.click(screen.getByText("load admin"));

    await screen.findByText("Original");
    fireEvent.click(screen.getByText("create"));

    await waitFor(() => {
      expect(screen.getByTestId("titles")).toHaveTextContent("Nuevo|Original");
      expect(screen.getByTestId("total")).toHaveTextContent("2");
    });
  });
});
