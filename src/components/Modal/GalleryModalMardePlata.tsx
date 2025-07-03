"use client";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import GalleryScroll from "../GalleryScroll/GalleryScroll";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Tipado de las props para abrir y cerrar el modal desde otro archivo
interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // NUEVO
}

export default function GalleryModalMardelPlata({
  isOpen,
  onOpenChange,
}: GalleryModalProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open); // Usamos la función pasada por las props
  };

  const images = [
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216984/1-79_qj1rml_dayjhj.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216981/1-90_rfgtlz_kylwdq.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216977/1-53_dmk8ns_r4bjel.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216968/1-39_f31gay_pd4sql.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216962/1-14_n4vdqu_ukiohy.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216954/1-33_tyxxgt_yd1x2f.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216949/1-15_p60zbe_n9faxg.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216947/1-28_wupdfa_l4k7gf.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216940/1_gr00qz_tgocse.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216941/1-4_txbnzy_odlcq0.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216939/1-3_f2iirr_vgrunn.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748216938/1-2_ox0sng_uuyra7.jpg",
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
