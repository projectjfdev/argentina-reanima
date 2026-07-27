"use client";

import { AuthVisualPanel } from "@/components/Login/AuthVisualPanel";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  getSession,
  signIn,
  SignInResponse,
  useSession,
} from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

const Button = ({
  children,
  variant = "default",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    default:
      "bg-primary bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface FormData {
  email: string;
  password: string;
}

const SignInCard = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<SignInResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const router = useRouter();
  const { update } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const redirectByRole = async () => {
    const session = await getSession();
    if (session?.user.role === "ADMIN") {
      router.refresh();
      router.push("/dashboard");
      return;
    }

    if (session?.user.role === "USER") {
      router.refresh();
      router.push("/");
    }
  };

  useEffect(() => {
    redirectByRole();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        setErrorMessage(res);
        return;
      }

      await update();
      await redirectByRole();
    } catch (error) {
      alert(
        "Algo salió mal. Por favor, inténtelo de nuevo. Si el problema persiste, contacte al administrador del sistema.",
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(undefined);
    await signIn("google", { callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex items-stretch bg-white shadow-xl"
      >
        <AuthVisualPanel description="Accedé a tu cuenta para consultar tu información y certificados." />

        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800">
              Bienvenido de nuevo
            </h1>
            <p className="text-gray-500 mb-8">Acceda a su cuenta</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full border-gray-200 bg-white py-2 text-gray-800 hover:bg-gray-50 cursor-pointer"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full  border-gray-300 text-xs font-semibold text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 18 18"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.614Z"
                    />
                    <path
                      fill="#34A853"
                      d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.585-5.037-3.715H.956v2.332A9 9 0 0 0 9 18Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.963 10.706A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.167.281-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M9 3.579c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z"
                    />
                  </svg>
                </span>
                {isGoogleLoading ? "Conectando..." : "Continuar con Google"}
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">o</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

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
                    required: "El correo de administrador es requerido",
                  })}
                  placeholder="Ingrese su correo de administrador"
                  className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.email.message}
                </p>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    {...register("password", {
                      required: "Por favor, ingrese su contraseña",
                    })}
                    placeholder="Ingrese su contraseña"
                    className="bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 w-full pr-10 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.password.message}
                </p>
              )}

              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                >
                  Olvidaste tu contraseña?
                </Link>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className={cn(
                    "cursor-pointer w-full bg-gradient-to-r relative overflow-hidden from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg transition-all duration-300",
                    isHovered ? "shadow-lg shadow-blue-200" : "",
                  )}
                >
                  <span className="flex items-center justify-center">
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                  {isHovered && (
                    <motion.span
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{ filter: "blur(8px)" }}
                    />
                  )}
                </Button>
              </motion.div>
              <p className="pt-1 text-center text-sm text-gray-500">
                Todavía no tenés una cuenta?{" "}
                <Link
                  href="/auth/register"
                  className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                >
                  Registrate
                </Link>
              </p>
              <div>
                {errorMessage?.error && (
                  <p className="text-red-500 text-sm mt-2">
                    {errorMessage.error}
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <SignInCard />
    </div>
  );
};

export default LoginPage;
