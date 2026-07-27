"use client";

import { AuthVisualPanel } from "@/components/Login/AuthVisualPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/libs/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  email: string;
}

const GENERIC_MESSAGE =
  "Si el email corresponde a una cuenta, te enviaremos un link para cambiar la contraseña.";

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSuccessMessage("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const resJSON = await res.json();

      if (res.ok && resJSON.success) {
        setSuccessMessage(resJSON.message || GENERIC_MESSAGE);
        reset();
        return;
      }

      setErrorMessage(
        resJSON.message || resJSON.error || "No pudimos procesar la solicitud",
      );
    } catch (error) {
      setErrorMessage("No pudimos procesar la solicitud. Intentalo mas tarde.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="flex w-full h-full items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl overflow-hidden rounded-2xl flex items-stretch bg-white shadow-xl"
        >
          <AuthVisualPanel description="Recuperá el acceso a tu cuenta desde tu email registrado." />

          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">
                Recuperar contraseña
              </h1>
              <p className="text-gray-500 mb-8">
                Ingresa tu email y te enviaremos un link de recuperación.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email <span className="text-blue-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "El email es obligatorio",
                    })}
                    placeholder="Ingrese su email"
                    className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {successMessage && (
                  <p className="text-green-600 text-sm">{successMessage}</p>
                )}
                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-gradient-to-r relative overflow-hidden from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg transition-colors duration-200",
                  )}
                >
                  {isLoading ? "Enviando..." : "Enviar link"}
                </Button>

                <p className="pt-1 text-center text-sm text-gray-500">
                  Ya recordaste tu contraseña?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
