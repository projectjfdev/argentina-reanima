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
  "image/webp",
  "application/pdf",
]);

type UploadKind = "placeImage" | "receipt";

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
  return kind === "placeImage" ? "imagen del lugar" : "comprobante";
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
  const validation = validateDonationUploadFile(file, "receipt");

  if (!validation.success) {
    throw createUploadValidationError(validation.error);
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(await fileToDataUri(file), {
      folder: "donation-campaigns/receipts",
      resource_type: "auto",
      type: "authenticated",
      access_mode: "authenticated",
      transformation:
        file.type === "application/pdf"
          ? undefined
          : [
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
