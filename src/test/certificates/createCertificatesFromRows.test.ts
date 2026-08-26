import { createCertificatesFromRows } from "@/libs/certificates/createCertificatesFromRows";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/libs/certificates/generateCertificatePublicId", () => ({
  generateCertificatePublicId: vi
    .fn()
    .mockReturnValueOnce("public-id-1")
    .mockReturnValueOnce("public-id-2")
    .mockReturnValueOnce("public-id-3")
    .mockReturnValueOnce("public-id-4")
    .mockReturnValueOnce("public-id-5")
    .mockReturnValueOnce("public-id-6"),
}));

const sharedData = {
  certificateText: "Certificamos a {{nombre}}",
  footerText: "Argentina Reanima",
  templateKey: "template_1" as const,
  instructorSignatureEnabled: true,
  instructorKey: "sergio-marcos",
  expiresAt: new Date("2027-01-01T00:00:00.000Z"),
};

function createRow(index: number, email = `user-${index}@example.com`) {
  return {
    rowNumber: index + 1,
    recipientName: `Persona ${index}`,
    recipientEmail: email,
    recipientEmailNormalized: email.toLowerCase(),
  };
}

function createClient(options: { failCreate?: boolean } = {}) {
  const createdAt = new Date("2026-08-26T12:00:00.000Z");
  const userFindMany = vi.fn().mockResolvedValue([
    {
      id: 10,
      name: "Usuario Existente",
      email: "existing@example.com",
    },
  ]);
  const tx = {
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ maxSerialValue: 40 }]),
    certificate: {
      createManyAndReturn: vi.fn().mockImplementation(({ data }) => {
        if (options.failCreate) {
          throw new Error("insert failed");
        }

        return Promise.resolve(
          data.map((certificate: Record<string, unknown>, index: number) => ({
            id: index + 1,
            ...certificate,
            status: "ACTIVE",
            createdAt,
            updatedAt: createdAt,
            deletedAt: null,
          })),
        );
      }),
    },
  };
  const transaction = vi.fn().mockImplementation((callback) => callback(tx));

  return {
    client: {
      user: {
        findMany: userFindMany,
      },
      $transaction: transaction,
    },
    tx,
    transaction,
    userFindMany,
  };
}

describe("createCertificatesFromRows", () => {
  it("creates a small import with one user lookup and one bulk insert", async () => {
    const { client, tx, userFindMany } = createClient();

    const result = await createCertificatesFromRows(
      [
        createRow(1, "existing@example.com"),
        createRow(2, "without-user@example.com"),
      ],
      sharedData,
      client as never,
    );

    expect(userFindMany).toHaveBeenCalledWith({
      where: {
        email: {
          in: ["existing@example.com", "without-user@example.com"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.certificate.createManyAndReturn).toHaveBeenCalledTimes(1);
    expect(result.serialNumbers).toEqual(["AR-0041", "AR-0042"]);
    expect(result.certificates).toHaveLength(2);
    expect(result.certificates[0]).toMatchObject({
      publicId: "public-id-1",
      serialNumber: "AR-0041",
      userId: 10,
      user: {
        id: 10,
        name: "Usuario Existente",
        email: "existing@example.com",
      },
    });
    expect(result.certificates[1]).toMatchObject({
      publicId: "public-id-2",
      serialNumber: "AR-0042",
      userId: null,
      user: null,
    });
  });

  it("creates a larger import with unique serial numbers and public ids", async () => {
    const { client, tx } = createClient();
    const rows = Array.from({ length: 4 }, (_item, index) =>
      createRow(index + 1),
    );

    const result = await createCertificatesFromRows(
      rows,
      sharedData,
      client as never,
    );
    const insertedRows = tx.certificate.createManyAndReturn.mock.calls[0]?.[0]
      .data;

    expect(result.serialNumbers).toEqual([
      "AR-0041",
      "AR-0042",
      "AR-0043",
      "AR-0044",
    ]);
    expect(new Set(result.serialNumbers).size).toBe(4);
    expect(
      new Set(insertedRows.map((row: { publicId: string }) => row.publicId))
        .size,
    ).toBe(4);
    expect(tx.certificate.createManyAndReturn).toHaveBeenCalledTimes(1);
  });

  it("lets the transaction roll back completely when the bulk insert fails", async () => {
    const { client, transaction } = createClient({ failCreate: true });

    await expect(
      createCertificatesFromRows([createRow(1)], sharedData, client as never),
    ).rejects.toThrow("insert failed");

    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
