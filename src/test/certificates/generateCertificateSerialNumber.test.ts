import {
  formatCertificateSerialNumber,
  generateNextCertificateSerialNumber,
  generateNextCertificateSerialNumbers,
} from "@/libs/certificates/generateCertificateSerialNumber";
import { describe, expect, it, vi } from "vitest";

function createSerialClient(serialNumbers: string[]) {
  const maxSerialValue = serialNumbers.reduce((maxValue, serialNumber) => {
    const match = /^AR-(\d+)$/.exec(serialNumber);
    return Math.max(maxValue, match ? Number(match[1]) : 0);
  }, 0);

  return {
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ maxSerialValue }]),
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

    expect(client.$executeRaw).toHaveBeenCalledTimes(1);
    expect(client.$queryRaw).toHaveBeenCalledTimes(1);
    expect(client.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
      client.$queryRaw.mock.invocationCallOrder[0],
    );
  });

  it("rejects invalid batch sizes", async () => {
    const client = createSerialClient([]);

    await expect(
      generateNextCertificateSerialNumbers(client as never, 0),
    ).rejects.toThrow("mayor a cero");
  });
});
