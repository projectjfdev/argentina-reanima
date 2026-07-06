import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "ADMIN",
  },
  pages: {
    signIn: "/auth/login",
  },
});

export const config = { matcher: ["/dashboard/:path*"] };
