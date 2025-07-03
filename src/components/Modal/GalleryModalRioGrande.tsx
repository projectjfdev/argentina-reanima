"use client";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import GalleryScroll from "../GalleryScroll/GalleryScroll";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Tipado de las props para abrir y cerrar el modal desde otro archivo
interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GalleryModal({
  isOpen,
  onOpenChange,
}: GalleryModalProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open); // Usamos la función pasada por las props
  };

  const images = [
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216265/IMG_8507_muyksz_xcggyg.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216264/IMG_8499_els4uj_xy9i8n.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216261/IMG_8504_mlccp1_txzleo.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216260/IMG_8485_uu6xui_hz4vdw.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216254/IMG_8451_nywpku_bxxrsx.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216253/IMG_8483_kozx1f_fo0lu6.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216252/IMG_8424_dwccn3_a1sxnk.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216250/IMG_8438_ccskv7_beiyf1.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216249/IMG_8435_gejyax_tlvroo.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216243/IMG_8413_p6teus_lgfmju.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216241/IMG_8420_ymwvlq_bus7ff.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216240/IMG_8405_eouvij_a80cay.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216240/IMG_8409_daoo3t_wby1gg.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216239/IMG_8406_fu26rw_zq0nyh.jpg",
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
