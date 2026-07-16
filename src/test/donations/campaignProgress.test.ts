import { calculateCampaignProgress } from "@/libs/donations";
import { describe, expect, it } from "vitest";

describe("calculateCampaignProgress", () => {
  it("returns zero progress for a campaign without approved donations", () => {
    expect(
      calculateCampaignProgress({
        goalAmount: "2000000",
        approvedTotal: "0",
      }),
    ).toEqual({
      success: true,
      data: {
        goalAmount: "2000000.00",
        approvedTotal: "0.00",
        percentage: 0,
        visualPercentage: 0,
        isCompleted: false,
      },
    });
  });

  it("marks the campaign as completed when the goal is reached", () => {
    expect(
      calculateCampaignProgress({
        goalAmount: "2000000",
        approvedTotal: "2000000",
      }),
    ).toMatchObject({
      success: true,
      data: {
        percentage: 100,
        visualPercentage: 100,
        isCompleted: true,
      },
    });
  });

  it("keeps real overfunding and caps the visual percentage at 100", () => {
    expect(
      calculateCampaignProgress({
        goalAmount: "2000000",
        approvedTotal: "2500000",
      }),
    ).toEqual({
      success: true,
      data: {
        goalAmount: "2000000.00",
        approvedTotal: "2500000.00",
        percentage: 125,
        visualPercentage: 100,
        isCompleted: true,
      },
    });
  });
});

