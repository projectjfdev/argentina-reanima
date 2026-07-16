export type DonationCampaignStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type DonationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type DonationVisibility = "public" | "anonymous";

export interface DonationCampaignFormValues {
  institutionName: string;
  locality: string;
  address: string;
  goalAmount: string;
}

export interface DonationFormValues {
  campaignId: number;
  visibility: DonationVisibility;
  firstName?: string;
  lastName?: string;
  email?: string;
}
