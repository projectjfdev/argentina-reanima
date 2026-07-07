"use client";

import { AuthVisualPanel } from "@/components/Login/AuthVisualPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/libs/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
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

    if (!token) {
      setErrorMessage("El link de recuperación no es válido.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const resJSON = await res.json();

      if (res.ok && resJSON.success) {
        setSuccessMessage(resJSON.message);
        reset();
        return;
      }

      setErrorMessage(
        resJSON.message || resJSON.error || "No pudimos cambiar la contraseña",
      );
    } catch (error) {
      setErrorMessage("No pudimos cambiar la contraseña. Intentalo mas tarde.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="password"
        >
          Nueva contraseña <span className="text-blue-500">*</span>
        </label>
        <Input
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
          })}
          type="password"
          id="password"
          placeholder="Ingrese su nueva contraseña"
          className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="confirmPassword"
        >
          Confirmar contraseña <span className="text-blue-500">*</span>
        </label>
        <Input
          {...register("confirmPassword", {
            required: "Confirme su contraseña",
          })}
          type="password"
          placeholder="Reingrese su nueva contraseña"
          className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"
          id="confirmPassword"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-2">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {successMessage && (
        <p className="text-green-600 text-sm">{successMessage}</p>
      )}
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button
        type="submit"
        disabled={isLoading || !token}
        className={cn(
          "w-full bg-gradient-to-r relative overflow-hidden from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg transition-colors duration-200",
        )}
      >
        {isLoading ? "Guardando..." : "Cambiar contraseña"}
      </Button>

      <p className="pt-1 text-center text-sm text-gray-500">
        Volver a{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
        >
          iniciar sesión
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="flex w-full h-full items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl overflow-hidden rounded-2xl flex items-stretch bg-white shadow-xl"
        >
          <AuthVisualPanel description="Crea una nueva contraseña para recuperar tu acceso." />

          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">
                Cambiar contraseña
              </h1>
              <p className="text-gray-500 mb-8">
                Ingresa y confirma tu nueva contraseña.
              </p>

              <Suspense fallback={null}>
                <ResetPasswordForm />
              </Suspense>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
