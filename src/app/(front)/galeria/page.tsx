"use client";

import {
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/ImageGallery/AnimatedGallery";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const IMAGES_1 = [
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025565/20_bu3dgh.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025565/21_yzq9bm.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025564/19_huaknf.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025563/18_yfpugb.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/10_mavcsy.jpg",
];
const IMAGES_2 = [
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025563/17_qafdjy.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025562/16_kcqdww.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025562/8_uuq2y8.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025562/15_vuhwiv.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025560/14_opxs9v.jpg",
];
const IMAGES_3 = [
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/12_zbb2to.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/13_wvo6zd.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/5_o0bm0v.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025561/6_ucuoli.jpg",
  "https://res.cloudinary.com/dtbryiptz/image/upload/v1748025560/11_d4diy5.jpg",
];

const GaleriaPage = () => {
  const router = useRouter();
  return (
    <div className="relative bg-white mt-24">
      <div className="text-center flex flex-col gap-3 relative top-10">
        <div>
          <h1 className="font-serif text-4xl font-extralight md:text-5xl">
            Nuestra{" "}
            <span className="font-serif font-extralight text-primary">
              historia en acción
            </span>
          </h1>
          <h2 className="font-serif text-4xl font-extralight md:text-5xl">
            en cada rincón del país
          </h2>
        </div>

        <p className="leading-normal tracking-tight text-muted-foreground">
          Recorré nuestra galería y descubrí cómo capacitamos, salvamos vidas
          <br /> y construimos una comunidad más preparada.
        </p>

        <div className="z-50">
          <Button
            className="gap-2"
            onClick={() => router.push("/capacitaciones")}
          >
            Ver cursos <VideoIcon className="size-4" />
          </Button>
          <Button
            variant={"link"}
            className="text-sencondary"
            onClick={() => router.push("/quienes-somos")}
          >
            Sobre nosotros
          </Button>
        </div>
      </div>

      <ContainerStagger className="relative  -mb-12 place-self-center px-6 pt-12 text-center ">
        <ContainerAnimated className="my-4"></ContainerAnimated>

        <ContainerAnimated></ContainerAnimated>
      </ContainerStagger>
      <div
        className="pointer-events-none absolute z-10 h-[70vh] w-full "
        style={{
          background:
            "linear-gradient(to right, gray, var(--primary), var(--secondary))",
          filter: "blur(84px)",
          mixBlendMode: "screen",
        }}
      />

      <ContainerScroll className="relative md:h-[350vh]">
        <ContainerSticky className="h-svh">
          <GalleryContainer className="">
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_1.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full  rounded-md  object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_2.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full  rounded-md  object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_3.map((imageUrl, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full  rounded-md  object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
    </div>
  );
};

export default GaleriaPage;
