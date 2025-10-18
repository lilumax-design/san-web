import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" },
  providers: [
    Google, 
    Apple,  
    Credentials({
      name: "Email & Password",
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email;
        const password = parsed.data.password;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email!,
          name: user.name ?? null,
          image: user.image ?? null,
          role: user.role, 
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
    
      if (user) token.role = (user as any).role ?? "STUDENT";

      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      if (token?.role) (session.user as any).role = token.role; // ✅ роль в сессии
      return session;
    },
  },
};

export default config;
