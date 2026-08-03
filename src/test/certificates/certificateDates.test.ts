import { formatCertificateLongDate } from "@/libs/certificates";
import { describe, expect, it } from "vitest";

describe("formatCertificateLongDate", () => {
  it("formats a certificate expiration date as a long Spanish date", () => {
    expect(formatCertificateLongDate("2027-07-20")).toBe(
      "20 de Julio de 2027",
    );
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(formatCertificateLongDate("")).toBe("");
    expect(formatCertificateLongDate("2027-13-20")).toBe("");
    expect(formatCertificateLongDate(null)).toBe("");
  });
});
