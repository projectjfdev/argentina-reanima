"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";
import { Toaster, toast } from "sonner";
import type { ICreateNews } from "@/interfaces/news";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload/FileUpload";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useNews } from "@/context/NewsContext";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import "./form.css";
const FormCreateNews = () => {
  const { createNews, selectedNews, setSelectedNews, updateNews } = useNews();
  const [step, setStep] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [picture, setPicture] = useState<any>(null);

  const handlePictureUpload = (files: any) => {
    const selectedFile = files[0];

    if (selectedFile) {
      const maxSizeInBytes = 4 * 1024 * 1024; // 4 MB en bytes

      if (selectedFile.size > maxSizeInBytes) {
        alert(
          "El archivo supera el límite de 4 MB. Por favor, selecciona otro archivo."
        );
        files = ""; // Limpia el input
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPicture(event.target?.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<ICreateNews>();

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Add this line to prevent form submission
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
    setSelectedNews(null);
    reset({
      title: "",
      redirect: "",
      category: "",
      description: "",
      dateNew: new Date(),
    });
    setPicture(null);
    setStep(1);
    setIsExpanded(true);
  };

  const onSubmit = async (data: ICreateNews) => {
    if (step !== 3) return;

    setIsLoading(true);
    try {
      if (selectedNews) {
        await updateNews(selectedNews.id, {
          ...data,
          dateNew: data.dateNew ?? undefined,
          imageBase64:
            picture && picture !== selectedNews.imageUrl ? picture : undefined,
        });

        setSelectedNews(null);
      } else {
        await createNews({
          ...data,
          ...(picture && { imageBase64: picture }),
        });
      }

      setIsLoading(false);
      reset();
      setStep(1);
      setPicture(null);

      toast.success(
        `${selectedNews ? "Noticia editada" : "Noticia creada con éxito"}`,
        {
          description: `${
            selectedNews
              ? "¡Excelente! Tu noticia ya se encuentra actualizada"
              : "¡Excelente! Tu noticia ya está disponible."
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
      alert("Algo salió mal, consulte al programador");
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedNews) {
      reset({
        title: selectedNews.title,
        redirect: selectedNews.redirect,
        category: selectedNews.category,
        description: selectedNews.description,
        dateNew: selectedNews.dateNew ?? undefined,
      });
      setPicture(selectedNews.imageUrl); // para que también se vea la imagen previa, si querés mostrarla
    }
  }, [selectedNews, reset]);

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

        {selectedNews && (
          <div className="mb-4 flex-wrap gap-4 flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm shadow-sm">
            <p className="text-muted-foreground">
              Editando{" "}
              <span className="font-medium text-foreground">
                {selectedNews.title}
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
                  Título de la noticia <span className="text-secondary">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  {...register("title", {
                    required: "El título de la noticia es requerido",
                  })}
                  className="bg-gray-50 border-gray-400 placeholder:text-gray-400 text-gray-800 w-full focus:border-primary focus:ring-primary"
                  placeholder="Título de la noticia"
                />
              </div>
              <div className="my-6">
                <label
                  htmlFor="redirect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Link de redirección <span className="text-secondary">*</span>
                </label>
                <Input
                  id="redirect"
                  type="text"
                  {...register("redirect", {
                    required: "El título de la noticia es requerido",
                  })}
                  className="bg-gray-50 border-gray-400 placeholder:text-gray-400 text-gray-800 w-full focus:border-primary focus:ring-primary"
                  placeholder="Ejemplo: https://www.eldia.com/nota/2025-1-3-2-47-28-piden-desfibriladores-para-las-tres-plazas-que-estan-en-remodelacion-la-ciudad..."
                />
              </div>
              <div className="min-w-[300px]">
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
                        <SelectItem value="Medios">Medios</SelectItem>
                        <SelectItem value="Alianza con Camuzzi Gas">
                          Alianza con Camuzzi Gas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción <span className="text-secondary">*</span>
              </label>
              <Textarea
                placeholder="Breve descripción de la noticia"
                required
                maxLength={300}
                {...register("description", {
                  required: "La descripción es requerida",
                  maxLength: {
                    value: 300,
                    message:
                      "La descripción no puede superar los 300 caracteres",
                  },
                })}
              />
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1 mt-6"
              >
                Fecha de la noticia <span className="text-secondary">*</span>
              </label>
              <Controller
                name="dateNew"
                control={control}
                render={({ field }) => (
                  <CalendarComponent
                    mode="single"
                    selected={field.value ?? undefined} // debe ser Date | undefined
                    onSelect={field.onChange} // se llama con la nueva fecha
                    captionLayout="dropdown"
                    className="rounded-md border shadow-sm"
                  />
                )}
              />
            </div>
          )}
          {step === 3 && (
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-background border-neutral-200 dark:border-neutral-800 rounded-lg">
              <FileUpload onChange={handlePictureUpload} />
              {picture ? (
                <Image
                  src={picture || "/placeholder.svg"}
                  alt="Imagen seleccionada"
                  className="mx-auto mb-4 max-h-60 object-contain rounded-md"
                  width={200}
                  height={200}
                />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">
                    En caso de que no adjuntes una miniatura para la noticia,
                    esta quedará por defecto ↓
                  </p>
                  <Image
                    src={"/images/noticia-generica.jpg"}
                    alt="Imagen seleccionada"
                    className="mx-auto mb-4 max-h-60 object-contain rounded-md"
                    width={200}
                    height={200}
                  />
                </div>
              )}
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
                className="px-4 py-3 text-white w-30 md:w-36  bg-primary font-semibold rounded-full hover:bg-[#8c7cc1] transition-colors text-sm cursor-pointer"
              >
                Atrás
              </motion.button>
            )}
            {step < 3 ? (
              <motion.button
                onClick={handleContinue}
                animate={{
                  flex: isExpanded ? 1 : "inherit",
                  width: "130px",
                  scale: 1,
                }}
                className={cn(
                  "px-4 py-3 text-white w-30 md:w-36  bg-primary font-semibold rounded-full hover:bg-[#8c7cc1] transition-colors text-sm cursor-pointer",
                  !isExpanded && "w-30 md:w-36 "
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
                  "px-4 py-3 rounded-full text-white transition-colors flex-1 cursor-pointer bg-primary",
                  !isExpanded && "w-44"
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

export default FormCreateNews;
