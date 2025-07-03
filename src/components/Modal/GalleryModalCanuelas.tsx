"use client";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import GalleryScroll from "../GalleryScroll/GalleryScroll";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Tipado de las props para abrir y cerrar el modal desde otro archivo
interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GalleryModalCanuelas({
  isOpen,
  onOpenChange,
}: GalleryModalProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open); // Usamos la función pasada por las props
  };

  const images = [
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214532/Ca%C3%B1uelas-89_io1gpj_uhhkyn.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214531/Ca%C3%B1uelas-88_yw8yse_cv5tnq.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214530/Ca%C3%B1uelas-87_zui7je_vnsbol.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214530/DSC_4090_ubdn0i_ozdz69.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214529/DSC_4082_ko7fqp_dbjk68.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214528/DSC_4071_j2difk_hvlglb.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214527/Ca%C3%B1uelas-97_rpyvyl_amuuye.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214526/DSC_0478_juus3e_fegcqk.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214525/DSC_0477_wttont_d0k04m.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214525/Ca%C3%B1uelas-99_xsr6ci_xc75sf.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214525/Ca%C3%B1uelas-91_vxyh45_em7awm.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748214525/Ca%C3%B1uelas-91_vxyh45_em7awm.jpg",
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="md:py-5 w-full h-3/4 md:h-auto overflow-x-hidden">
          <VisuallyHidden>
            <DialogTitle>Galería de imágenes</DialogTitle>
          </VisuallyHidden>
          <GalleryScroll images={images.map((image) => image)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
