export const cacheTags = {
  news: {
    list: "news:list",
    latest: "news:latest",
    detail: (id: number) => `news:detail:${id}`,
  },
  courses: {
    list: "courses:list",
    detail: (id: number) => `courses:detail:${id}`,
  },
  donationCampaigns: {
    current: "donation-campaigns:current",
    publicList: "donation-campaigns:public:list",
    detail: (id: number) => `donation-campaigns:detail:${id}`,
    progress: (id: number) => `donation-campaigns:progress:${id}`,
  },
  donations: {
    publicCampaign: (campaignId: number) =>
      `donations:public:campaign:${campaignId}`,
  },
} as const;
