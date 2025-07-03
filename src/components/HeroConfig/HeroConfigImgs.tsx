"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <main>
      <section className="overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-20">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
              <Link
                href="/"
                className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0"
              >
                <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                  New
                </span>
                <span className="text-sm">Introduction Tailark Html</span>
                <span className="bg-(--color-border) block h-4 w-px"></span>

                <ArrowRight className="size-4" />
              </Link>

              <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl">
                Production Ready Digital Marketing blocks
              </h1>
              <p className="mt-8">
                Error totam sit illum. Voluptas doloribus asperiores quaerat
                aperiam. Quidem harum omnis beatae ipsum soluta!
              </p>

              <div>
                <div className="mx-auto my-10 max-w-sm lg:my-12 lg:ml-0 lg:mr-auto">
                  <div className="md:pr-1.5 lg:pr-0">
                    <Button aria-label="submit">
                      <span className="hidden md:block">Get Started</span>
                    </Button>
                  </div>
                </div>

                <ul className="list-inside list-disc space-y-2">
                  <li>Faster</li>
                  <li>Modern</li>
                  <li>100% Customizable</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
            <div
              aria-hidden
              className="absolute z-[1] inset-0 bg-gradient-to-r from-background from-35%"
            />
            <div className="relative">
              <Image
                className="hidden dark:block"
                src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747668586/1-88_ergm66.jpg"
                alt="app illustration"
                width={2796}
                height={2008}
              />
              <Image
                className="dark:hidden"
                src="https://res.cloudinary.com/dtbryiptz/image/upload/v1747668586/1-88_ergm66.jpg"
                alt="app illustration"
                width={2796}
                height={2008}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
