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
    leftPercent: 11,
    topPercent: 38,
    widthPercent: 80,
  },
  footerText: {
    leftPercent: 16,
    bottomPercent: 12,
    widthPercent: 68,
  },
  instructorSignature: {
    leftPercent: 21,
    bottomPercent: 26,
    widthPercent: 18,
    heightPercent: 8,
  },
  instructorLabel: {
    leftPercent: 17,
    bottomPercent: 20,
    widthPercent: 26,
  },
  presidentSignature: {
    leftPercent: 60,
    bottomPercent: 26,
    widthPercent: 18,
    heightPercent: 8,
  },
  presidentLabel: {
    leftPercent: 56,
    bottomPercent: 20,
    widthPercent: 26,
  },
  institutionalText: {
    leftPercent: 19,
    bottomPercent: 6,
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
  expirationText: {
    leftPercent: 60,
    topPercent: 10,
    widthPercent: 32,
  },
} as const;

export const CERTIFICATE_PREVIEW_TEXT_STYLE = {
  title: {
    fontSize: "clamp(14px, 3.2vw, 37px)",
    // fontSize: "clamp(18px, 4vw, 46px)",
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
  signatureName: {
    fontSize: "clamp(6px, 1vw, 12px)",
    lineHeight: 1.15,
  },
  signatureRole: {
    fontSize: "clamp(5px, 0.8vw, 10px)",
    lineHeight: 1.15,
  },
  serialNumber: {
    fontSize: "clamp(5px, 0.85vw, 10px)",
    lineHeight: 1.25,
  },
  expirationText: {
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
