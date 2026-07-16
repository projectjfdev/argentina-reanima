import { validateDonationCampaignPayload } from "@/libs/donations";
import { describe, expect, it } from "vitest";

const VALID_CAMPAIGN_PAYLOAD = {
  institutionName: "Club San Martin",
  locality: "La Plata",
  address: "Calle 1 123",
  placeImageUrl: "https://res.cloudinary.com/demo/image/upload/place.jpg",
  placeImagePublicId: "donation-campaigns/places/place",
  goalAmount: "2.000.000,00",
};

describe("validateDonationCampaignPayload", () => {
  it("accepts a valid campaign payload", () => {
    expect(validateDonationCampaignPayload(VALID_CAMPAIGN_PAYLOAD)).toEqual({
      success: true,
      data: {
        institutionName: "Club San Martin",
        locality: "La Plata",
        address: "Calle 1 123",
        placeImageUrl: "https://res.cloudinary.com/demo/image/upload/place.jpg",
        placeImagePublicId: "donation-campaigns/places/place",
        goalAmount: "2000000.00",
      },
    });
  });

  it("rejects missing required fields", () => {
    expect(validateDonationCampaignPayload({})).toEqual({
      success: false,
      errors: {
        institutionName: "El nombre de la institucion es obligatorio",
        locality: "La localidad es obligatorio",
        address: "La direccion es obligatorio",
        placeImageUrl: "La imagen del lugar es obligatoria",
        placeImagePublicId: "El identificador de la imagen es obligatorio",
        goalAmount: "El monto es obligatorio",
      },
    });
  });

  it("rejects a zero goal amount", () => {
    expect(
      validateDonationCampaignPayload({
        ...VALID_CAMPAIGN_PAYLOAD,
        goalAmount: "0",
      }),
    ).toEqual({
      success: false,
      errors: {
        goalAmount: "El monto debe ser mayor a cero",
      },
    });
  });
});

