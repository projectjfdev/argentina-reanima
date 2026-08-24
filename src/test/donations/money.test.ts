import { validateMoneyAmount } from "@/libs/donations";
import { describe, expect, it } from "vitest";

describe("validateMoneyAmount", () => {
  it("normalizes Argentine decimal comma values", () => {
    expect(validateMoneyAmount("1234,50")).toEqual({
      success: true,
      data: {
        amount: "1234.50",
        cents: 123450,
      },
    });
  });

  it("normalizes thousand separators with decimal comma", () => {
    expect(validateMoneyAmount("$ 1.234.567,89")).toEqual({
      success: true,
      data: {
        amount: "1234567.89",
        cents: 123456789,
      },
    });
  });

  it("rejects zero by default", () => {
    expect(validateMoneyAmount("0")).toEqual({
      success: false,
      error: "El monto debe ser mayor a cero",
    });
  });

  it("allows zero when explicitly requested", () => {
    expect(validateMoneyAmount("0", { allowZero: true })).toEqual({
      success: true,
      data: {
        amount: "0.00",
        cents: 0,
      },
    });
  });

  it("rejects negative values", () => {
    expect(validateMoneyAmount("-10")).toEqual({
      success: false,
      error: "El monto debe ser mayor a cero",
    });
  });

  it("rejects values with more than two decimal places", () => {
    expect(validateMoneyAmount("10,999")).toEqual({
      success: false,
      error: "El monto no es valido",
    });
  });
});
