import { validateMoneyAmount } from "./money";

export type CampaignProgressInput = {
  goalAmount: unknown;
  approvedTotal: unknown;
};

export type CampaignProgressResult =
  | {
      success: true;
      data: {
        goalAmount: string;
        approvedTotal: string;
        percentage: number;
        visualPercentage: number;
        isCompleted: boolean;
      };
    }
  | { success: false; errors: Record<string, string> };

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCampaignProgress(
  input: CampaignProgressInput,
): CampaignProgressResult {
  const goalAmount = validateMoneyAmount(input.goalAmount);
  const approvedTotal = validateMoneyAmount(input.approvedTotal, {
    allowZero: true,
  });
  const errors: Record<string, string> = {};

  if (!goalAmount.success) {
    errors.goalAmount = goalAmount.error;
  }
  if (!approvedTotal.success) {
    errors.approvedTotal = approvedTotal.error;
  }

  if (!goalAmount.success || !approvedTotal.success) {
    return { success: false, errors };
  }

  const percentage = roundPercentage(
    (Number(approvedTotal.data.cents) / Number(goalAmount.data.cents)) * 100,
  );

  return {
    success: true,
    data: {
      goalAmount: goalAmount.data.amount,
      approvedTotal: approvedTotal.data.amount,
      percentage,
      visualPercentage: Math.min(percentage, 100),
      isCompleted: approvedTotal.data.cents >= goalAmount.data.cents,
    },
  };
}
