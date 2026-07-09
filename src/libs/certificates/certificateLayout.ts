export const CERTIFICATE_CANVAS = {
  width: 1494,
  height: 1053,
} as const;

export const CERTIFICATE_DYNAMIC_LAYOUT = {
  title: {
    leftPercent: 20,
    topPercent: 28,
    widthPercent: 60,
  },
  certificateText: {
    leftPercent: 15,
    topPercent: 38,
    widthPercent: 64,
  },
  footerText: {
    leftPercent: 11,
    bottomPercent: 14,
    widthPercent: 56,
  },
  institutionalText: {
    leftPercent: 19,
    bottomPercent: 4,
    widthPercent: 56,
  },
  qr: {
    leftPercent: 7,
    topPercent: 7,
    widthPercent: 9,
  },
  serialNumber: {
    leftPercent: 17,
    topPercent: 10,
    widthPercent: 28,
  },
} as const;

export const CERTIFICATE_PREVIEW_TEXT_STYLE = {
  title: {
    fontSize: "clamp(18px, 4vw, 46px)",
    lineHeight: 1.1,
    letterSpacing: "0.08em",
  },
  certificateText: {
    fontSize: "clamp(8px, 1.45vw, 18px)",
    lineHeight: 1.45,
  },
  footerText: {
    fontSize: "clamp(5px, 0.8vw, 10px)",
    lineHeight: 1.35,
  },
  serialNumber: {
    fontSize: "clamp(5px, 0.85vw, 10px)",
    lineHeight: 1.25,
  },
  slogan: {
    fontSize: "clamp(8px, 1.7vw, 20px)",
    lineHeight: 1,
  },
  organization: {
    fontSize: "clamp(5px, 0.9vw, 11px)",
    lineHeight: 1.1,
  },
} as const;
