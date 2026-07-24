import cloudinary from "@/libs/cloudinary";
import { DonationServiceError } from "./serviceErrors";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

const PLACE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const RECEIPT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
]);

type UploadKind = "placeImage" | "receipt" | "invoice";

export type CloudinaryStoredAsset = {
  url: string;
  publicId: string;
  resourceType: string;
  originalName?: string;
  bytes?: number;
};

export type UploadValidationResult =
  | { success: true }
  | { success: false; error: string };

function getAllowedMimeTypes(kind: UploadKind) {
  return kind === "placeImage" ? PLACE_IMAGE_MIME_TYPES : RECEIPT_MIME_TYPES;
}

function getUploadLabel(kind: UploadKind) {
  if (kind === "placeImage") return "imagen del lugar";
  if (kind === "invoice") return "factura";

  return "comprobante";
}

export function validateDonationUploadFile(
  file: File | null | undefined,
  kind: UploadKind,
): UploadValidationResult {
  const label = getUploadLabel(kind);

  if (!(file instanceof File)) {
    return { success: false, error: `El archivo de ${label} es obligatorio` };
  }

  if (file.size <= 0) {
    return { success: false, error: `El archivo de ${label} esta vacio` };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { success: false, error: `El archivo de ${label} no puede superar 5MB` };
  }

  if (!getAllowedMimeTypes(kind).has(file.type)) {
    return { success: false, error: `El tipo de archivo de ${label} no es valido` };
  }

  return { success: true };
}

function hasJpegSignature(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function hasPngSignature(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

export async function validateDonationReceiptFile(
  file: File | null | undefined,
): Promise<UploadValidationResult> {
  const validation = validateDonationUploadFile(file, "receipt");

  if (!validation.success) {
    return validation;
  }

  if (!(file instanceof File)) {
    return validation;
  }

  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const hasAllowedSignature =
    (file.type === "image/jpeg" && hasJpegSignature(bytes)) ||
    (file.type === "image/png" && hasPngSignature(bytes));

  if (!hasAllowedSignature) {
    return {
      success: false,
      error: "El comprobante debe ser una imagen JPG, JPEG o PNG valida",
    };
  }

  return { success: true };
}

export async function validateDonationInvoiceFile(
  file: File | null | undefined,
): Promise<UploadValidationResult> {
  const validation = validateDonationUploadFile(file, "invoice");

  if (!validation.success) {
    return validation;
  }

  if (!(file instanceof File)) {
    return validation;
  }

  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const hasAllowedSignature =
    (file.type === "image/jpeg" && hasJpegSignature(bytes)) ||
    (file.type === "image/png" && hasPngSignature(bytes));

  if (!hasAllowedSignature) {
    return {
      success: false,
      error: "La factura debe ser una imagen JPG, JPEG o PNG valida",
    };
  }

  return { success: true };
}

async function fileToDataUri(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  return `data:${file.type};base64,${base64}`;
}

function createUploadValidationError(error: string) {
  return new DonationServiceError({
    code: "UPLOAD_VALIDATION_ERROR",
    message: error,
    status: 400,
    details: { file: error },
  });
}

function createUploadError(message: string) {
  return new DonationServiceError({
    code: "UPLOAD_ERROR",
    message,
    status: 502,
  });
}

export async function uploadDonationCampaignPlaceImage(
  file: File,
): Promise<CloudinaryStoredAsset> {
  const validation = validateDonationUploadFile(file, "placeImage");

  if (!validation.success) {
    throw createUploadValidationError(validation.error);
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(await fileToDataUri(file), {
      folder: "donation-campaigns/places",
      resource_type: "image",
      transformation: [
        {
          crop: "fill",
          quality: 70,
          format: "auto",
          strip_metadata: true,
        },
      ],
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      originalName: file.name,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error("Error uploading donation campaign place image:", error);
    throw createUploadError("No se pudo subir la imagen del lugar");
  }
}

export async function uploadDonationReceipt(
  file: File,
): Promise<CloudinaryStoredAsset> {
  const validation = await validateDonationReceiptFile(file);

  if (!validation.success) {
    throw createUploadValidationError(validation.error);
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(await fileToDataUri(file), {
      folder: "donation-campaigns/receipts",
      resource_type: "image",
      type: "authenticated",
      access_mode: "authenticated",
      transformation: [
        {
          quality: 80,
          format: "auto",
          strip_metadata: true,
        },
      ],
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      originalName: file.name,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error("Error uploading donation receipt:", error);
    throw createUploadError("No se pudo subir el comprobante");
  }
}

export async function uploadDonationCampaignInvoiceImage(
  file: File,
): Promise<CloudinaryStoredAsset> {
  const validation = await validateDonationInvoiceFile(file);

  if (!validation.success) {
    throw createUploadValidationError(validation.error);
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(await fileToDataUri(file), {
      folder: "donation-campaigns/invoices",
      resource_type: "image",
      transformation: [
        {
          quality: 85,
          format: "auto",
          strip_metadata: true,
        },
      ],
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      originalName: file.name,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error("Error uploading donation campaign invoice:", error);
    throw createUploadError("No se pudo subir la factura");
  }
}

export async function destroyDonationAsset(
  publicId: string | null | undefined,
  resourceType = "image",
  type: "upload" | "authenticated" = "upload",
) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type,
    });
  } catch (error: unknown) {
    const cloudinaryError = error as { http_code?: number };

    if (cloudinaryError.http_code !== 404) {
      console.error("Error destroying donation asset:", error);
      throw createUploadError("No se pudo eliminar el archivo de Cloudinary");
    }
  }
}
