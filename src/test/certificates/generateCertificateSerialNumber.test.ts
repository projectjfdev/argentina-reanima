import {
  formatCertificateSerialNumber,
  generateNextCertificateSerialNumber,
  generateNextCertificateSerialNumbers,
} from "@/libs/certificates/generateCertificateSerialNumber";
import { describe, expect, it, vi } from "vitest";

function createSerialClient(serialNumbers: string[]) {
  return {
    $executeRaw: vi.fn(),
    certificate: {
      findMany: vi.fn().mockResolvedValue(
        serialNumbers.map((serialNumber) => ({
          serialNumber,
        })),
      ),
    },
  };
}

describe("generateCertificateSerialNumber", () => {
  it("formats serial numbers with AR prefix and four digit padding", () => {
    expect(formatCertificateSerialNumber(1)).toBe("AR-0001");
    expect(formatCertificateSerialNumber(42)).toBe("AR-0042");
    expect(formatCertificateSerialNumber(10000)).toBe("AR-10000");
  });

  it("generates the next single serial number using the same batch helper", async () => {
    const client = createSerialClient(["AR-0001", "AR-0040"]);

    await expect(
      generateNextCertificateSerialNumber(client as never),
    ).resolves.toBe("AR-0041");

    expect(client.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it("generates consecutive serial numbers for a batch", async () => {
    const client = createSerialClient([
      "AR-0009",
      "AR-2026-9999",
      "AR-0010",
      "legacy-25",
    ]);

    await expect(
      generateNextCertificateSerialNumbers(client as never, 3),
    ).resolves.toEqual(["AR-0011", "AR-0012", "AR-0013"]);

    expect(client.certificate.findMany).toHaveBeenCalledWith({
      where: {
        serialNumber: {
          startsWith: "AR-",
        },
      },
      select: {
        serialNumber: true,
      },
    });
  });

  it("rejects invalid batch sizes", async () => {
    const client = createSerialClient([]);

    await expect(
      generateNextCertificateSerialNumbers(client as never, 0),
    ).rejects.toThrow("mayor a cero");
  });
});
