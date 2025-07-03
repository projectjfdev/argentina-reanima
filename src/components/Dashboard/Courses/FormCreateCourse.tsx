"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";
import { Toaster, toast } from "sonner";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCourse } from "@/context/CourseContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import "../News/form.css";

// Define the interface based on your backend requirements
interface ICreateCourseForm {
  title: string;
  category: string;
  lessons: {
    title: string;
    href: string;
  }[];
}

const FormCreateCourse = () => {
  const { createCourse, selectedCourse, setSelectedCourse, updateCourse } =
    useCourse();
  const [step, setStep] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm<ICreateCourseForm>({
    defaultValues: {
      title: "",
      category: "",
      lessons: [{ title: "", href: "" }],
    },
  });

  // Use field array to handle dynamic lessons
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  });

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      setIsExpanded(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setIsExpanded(true);
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCancelEdit = () => {
    setSelectedCourse(null);
    reset({
      title: "",
      category: "",
      lessons: [{ title: "", href: "" }],
    });
    setStep(1);
    setIsExpanded(true);
  };

  const addLesson = () => {
    append({ title: "", href: "" });
  };

  const onSubmit = async (data: ICreateCourseForm) => {
    if (step !== 3) return;
    console.log("dataform", data);

    // Filter out empty lessons
    const filteredLessons = data.lessons.filter(
      (lesson) => lesson.title.trim() !== "" && lesson.href.trim() !== ""
    );

    if (filteredLessons.length === 0) {
      toast.error("Debes agregar al menos una lección");
      return;
    }

    setIsLoading(true);
    try {
      if (selectedCourse) {
        await updateCourse(selectedCourse.id, {
          ...data,
          lessons: filteredLessons,
        });
        setSelectedCourse(null);
      } else {
        await createCourse({
          ...data,
          lessons: filteredLessons,
        });
      }
      setIsLoading(false);
      reset();
      setStep(1);

      toast.success(
        `${selectedCourse ? "Curso editado" : "Curso creado con éxito"}`,
        {
          description: `${
            selectedCourse
              ? "¡Excelente! Tu curso ya se encuentra actualizado"
              : "¡Excelente! Tu curso ya está disponible."
          }`,
          duration: 10000,
          action: {
            label: "X",
            onClick: () => {
              window.close();
            },
          },
        }
      );
    } catch (error) {
      toast.error("Algo salió mal, consulte al programador");
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      reset({
        title: selectedCourse.title,
        category: selectedCourse.category,
        lessons: selectedCourse.lessons.map((lesson) => ({
          title: lesson.title,
          href: lesson.href,
        })),
      });
    }
  }, [selectedCourse, reset]);

  return (
    <div className="w-full md:w-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center gap-8 my-7"
      >
        {/* Progreso de pasos */}
        <div className="flex items-center gap-6 relative">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={cn(
                "w-2 h-2 rounded-full relative z-10",
                dot <= step ? "bg-white" : "bg-gray-300"
              )}
            />
          ))}
          <motion.div
            initial={{ width: "12px", height: "24px", x: 0 }}
            animate={{
              width: step === 1 ? "24px" : step === 2 ? "60px" : "96px",
              x: 0,
            }}
            className="absolute -left-[8px] top-[3px] -translate-y-1/2 h-3 bg-green-400 rounded-full"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.8,
              bounce: 0.25,
              duration: 0.6,
            }}
          />
        </div>

        {selectedCourse && (
          <div className="mb-4 flex-wrap gap-4 flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm shadow-sm">
            <p className="text-muted-foreground">
              Editando{" "}
              <span className="font-medium text-foreground">
                {selectedCourse.title}
              </span>
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancelar edición
            </Button>
          </div>
        )}

        {/* Contenido por paso */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          {step === 1 && (
            <div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Título del curso <span className="text-secondary">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  {...register("title", {
                    required: "El título del curso es requerido",
                  })}
                  className="bg-gray-50 border-gray-400 placeholder:text-gray-400 text-gray-800 w-full focus:border-primary focus:ring-primary"
                  placeholder="Título del curso"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="my-6">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoría <span className="text-secondary">*</span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Por favor, selecciona una categoría" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RCP">RCP</SelectItem>
                        <SelectItem value="DEA">DEA</SelectItem>
                        <SelectItem value="RCP y DEA">RCP y DEA</SelectItem>
                        <SelectItem value="Maniobra de Heimlich">
                          Maniobra de Heimlich
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Lecciones</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLesson}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Lección
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-3">
                  <div>
                    <label
                      htmlFor={`lessons.${index}.title`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Título de la lección{" "}
                      <span className="text-secondary">*</span>
                    </label>
                    <Input
                      id={`lessons.${index}.title`}
                      {...register(`lessons.${index}.title` as const, {
                        required: "El título de la lección es requerido",
                      })}
                      className="bg-gray-50 border-gray-400 placeholder:text-gray-400 text-gray-800 w-full"
                      placeholder="Título de la lección"
                    />
                    {errors.lessons?.[index]?.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lessons[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`lessons.${index}.href`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      URL de la lección{" "}
                      <span className="text-secondary">*</span>
                    </label>
                    <Input
                      id={`lessons.${index}.href`}
                      {...register(`lessons.${index}.href` as const, {
                        required: "La URL de la lección es requerida",
                      })}
                      className="bg-gray-50 border-gray-400 placeholder:text-gray-400 text-gray-800 w-full"
                      placeholder="https://ejemplo.com/leccion"
                    />
                    {errors.lessons?.[index]?.href && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lessons[index]?.href?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-2 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="w-full max-w-4xl mx-auto">
              <h2 className="text-lg font-medium mb-4">Resumen del curso</h2>

              <div className="space-y-4 p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Título:</h3>
                  <p>{watch("title")}</p>
                </div>

                <div>
                  <h3 className="font-medium">Categoría:</h3>
                  <p>{watch("category")}</p>
                </div>

                <div>
                  <h3 className="font-medium">
                    Lecciones ({watch("lessons").length}):
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {watch("lessons").map((lesson, index) => (
                      <li key={index}>
                        {lesson.title} -{" "}
                        <span className="text-xs text-gray-500">
                          {lesson.href}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Revisa la información antes de finalizar. Puedes volver atrás
                para hacer cambios.
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="w-full max-w-sm">
          <motion.div
            className="flex items-center gap-1"
            animate={{
              justifyContent: isExpanded ? "stretch" : "space-between",
            }}
          >
            {!isExpanded && (
              <motion.button
                type="button"
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: "130px", scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  mass: 0.8,
                  bounce: 0.25,
                  duration: 0.6,
                  opacity: { duration: 0.2 },
                }}
                onClick={handleBack}
                className="px-4 py-3 text-white w-30 md:w-36 bg-primary font-semibold rounded-full hover:bg-[#8c7cc1] transition-colors text-sm cursor-pointer"
              >
                Atrás
              </motion.button>
            )}
            {step < 3 ? (
              <motion.button
                type="button"
                onClick={handleContinue}
                animate={{
                  flex: isExpanded ? 1 : "inherit",
                  width: "130px",
                  scale: 1,
                }}
                className={cn(
                  "px-4 py-3 text-white w-30 md:w-36 bg-primary font-semibold rounded-full hover:bg-[#8c7cc1] transition-colors text-sm cursor-pointer",
                  !isExpanded && "w-30 md:w-36"
                )}
              >
                Continuar
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isLoading}
                animate={{ flex: isExpanded ? 1 : "inherit" }}
                className={cn(
                  "px-4 py-3 rounded-full text-white transition-colors flex-1 cursor-pointer",
                  !isExpanded && "w-44",
                  "bg-primary"
                )}
              >
                <div className="flex items-center font-semibold justify-center gap-2 text-sm">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      mass: 0.5,
                      bounce: 0.4,
                    }}
                  ></motion.div>
                  {isLoading ? (
                    <span className="flex items-center justify-center h-[20px] relative bottom-[14px] right-1">
                      <span className="flex items-center">
                        <span className="dot animate-dot text-[40px] font-bold">
                          .
                        </span>
                        <span className="dot animate-dot animation-delay-100 text-[40px] font-bold">
                          .
                        </span>
                        <span className="dot animate-dot animation-delay-200 text-[40px] font-bold">
                          .
                        </span>
                      </span>
                    </span>
                  ) : (
                    <p className="text-sm">Finalizar</p>
                  )}
                </div>
              </motion.button>
            )}
          </motion.div>
        </div>
      </form>
      <Toaster />
    </div>
  );
};

export default FormCreateCourse;
