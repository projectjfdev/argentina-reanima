import { createValidationError, DonationServiceError } from "@/libs/donations";
import { describe, expect, it } from "vitest";

describe("DonationServiceError", () => {
  it("creates typed validation errors", () => {
    const error = createValidationError({ amount: "El monto es obligatorio" });

    expect(error).toBeInstanceOf(DonationServiceError);
    expect(error).toMatchObject({
      name: "DonationServiceError",
      code: "VALIDATION_ERROR",
      message: "Datos invalidos",
      status: 400,
      details: {
        amount: "El monto es obligatorio",
      },
    });
  });
});

