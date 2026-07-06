import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/libs/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password", placeholder: "*****" },
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.trim().toLowerCase();

        const userFound = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!userFound) {
          throw new Error("El usuario no existe");
        }

        if (!userFound.password) {
          throw new Error(
            "Esta cuenta no tiene contraseña local. Iniciá sesión con Google.",
          );
        }

        if (!userFound.emailVerified) {
          throw new Error(
            "Tenés que confirmar tu email antes de iniciar sesion.",
          );
        }

        const matchPassword = await bcrypt.compare(
          credentials.password,
          userFound.password,
        );

        if (!matchPassword) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: userFound.id.toString(),
          name: userFound.name,
          email: userFound.email,
          role: userFound.role,
          emailVerified: userFound.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();

      if (!email) {
        return false;
      }

      const googleProfile = profile as { email_verified?: boolean } | undefined;
      const googleEmailVerified = googleProfile?.email_verified === true;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const emailVerified =
          googleEmailVerified && !existingUser.emailVerified
            ? new Date()
            : existingUser.emailVerified;

        const dbUser =
          emailVerified !== existingUser.emailVerified
            ? await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified },
              })
            : existingUser;

        user.id = dbUser.id.toString();
        user.name = dbUser.name;
        user.email = dbUser.email;
        user.role = dbUser.role;
        user.emailVerified = dbUser.emailVerified;

        return true;
      }

      const dbUser = await prisma.user.create({
        data: {
          name: user.name || email,
          email,
          password: null,
          role: "USER",
          emailVerified: googleEmailVerified ? new Date() : null,
        },
      });

      user.id = dbUser.id.toString();
      user.name = dbUser.name;
      user.email = dbUser.email;
      user.role = dbUser.role;
      user.emailVerified = dbUser.emailVerified;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified?.toISOString() ?? null;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            emailVerified: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id.toString();
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
