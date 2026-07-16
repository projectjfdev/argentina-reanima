import { validateDonationPayload } from "@/libs/donations";
import { describe, expect, it } from "vitest";

describe("validateDonationPayload", () => {
  it("accepts an anonymous donation without public names", () => {
    expect(
      validateDonationPayload({
        campaignId: "1",
        visibility: "anonymous",
        firstName: "No debe persistir",
        lastName: "No debe persistir",
        email: " DONANTE@EXAMPLE.COM ",
      }),
    ).toEqual({
      success: true,
      data: {
        campaignId: 1,
        isAnonymous: true,
        firstName: null,
        lastName: null,
        email: "donante@example.com",
      },
    });
  });

  it("accepts a public donation with first and last name", () => {
    expect(
      validateDonationPayload({
        campaignId: 2,
        visibility: "public",
        firstName: "Ana",
        lastName: "Perez",
      }),
    ).toEqual({
      success: true,
      data: {
        campaignId: 2,
        isAnonymous: false,
        firstName: "Ana",
        lastName: "Perez",
        email: null,
      },
    });
  });

  it("requires first and last name for public donations", () => {
    expect(
      validateDonationPayload({
        campaignId: 1,
        visibility: "public",
      }),
    ).toEqual({
      success: false,
      errors: {
        firstName: "El nombre es obligatorio",
        lastName: "El apellido es obligatorio",
      },
    });
  });

  it("rejects invalid campaign, visibility and email", () => {
    expect(
      validateDonationPayload({
        campaignId: "0",
        visibility: "hidden",
        email: "mal-email",
      }),
    ).toEqual({
      success: false,
      errors: {
        campaignId: "La campana es obligatoria",
        visibility: "La visibilidad de la donacion no es valida",
        email: "El email no es valido",
      },
    });
  });
});
