import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database", // храним сессии в БД (у тебя есть модель Session)
  },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password || "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email!,
          name: user.name || null,
          image: user.image || null,
          // пробросим роль здесь — но официально она добавляется в callbacks.session ниже
          role: user.role,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    async session({ session, user, token }) {
      // при стратегии database объект user доступен
      if (session.user) {
        // @ts-expect-error кастомные поля
        session.user.id = user?.id ?? (token?.sub ?? null);
        // @ts-expect-error кастомные поля
        session.user.role = (user as any)?.role ?? (token as any)?.role ?? "STUDENT";
      }
      return session;
    },
    async jwt({ token, user }) {
      // для совместимости при first-login пробросим роль в jwt
      if (user) {
        (token as any).role = (user as any).role ?? "STUDENT";
      }
      return token;
    },
  },
});
