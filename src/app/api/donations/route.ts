import {
  createPendingDonationWithReceipt,
  DonationServiceError,
} from "@/libs/donations";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function getReceiptFile(formData: FormData) {
  const receipt = formData.get("receipt") ?? formData.get("comprobante");
  return receipt instanceof Blob && "name" in receipt ? (receipt as File) : null;
}

function serializeCreatedDonation(donation: {
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    isAnonymous: donation.isAnonymous,
    firstName: donation.firstName,
    lastName: donation.lastName,
    status: donation.status,
    createdAt: donation.createdAt.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const receiptFile = getReceiptFile(formData);

    if (formData.has("amount")) {
      return NextResponse.json(
        {
          message: "Datos invalidos",
          errors: { amount: "El monto lo ingresa un administrador al aprobar" },
          success: false,
        },
        { status: 400 },
      );
    }

    if (!receiptFile) {
      return NextResponse.json(
        {
          message: "Datos invalidos",
          errors: { receipt: "El comprobante es obligatorio" },
          success: false,
        },
        { status: 400 },
      );
    }

    const donation = await createPendingDonationWithReceipt(
      {
        campaignId: getFormString(formData, "campaignId"),
        visibility: getFormString(formData, "visibility"),
        firstName: getFormString(formData, "firstName"),
        lastName: getFormString(formData, "lastName"),
        email: getFormString(formData, "email"),
      },
      receiptFile,
    );

    revalidatePath("/donar");
    revalidatePath("/api/donation-campaigns/current");
    revalidatePath(`/api/donation-campaigns/${donation.campaignId}/donors`);

    return NextResponse.json(
      {
        message: "Donacion enviada correctamente",
        donation: serializeCreatedDonation(donation),
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DonationServiceError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
          errors: error.details,
          success: false,
        },
        { status: error.status },
      );
    }

    console.error("Error in POST /api/donations:", error);

    return NextResponse.json(
      { error: "Error interno del servidor", success: false },
      { status: 500 },
    );
  }
}
