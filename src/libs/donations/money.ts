export const MAX_DONATION_AMOUNT_CENTS = BigInt("99999999999");
export const MAX_DONATION_AMOUNT = "999999999.99";
const CENTS_PER_UNIT = BigInt(100);
const ZERO_CENTS = BigInt(0);

export type MoneyValidationResult =
  | {
      success: true;
      data: {
        amount: string;
        cents: bigint;
      };
    }
  | { success: false; error: string };

type MoneyValidationOptions = {
  allowZero?: boolean;
};

function getMoneyText(value: unknown): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : "";
  }

  return typeof value === "string" ? value.trim() : "";
}

function normalizeSeparators(value: string): string {
  const cleanValue = value.replace(/\s/g, "").replace(/^\$/, "");
  const lastCommaIndex = cleanValue.lastIndexOf(",");
  const lastDotIndex = cleanValue.lastIndexOf(".");

  if (lastCommaIndex >= 0 && lastDotIndex >= 0) {
    const decimalSeparator = lastCommaIndex > lastDotIndex ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    return cleanValue
      .replaceAll(thousandsSeparator, "")
      .replace(decimalSeparator, ".");
  }

  if (lastCommaIndex >= 0) {
    return cleanValue.replaceAll(".", "").replace(",", ".");
  }

  const dotParts = cleanValue.split(".");

  if (dotParts.length > 2) {
    const lastPart = dotParts[dotParts.length - 1];

    if (lastPart.length <= 2) {
      return `${dotParts.slice(0, -1).join("")}.${lastPart}`;
    }

    return dotParts.join("");
  }

  if (dotParts.length === 2 && dotParts[1].length === 3) {
    return dotParts.join("");
  }

  return cleanValue;
}

export function validateMoneyAmount(
  value: unknown,
  options: MoneyValidationOptions = {},
): MoneyValidationResult {
  const rawValue = getMoneyText(value);

  if (!rawValue) {
    return { success: false, error: "El monto es obligatorio" };
  }

  if (/^-/.test(rawValue)) {
    return { success: false, error: "El monto debe ser mayor a cero" };
  }

  const normalizedValue = normalizeSeparators(rawValue);

  if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) {
    return { success: false, error: "El monto no es valido" };
  }

  const [integerPart, decimalPart = ""] = normalizedValue.split(".");
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";
  const paddedDecimal = decimalPart.padEnd(2, "0");
  const cents = BigInt(normalizedInteger) * CENTS_PER_UNIT + BigInt(paddedDecimal);

  if (cents < ZERO_CENTS || (!options.allowZero && cents === ZERO_CENTS)) {
    return { success: false, error: "El monto debe ser mayor a cero" };
  }

  if (cents > MAX_DONATION_AMOUNT_CENTS) {
    return {
      success: false,
      error: `El monto no puede superar ${MAX_DONATION_AMOUNT}`,
    };
  }

  return {
    success: true,
    data: {
      amount: `${normalizedInteger}.${paddedDecimal}`,
      cents,
    },
  };
}
