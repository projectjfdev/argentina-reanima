"use client";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import GalleryScroll from "../GalleryScroll/GalleryScroll";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Tipado de las props para abrir y cerrar el modal desde otro archivo
interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GalleryModalUshuaia({
  isOpen,
  onOpenChange,
}: GalleryModalProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open); // Usamos la función pasada por las props
  };

  const images = [
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218550/IMG_8358_o1dy8t_b1sh2x.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218547/IMG_8348_vg9axy_gvot0s.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218545/IMG_8338_zwv3tc_i7dmso.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218542/IMG_8301_hslmvh_oi5hcz.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218532/IMG_8272_vqatui_s7v0kz.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218529/IMG_8298_uatywk_bzgu0h.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218527/IMG_8291_kgusjv_czy0x3.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218525/IMG_8300_yaykkn_ylhwsk.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218522/IMG_8295_kucblo_ytowst.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218514/IMG_8261_bjg1ff_ulxbvp.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218511/IMG_8260_a67es7_fyblfj.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218509/IMG_8269_eppgef_ddhxwy.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218507/IMG_8259_ojfjnw_pkytma.jpg",
    "https://res.cloudinary.com/dtbryiptz/image/upload/v1748218506/IMG_8264_hbolrg_wwddnv.jpg",
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
