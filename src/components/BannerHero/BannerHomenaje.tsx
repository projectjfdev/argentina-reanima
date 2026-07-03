"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import Image from "next/image";

// Interface for component props remains the same for easy integration.
interface AnimatedFeatureSpotlightProps extends React.HTMLAttributes<HTMLElement> {
  preheaderIcon?: React.ReactNode;
  preheaderText?: string;
  heading: React.ReactNode;
  description: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
  imageUrl: string;
  imageAlt?: string;
}

const AnimatedFeatureSpotlight = React.forwardRef<
  HTMLElement,
  AnimatedFeatureSpotlightProps
>(
  (
    {
      className,
      preheaderIcon,
      preheaderText,
      heading,
      description,
      buttonText,
      buttonProps,
      imageUrl,
      imageAlt = "Feature illustration",
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "container mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-10",
          className,
        )}
        aria-labelledby="feature-spotlight-heading"
        {...props}
      >
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_0.9fr] md:gap-12">
          <div className="flex flex-col items-center space-y-5 text-center md:items-start md:text-left">
            {preheaderText && (
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-700">
                {preheaderIcon}
                <span>{preheaderText}</span>
              </div>
            )}
            <h2
              id="feature-spotlight-heading"
              className="text-3xl font-semibold tracking-normal text-slate-950 animate-in fade-in slide-in-from-bottom-3 duration-500 md:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-base leading-8 text-slate-600 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 md:text-lg">
              {description}
            </p>
            {buttonText && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90"
                  {...buttonProps}
                >
                  {buttonText}
                </Button>
              </div>
            )}
          </div>

          <div className="relative w-full overflow-hidden rounded-lg animate-in fade-in zoom-in-95 duration-500 delay-150 ">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1920}
              height={1344}
              priority
              className="aspect-[1.35] w-full object-cover md:block"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
          </div>
        </div>
      </section>
    );
  },
);
AnimatedFeatureSpotlight.displayName = "AnimatedFeatureSpotlight";

export { AnimatedFeatureSpotlight };
