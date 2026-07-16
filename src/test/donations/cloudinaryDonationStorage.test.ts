import { validateDonationUploadFile } from "@/libs/donations";
import { describe, expect, it } from "vitest";

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

  it("accepts valid receipt PDFs", () => {
    expect(
      validateDonationUploadFile(
        createFile({ name: "comprobante.pdf", type: "application/pdf" }),
        "receipt",
      ),
    ).toEqual({ success: true });
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
});

