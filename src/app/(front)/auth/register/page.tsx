"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import { useForm } from "react-hook-form";
import { DotMap } from "@/components/Login/DotMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const resJSON = await res.json();
      console.log(resJSON);

      if (resJSON.success) {
        router.push("/auth/login");
        return;
      }

      if (!resJSON.success) {
        // por ejemplo si tu API responde con un error
        const errorData = await res.json();
        alert("Error: " + (errorData.message || "Unknown error"));
        return;
      }

      // alert(resJSON.message || "User registered successfully");
    } catch (error) {
      alert("Failed to register user. Try again later.");
      console.error(error);
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-white shadow-xl"
      >
        {/* Left side - Map */}
        <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
            <DotMap />

            {/* Logo and text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-6"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <ArrowRight className="text-white h-6 w-6" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                Argentina Reanima
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-sm text-center text-gray-600 max-w-xs"
              >
               Registre su cuenta y acceda a su panel administrativo para gestionar la informacion de su
                página web
              </motion.p>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">
              Registrarse
            </h1>

            <p className="text-gray-500 mb-8">Registre su cuenta</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="username"
                >
                  Username <span className="text-blue-500">*</span>{" "}
                </label>
                <Input
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"
                  {...register("username", { required: true })}
                  type="text"
                  id="username"
                  placeholder="Ingrese su nombre de usuario"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.username.message}
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
                  {...register("email", { required: true })}
                  type="email"
                  id="email"
                  placeholder="Ingrese su email"
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full pr-10 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.email.message}
                </p>
              )}
              <div className="pt-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="password"
                >
                  Password <span className="text-blue-500">*</span>
                </label>
                <Input
                  {...register("password", { required: true })}
                  type="password"
                  id="password"
                  placeholder="Ingrese su clave"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.password.message}
                </p>
              )}

              <div className="pt-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <Input
                  {...register("confirmPassword", { required: true })}
                  type="password"
                  placeholder="Reingrese su clave"
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full pr-10 focus:border-blue-500 focus:ring-blue-500"
                  id="confirmPassword"
                />
              </div>
              <div className="pt-5">
                <Button
                  type="submit"
                  className={cn(
                    "cursor-pointer w-full bg-gradient-to-r relative overflow-hidden from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 rounded-lg transition-all duration-300"
                  )}
                >
                  Register
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
