"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ICourse, ICreateCourse, IUpdateCourse } from "@/interfaces/courses";

export const CourseContext = createContext<{
  courses: ICourse[];
  loadCourses: (
    category: string,
    search: string,
    page: number
  ) => Promise<void>;
  createCourse: (newCourse: ICreateCourse) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  updateCourse: (id: number, updated: IUpdateCourse) => Promise<void>;
  selectedCourse: ICourse | null;
  total: number;
  setSelectedCourse: (c: ICourse | null) => void;
}>({
  courses: [],
  loadCourses: async (category: string, search: string, page: number) => {},
  createCourse: async () => {},
  deleteCourse: async () => {},
  updateCourse: async () => {},
  selectedCourse: null,
  total: 0,
  setSelectedCourse: () => {},
});

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse debe ser usado dentro de un CourseProvider");
  }
  return context;
};

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [total, setTotal] = useState<number>(0);

  const loadCourses = useCallback(
    async (category: string, search: string, page: number) => {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (page) params.append("page", page.toString());

      const res = await fetch(`/api/courses?${params.toString()}`);
      const data = await res.json();
      setCourses(data.courses);
      setTotal(data.totalCourses);
    },
    []
  );

  async function createCourse(newCourse: ICreateCourse) {
    const res = await fetch("/api/courses", {
      method: "POST",
      body: JSON.stringify(newCourse),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setCourses([...courses, data]);
  }

  async function deleteCourse(id: number) {
    const res = await fetch(`/api/courses/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    console.log(data);

    setCourses(courses.filter((c) => c.id !== id));
  }

  async function updateCourse(id: number, updatedCourse: IUpdateCourse) {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedCourse),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);

    setCourses(courses.map((c) => (c.id === id ? data.updatedCourse : c)));
  }

  return (
    <CourseContext.Provider
      value={{
        courses,
        loadCourses,
        createCourse,
        deleteCourse,
        updateCourse,
        selectedCourse,
        total,
        setSelectedCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
