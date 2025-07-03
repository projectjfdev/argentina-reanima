"use client";

import "./logoslider.css";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const LogoSlider = () => {
  return (
    <>
      <div className="group flex overflow-hidden py-2 [--gap:2rem] [gap:var(--gap)] flex-row max-w-full [--duration:40s] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row"
              key={i}
            >
              <div className="flex items-center w-32 gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747672052/fac-logo_ghhy7j.png"
                        alt="Federación Argentina de Cardiología"
                        width={80}
                        height={80}
                        className="w-18 h-18 md:w-26 md:h-26"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Federación Argentina de Cardiología</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center w-32 gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747672053/IUFAC-logo_wqwxz7.png"
                        alt="Instructor Universitario Federación Argentina de
                        Cardiología"
                        width={80}
                        height={80}
                        className="w-18 h-18 md:w-26 md:h-26"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Instructor Universitario Federación Argentina de
                        Cardiología{" "}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center w-32 gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747672052/logofac-logo_cgycz8.png"
                        alt="Red Nacional Prevención Muerte Subita"
                        width={80}
                        height={80}
                        className="w-18 h-18 md:w-26 md:h-26"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Red Nacional Prevención Muerte Subita</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
