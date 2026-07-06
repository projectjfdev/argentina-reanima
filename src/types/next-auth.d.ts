import type { Role } from "@/generated/prisma";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      emailVerified: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    emailVerified: string | null;
  }
}
