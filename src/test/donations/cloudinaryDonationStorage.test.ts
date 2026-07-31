import {
  uploadDonationCampaignAdditionalImages,
  validateDonationReceiptFile,
  validateDonationUploadFile,
} from "@/libs/donations";
import { describe, expect, it } from "vitest";

const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
]);
const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

function createFile({
  name = "archivo.png",
  type = "image/png",
  content = "contenido",
}: {
  name?: string;
  type?: string;
  content?: string;
}) {
  return new File([content], name, { type });
}

describe("validateDonationUploadFile", () => {
  it("accepts valid campaign place images", () => {
    expect(validateDonationUploadFile(createFile({}), "placeImage")).toEqual({
      success: true,
    });
  });

  it("accepts valid additional campaign images", () => {
    expect(validateDonationUploadFile(createFile({}), "additionalImage")).toEqual({
      success: true,
    });
  });

  it("accepts valid receipt JPG, JPEG and PNG files", async () => {
    await expect(
      validateDonationReceiptFile(
        new File([JPEG_BYTES], "comprobante.jpg", { type: "image/jpeg" }),
      ),
    ).resolves.toEqual({ success: true });
    await expect(
      validateDonationReceiptFile(
        new File([JPEG_BYTES], "comprobante.jpeg", { type: "image/jpeg" }),
      ),
    ).resolves.toEqual({ success: true });
    await expect(
      validateDonationReceiptFile(
        new File([PNG_BYTES], "comprobante.png", { type: "image/png" }),
      ),
    ).resolves.toEqual({ success: true });
  });

  it("rejects PDF files for receipts", () => {
    expect(
      validateDonationUploadFile(
        createFile({ name: "comprobante.pdf", type: "application/pdf" }),
        "receipt",
      ),
    ).toEqual({
      success: false,
      error: "El tipo de archivo de comprobante no es valido",
    });
  });

  it("rejects receipt files with a spoofed image MIME type", async () => {
    await expect(
      validateDonationReceiptFile(
        new File([PDF_BYTES], "comprobante.jpg", { type: "image/jpeg" }),
      ),
    ).resolves.toEqual({
      success: false,
      error: "El comprobante debe ser una imagen JPG, JPEG o PNG valida",
    });
  });

  it("rejects PDF files for campaign place images", () => {
    expect(
      validateDonationUploadFile(
        createFile({ name: "lugar.pdf", type: "application/pdf" }),
        "placeImage",
      ),
    ).toEqual({
      success: false,
      error: "El tipo de archivo de imagen del lugar no es valido",
    });
  });

  it("rejects empty files", () => {
    expect(
      validateDonationUploadFile(
        createFile({ name: "vacio.png", content: "" }),
        "receipt",
      ),
    ).toEqual({
      success: false,
      error: "El archivo de comprobante esta vacio",
    });
  });

  it("rejects files larger than 5MB", () => {
    const largeFile = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "grande.png",
      { type: "image/png" },
    );

    expect(validateDonationUploadFile(largeFile, "receipt")).toEqual({
      success: false,
      error: "El archivo de comprobante no puede superar 5MB",
    });
  });

  it("rejects more than two additional campaign images", async () => {
    await expect(
      uploadDonationCampaignAdditionalImages([
        createFile({ name: "extra-1.png" }),
        createFile({ name: "extra-2.png" }),
        createFile({ name: "extra-3.png" }),
      ]),
    ).rejects.toMatchObject({
      code: "UPLOAD_VALIDATION_ERROR",
      details: {
        additionalImages: "No se pueden cargar mas de 2 imagenes adicionales",
      },
    });
  });
});

