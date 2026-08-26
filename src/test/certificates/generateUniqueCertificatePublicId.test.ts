import {
  generateUniqueCertificatePublicId,
  generateUniqueCertificatePublicIds,
} from "@/libs/certificates";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/libs/certificates/generateCertificatePublicId", () => ({
  generateCertificatePublicId: vi
    .fn()
    .mockReturnValueOnce("existing-public-id")
    .mockReturnValueOnce("reserved-public-id")
    .mockReturnValueOnce("new-public-id")
    .mockReturnValueOnce("bulk-1")
    .mockReturnValueOnce("bulk-1")
    .mockReturnValueOnce("bulk-2")
    .mockReturnValueOnce("bulk-3"),
}));

describe("generateUniqueCertificatePublicId", () => {
  it("skips existing and reserved public ids", async () => {
    const reservedPublicIds = new Set(["reserved-public-id"]);
    const client = {
      certificate: {
        findUnique: vi.fn().mockImplementation(({ where }) =>
          Promise.resolve(
            where.publicId === "existing-public-id" ? { id: 1 } : null,
          ),
        ),
      },
    };

    await expect(
      generateUniqueCertificatePublicId(client as never, reservedPublicIds),
    ).resolves.toBe("new-public-id");

    expect(reservedPublicIds.has("new-public-id")).toBe(true);
    expect(client.certificate.findUnique).toHaveBeenCalledTimes(2);
  });

  it("generates a batch of unique public ids without database checks", () => {
    expect(generateUniqueCertificatePublicIds(3)).toEqual([
      "bulk-1",
      "bulk-2",
      "bulk-3",
    ]);
  });
});
