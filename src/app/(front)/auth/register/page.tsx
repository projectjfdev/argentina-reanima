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
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSuccessMessage("");
    setErrorMessage("");

    if (data.password !== data.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
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
        resJSON.message || resJSON.error || "Error al registrar usuario"
      );
    } catch (error) {
      setErrorMessage("No se pudo registrar el usuario. Intentalo mas tarde.");
      console.error(error);
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex items-stretch bg-white shadow-xl"
      >
        <AuthVisualPanel description="Registrá tu cuenta y confirmá tu email para poder iniciar sesión." />

        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">
              Registrarse
            </h1>

            <p className="text-gray-500 mb-8">Cree su cuenta</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="name"
                >
                  Nombre y Apellido <span className="text-blue-500">*</span>
                </label>
                <Input
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"
                  {...register("name", {
                    required: "El nombre es obligatorio",
                  })}
                  type="text"
                  id="name"
                  placeholder="Ingrese su nombre y apellido"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="email"
                >
                  Email <span className="text-blue-500">*</span>
                </label>
                <Input
                  {...register("email", {
                    required: "El email es obligatorio",
                  })}
                  type="email"
                  id="email"
                  placeholder="Ingrese su email"
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full pr-10 focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="password"
                >
                  Contraseña <span className="text-blue-500">*</span>
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
                  placeholder="Ingrese su contraseña"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirmar contraseña
                </label>
                <Input
                  {...register("confirmPassword", {
                    required: "Confirme su contraseña",
                  })}
                  type="password"
                  placeholder="Reingrese su contraseña"
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full pr-10 focus:border-blue-500 focus:ring-blue-500"
                  id="confirmPassword"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {successMessage && (
                <p className="text-green-600 text-sm mt-4">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
              )}

              <div className="pt-5">
                <Button
                  type="submit"
                  className={cn(
                    "cursor-pointer w-full bg-gradient-to-r relative overflow-hidden from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg transition-all duration-300"
                  )}
                >
                  Registrarse
                </Button>
              </div>
              <p className="pt-4 text-center text-sm text-gray-500">
                Ya tenés una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                >
                  Iniciá sesión
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
