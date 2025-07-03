"use client";

import { AnimatedCarousel } from "./AnimatedCarousel";

function AnimatedQuienesSomos() {
  const testimonials = [
    {
      quote:
        "Se reglamenta la ley 27.159 de muerte súbita y sistema de prevención integral",
      name: "Ley 27.159",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/ley.jpg",
    },
    {
      quote:
        "En manos del Dr. Mario Fitz Maurice y con profunda emoción, nuestra querida Asociación fue reconocida por su lucha contra la muerte súbita.",
      name: "Argentina Reanima recibió el Premio INADEA por la Vida 2023",
      designation: "Asociación Civil Argentina Reanima",
      src: "https://res.cloudinary.com/dtbryiptz/image/upload/v1749597803/inadea_lkwcrw.jpg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo1.jpg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo2.jpg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo4.jpg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo6.jpg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo7.jpg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo8.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo9.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo10.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo11.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo12.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo13.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo14.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo15.jpeg",
    },
    {
      quote: "",
      name: "Equipo",
      designation: "Asociación Civil Argentina Reanima",
      src: "/images/quienes-somos/equipo16.jpeg",
    },
  ];
  return <AnimatedCarousel testimonials={testimonials} />;
}

export { AnimatedQuienesSomos };
