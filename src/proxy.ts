import authMiddleware from "next-auth/middleware";

export const proxy = authMiddleware;

export const config = { matcher: ["/dashboard/:path*"] };
