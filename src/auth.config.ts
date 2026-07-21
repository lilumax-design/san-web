import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { verifyPassword } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/sign-in",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    Credentials({
      name: "Email & Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Пароль",
          type: "password",
        },
      },

      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user?.email || !user.passwordHash) {
          return null;
        }

        const passwordIsValid = await verifyPassword(
          password,
          user.passwordHash
        );

        if (!passwordIsValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? Role.STUDENT;
      }

      if (!token.role && token.sub) {
        const databaseUser = await prisma.user.findUnique({
          where: {
            id: token.sub,
          },
          select: {
            role: true,
          },
        });

        token.role = databaseUser?.role ?? Role.STUDENT;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      session.user.role = token.role ?? Role.STUDENT;

      return session;
    },
  },
};

export default config;