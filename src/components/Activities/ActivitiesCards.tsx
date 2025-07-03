"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import GalleryModalCanuelas from "../Modal/GalleryModalCanuelas";
import GalleryModalRioGrande from "../Modal/GalleryModalRioGrande";
import GalleryModalMardelPlata from "../Modal/GalleryModalMardePlata";
import GalleryModalUshuaia from "../Modal/GalleryModalUshuaia";
import { Button } from "../ui/button";

interface Post {
  id: string;
  title: string;
  description: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
  tags?: string[];
  gallery?: string[];
}

interface ActivitiesProps {
  canuelasEvent: Post[];
  mardelPlataEvent: Post[];
  rioGrandeEvent: Post[];
  ushuaiaEvent: Post[];
}

const ActivitiesCards = ({
  canuelasEvent,
  rioGrandeEvent,
  mardelPlataEvent,
  ushuaiaEvent,
}: ActivitiesProps) => {
  const [isModalOpenCanuelas, setIsModalOpenCanuelas] = useState(false);
  const [isModalOpenRio, setIsModalOpenRio] = useState(false);
  const [isModalOpenMdq, setIsModalOpenMdq] = useState(false);
  const [isModalOpenUshuaia, setIsModalOpenUshuaia] = useState(false);

  const handleModalOpenCanuelas = () => {
    setIsModalOpenCanuelas(true);
    return;
  };

  const handleOpenRio = () => {
    setIsModalOpenRio(true);
    return;
  };

  const handleOpenMdq = () => {
    setIsModalOpenMdq(true);
    return;
  };

  const handleOpenUshuaia = () => {
    setIsModalOpenUshuaia(true);
    return;
  };

  return (
    <section>
      <div className="container flex flex-col items-center gap-7 md:gap-16">
        <div className="grid gap-y-10 sm:gap-y-12 md:gap-y-16 lg:gap-y-20">
          {canuelasEvent.map((post) => (
            <Card
              key={post.id}
              className="order-last border-0 bg-transparent shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6">
                      {post.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                    <div
                      onClick={handleModalOpenCanuelas}
                      className="hover:underline cursor-pointer"
                    >
                      {post.title}
                    </div>
                  </h3>
                  <p className="mt-4 text-muted-foreground md:mt-5">
                    {post.description}
                  </p>
                  <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                    <span className="text-muted-foreground">{post.author}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {post.published}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center space-x-2 md:mt-8">
                    <Button
                      variant={"ghost"}
                      onClick={handleModalOpenCanuelas}
                      className="inline-flex items-center font-semibold hover:underline md:text-base cursor-pointer"
                    >
                      <span>Ver galería</span>
                      <ArrowRight className="ml-2 size-4 transition-transform" />
                    </Button>
                  </div>
                </div>
                <div className="order-first sm:order-last sm:col-span-5">
                  {/* <a href={post.url} target="_blank" className="block"> */}
                  <div className="aspect-[16/9] h-full  overflow-clip rounded-lg border border-border">
                    <button onClick={handleModalOpenCanuelas}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-opacity duration-200 fade-in hover:opacity-70 cursor-pointer"
                        width={616}
                        height={346}
                      />
                    </button>
                  </div>
                  {/* </a> */}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div>
          {rioGrandeEvent.map((post) => (
            <Card
              key={post.id}
              className="order-last border-0 bg-transparent shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6">
                      {post.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                    <div
                      onClick={handleOpenRio}
                      className="hover:underline cursor-pointer"
                    >
                      {post.title}
                    </div>
                  </h3>
                  <p className="mt-4 text-muted-foreground md:mt-5">
                    {post.description}
                  </p>
                  <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                    <span className="text-muted-foreground">{post.author}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {post.published}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center space-x-2 md:mt-8">
                    <Button
                      variant={"ghost"}
                      onClick={handleOpenRio}
                      className="inline-flex items-center font-semibold hover:underline md:text-base cursor-pointer"
                    >
                      <span>Ver galería</span>
                      <ArrowRight className="ml-2 size-4 transition-transform" />
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-5 order-first">
                  {/* <a href={post.url} target="_blank" className="block"> */}
                  <div className="aspect-[16/9] h-full overflow-clip rounded-lg border border-border">
                    <button onClick={handleOpenRio}>
                      <Image
                        width={616}
                        height={346}
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-opacity duration-200 fade-in hover:opacity-70 cursor-pointer"
                      />
                    </button>
                  </div>
                  {/* </a> */}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div>
          {mardelPlataEvent.map((post) => (
            <Card
              key={post.id}
              className="order-last border-0 bg-transparent shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6">
                      {post.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                    <div
                      onClick={handleOpenMdq}
                      className="hover:underline cursor-pointer"
                    >
                      {post.title}
                    </div>
                  </h3>
                  <p className="mt-4 text-muted-foreground md:mt-5">
                    {post.description}
                  </p>
                  <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                    <span className="text-muted-foreground">{post.author}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {post.published}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center space-x-2 md:mt-8">
                    <Button
                      variant={"ghost"}
                      onClick={handleOpenMdq}
                      className="inline-flex items-center font-semibold hover:underline md:text-base cursor-pointer"
                    >
                      <span>Ver galería</span>
                      <ArrowRight className="ml-2 size-4 transition-transform" />
                    </Button>
                  </div>
                </div>
                <div className="order-first sm:order-last sm:col-span-5">
                  {/* <a href={post.url} target="_blank" className="block"> */}
                  <div className="aspect-[16/9] h-full  overflow-clip rounded-lg border border-border">
                    <button onClick={handleOpenMdq}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-opacity duration-200 fade-in hover:opacity-70 cursor-pointer"
                        width={616}
                        height={346}
                      />
                    </button>
                  </div>
                  {/* </a> */}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div>
          {ushuaiaEvent.map((post) => (
            <Card
              key={post.id}
              className="order-last border-0 bg-transparent shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6">
                      {post.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                    <div
                      onClick={handleOpenUshuaia}
                      className="hover:underline cursor-pointer"
                    >
                      {post.title}
                    </div>
                  </h3>
                  <p className="mt-4 text-muted-foreground md:mt-5">
                    {post.description}
                  </p>
                  <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                    <span className="text-muted-foreground">{post.author}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {post.published}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center space-x-2 md:mt-8">
                    <Button
                      variant={"ghost"}
                      onClick={handleOpenUshuaia}
                      className="inline-flex items-center font-semibold hover:underline md:text-base cursor-pointer"
                    >
                      <span>Ver galería</span>
                      <ArrowRight className="ml-2 size-4 transition-transform" />
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-5 order-first">
                  {/* <a href={post.url} target="_blank" className="block"> */}
                  <div className="aspect-[16/9] h-full overflow-clip rounded-lg border border-border">
                    <button onClick={handleOpenUshuaia}>
                      <Image
                        width={616}
                        height={346}
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-opacity duration-200 fade-in hover:opacity-70 cursor-pointer"
                      />
                    </button>
                  </div>
                  {/* </a> */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <GalleryModalCanuelas
        isOpen={isModalOpenCanuelas}
        onOpenChange={setIsModalOpenCanuelas}
      />

      <GalleryModalRioGrande
        isOpen={isModalOpenRio}
        onOpenChange={setIsModalOpenRio}
      />

      <GalleryModalMardelPlata
        isOpen={isModalOpenMdq}
        onOpenChange={setIsModalOpenMdq}
      />

      <GalleryModalUshuaia
        isOpen={isModalOpenUshuaia}
        onOpenChange={setIsModalOpenUshuaia}
      />
    </section>
  );
};

export { ActivitiesCards };
