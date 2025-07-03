"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/libs/utils";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  content: string;
  avatar: string;
}

export interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  autoRotateInterval?: number;
  showVerifiedBadge?: boolean;
  className?: string;
}

export function AnimatedVerticalCarousel({
  testimonials = [],
  autoRotateInterval = 6000,
  showVerifiedBadge = true,
  className,
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // useEffect(() => {
  //   if (autoRotateInterval <= 0 || testimonials.length <= 1) return;

  //   const interval = setInterval(() => {
  //     setActiveIndex((prev) => (prev + 1) % testimonials.length);
  //   }, autoRotateInterval);

  //   return () => clearInterval(interval);
  // }, [testimonials.length, autoRotateInterval]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (testimonials.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="testimonials-alt"
      className={cn(
        "py-16 md:py-32 relative overflow-hidden flex justify-center",
        className
      )}
    >
      <div className="container items-center px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="md:grid md:grid-cols-[1fr_auto] gap-8 items-center"
        >
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute -top-6 -left-6 z-10">
              <Quote className="h-12 w-12 text-primary/20" strokeWidth={1} />
            </div>

            {/* Testimonial cards */}
            <div className="relative transition-all duration-500">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={testimonial.id}
                  className={cn(
                    "transition-all duration-500 border",
                    index === activeIndex
                      ? "relative opacity-100 translate-x-0 shadow-lg"
                      : "absolute inset-0 opacity-0 translate-x-[100px] pointer-events-none"
                  )}
                >
                  <CardContent className="p-6 md:p-8 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          height={200}
                          width={200}
                        />
                        <div className="text-left">
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <p className="flex-1 italic text-base/relaxed">
                      {testimonial.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div
            variants={itemVariants}
            className="flex md:flex-col gap-4 justify-center mt-8 md:mt-0"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-10 w-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex md:flex-col gap-2 items-center justify-center">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === activeIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveIndex(index);
                    }
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-10 w-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
